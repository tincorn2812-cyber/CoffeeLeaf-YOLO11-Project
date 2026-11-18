package com.cafeleaf.service;

import com.cafeleaf.dto.ScanSummary;
import com.cafeleaf.entity.*;
import com.cafeleaf.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class FarmManagementService {

    @Value("${cafeleaf.upload.dir:uploads}")
    private String uploadDir;

    private final UserRepository userRepo;
    private final DiseaseInfoRepository diseaseRepo;
    private final FarmLotRepository lotRepo;
    private final ScanRecordRepository scanRepo;
    private final TreatmentProgressRepository treatRepo;
    private final JournalEntryRepository journalRepo;
    private final YieldRecordRepository yieldRepo;
    private final NewsArticleRepository newsRepo;
    private final ChatMessageRepository chatRepo;
    private final WeatherService weatherService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    public FarmManagementService(UserRepository userRepo,
                                 DiseaseInfoRepository diseaseRepo,
                                 FarmLotRepository lotRepo,
                                 ScanRecordRepository scanRepo,
                                 TreatmentProgressRepository treatRepo,
                                 JournalEntryRepository journalRepo,
                                 YieldRecordRepository yieldRepo,
                                 NewsArticleRepository newsRepo,
                                 ChatMessageRepository chatRepo,
                                 WeatherService weatherService) {
        this.userRepo = userRepo;
        this.diseaseRepo = diseaseRepo;
        this.lotRepo = lotRepo;
        this.scanRepo = scanRepo;
        this.treatRepo = treatRepo;
        this.journalRepo = journalRepo;
        this.yieldRepo = yieldRepo;
        this.newsRepo = newsRepo;
        this.chatRepo = chatRepo;
        this.weatherService = weatherService;
    }

    public Map<String, Object> buildBootstrapPayload(Long userId) {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản."));

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", u.getId());
        userMap.put("email", u.getEmail());
        userMap.put("un", u.getUsername());
        userMap.put("name", u.getFullName());
        userMap.put("phone", u.getPhone() == null ? "" : u.getPhone());
        userMap.put("prov", u.getProvince() == null ? "Đắk Lắk" : u.getProvince());
        userMap.put("role", u.getRole() == null ? "Nông dân" : u.getRole());
        userMap.put("ph", u.getAvatarData());

        // Diseases catalog
        List<Map<String, Object>> dsList = new ArrayList<>();
        for (DiseaseInfo d : diseaseRepo.findAllByOrderByDisplayOrderAsc()) {
            Map<String, Object> dm = new HashMap<>();
            dm.put("id", d.getId());
            dm.put("n", d.getName());
            dm.put("sci", d.getScientificName());
            dm.put("risk", d.getRiskLevel());
            dm.put("c", d.getColorHex());
            dm.put("why", d.getCauseWhy());
            dm.put("sym", d.getSymptoms());
            dm.put("pre", d.getPrevention());
            dm.put("st", d.getStepsList() != null ? Arrays.asList(d.getStepsList().split("\\|\\|")) : List.of());
            dsList.add(dm);
        }

        // Scan history (Dùng Projection tối ưu: loại bỏ LongText detectionsJson & giới hạn 500 bản ghi mới nhất)
        List<Map<String, Object>> hList = new ArrayList<>();
        Pageable limitPage = PageRequest.of(0, 500);
        for (ScanSummary r : scanRepo.findSummariesByUserId(userId, limitPage)) {
            Map<String, Object> hm = new HashMap<>();
            hm.put("id", r.getId());
            hm.put("d", r.getDiseaseId());
            hm.put("cf", r.getConfidence());
            hm.put("t", r.getScannedAt());
            String thumb = (r.getThumbnailBase64() != null && !r.getThumbnailBase64().isEmpty()) 
                    ? r.getThumbnailBase64() 
                    : (r.getAnnotatedUrl() != null ? r.getAnnotatedUrl() : r.getImageUrl());
            hm.put("th", thumb);
            hm.put("src", r.getAnnotatedUrl() != null ? r.getAnnotatedUrl() : r.getImageUrl());
            hm.put("rawSrc", r.getImageUrl());
            hm.put("lot", r.getLotIndex() == null ? 0 : r.getLotIndex());
            hm.put("note", r.getNote() == null ? "" : r.getNote());
            hm.put("mode", r.getAiMode() == null ? "yolo11" : r.getAiMode());
            hList.add(hm);
        }

        // Treatment progress map: { diseaseId: { stepIdx: true/false } }
        Map<String, Map<Integer, Boolean>> sMap = new HashMap<>();
        for (TreatmentProgress tp : treatRepo.findByUserId(userId)) {
            sMap.computeIfAbsent(tp.getDiseaseId(), k -> new HashMap<>())
                .put(tp.getStepIndex(), Boolean.TRUE.equals(tp.getCompleted()));
        }

        // Journal entries
        List<Map<String, Object>> jList = new ArrayList<>();
        for (JournalEntry j : journalRepo.findByUserIdOrderByRecordedAtDesc(userId)) {
            Map<String, Object> jm = new HashMap<>();
            jm.put("id", j.getId());
            jm.put("t", j.getRecordedAt());
            jm.put("txt", j.getContent());
            jm.put("days", j.getQuarantineDays());
            jm.put("auto", Boolean.TRUE.equals(j.getAutoLogged()) ? 1 : 0);
            jList.add(jm);
        }

        // Yield records
        List<Map<String, Object>> yList = new ArrayList<>();
        for (YieldRecord y : yieldRepo.findByUserIdOrderByRecordedAtDesc(userId)) {
            Map<String, Object> ym = new HashMap<>();
            ym.put("id", y.getId());
            ym.put("t", y.getRecordedAt());
            ym.put("lot", y.getLotIndex());
            ym.put("kg", y.getWeightKg());
            yList.add(ym);
        }

        // Chat messages: Lấy 30 tin nhắn mới nhất, sau đó đảo lại theo thứ tự thời gian tăng dần
        List<Map<String, Object>> chatList = new ArrayList<>();
        List<ChatMessage> recentMsgs = new ArrayList<>(chatRepo.findTop30ByUserIdOrderByCreatedAtDesc(userId));
        java.util.Collections.reverse(recentMsgs);
        for (ChatMessage c : recentMsgs) {
            Map<String, Object> cm = new HashMap<>();
            cm.put("r", c.getRole());
            cm.put("t", c.getText());
            chatList.add(cm);
        }

        // News articles
        List<Map<String, Object>> newsList = new ArrayList<>();
        for (NewsArticle n : newsRepo.findAll()) {
            Map<String, Object> nm = new HashMap<>();
            nm.put("id", n.getId());
            nm.put("cat", n.getCategory());
            nm.put("title", n.getTitle());
            nm.put("summary", n.getSummary());
            nm.put("content", n.getContent());
            nm.put("art", n.getArtType());
            newsList.add(nm);
        }

        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("h", hList);
        dataMap.put("s", sMap);
        dataMap.put("j", jList);
        dataMap.put("y", yList);
        dataMap.put("chat", chatList);
        dataMap.put("coop", u.getCooperativeName() == null ? "" : u.getCooperativeName());
        dataMap.put("cd", u.getCurrentDiseaseId() == null ? "leaf_rust" : u.getCurrentDiseaseId());
        dataMap.put("lot", u.getActiveLotIndex() == null ? 0 : u.getActiveLotIndex());

        Map<String, Object> root = new HashMap<>();
        root.put("user", userMap);
        root.put("data", dataMap);
        root.put("diseases", dsList);
        root.put("news", newsList);
        root.put("rain", weatherService.get7DayRainMm(u.getProvince()));
        root.put("coffeePrice", weatherService.getCoffeePriceForProvince(u.getProvince()));
        return root;
    }

    @Transactional
    public Map<String, Object> toggleTreatmentStep(Long userId, String diseaseId, Integer stepIndex) {
        TreatmentProgress tp = treatRepo
                .findByUserIdAndDiseaseIdAndStepIndex(userId, diseaseId, stepIndex)
                .orElseGet(() -> new TreatmentProgress(userId, diseaseId, stepIndex, false));

        boolean newState = !Boolean.TRUE.equals(tp.getCompleted());
        tp.setCompleted(newState);
        treatRepo.save(tp);

        JournalEntry autoEntry = null;
        if (newState) {
            DiseaseInfo d = diseaseRepo.findById(diseaseId).orElse(null);
            if (d != null && d.getStepsList() != null) {
                String[] steps = d.getStepsList().split("\\|\\|");
                if (stepIndex >= 0 && stepIndex < steps.length) {
                    String txt = "Đã làm: " + steps[stepIndex] + " (" + d.getName() + ")";
                    autoEntry = journalRepo.save(new JournalEntry(userId, txt, 0, true, System.currentTimeMillis()));
                }
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("completed", newState);
        if (autoEntry != null) {
            Map<String, Object> jm = new HashMap<>();
            jm.put("id", autoEntry.getId());
            jm.put("t", autoEntry.getRecordedAt());
            jm.put("txt", autoEntry.getContent());
            jm.put("days", autoEntry.getQuarantineDays());
            jm.put("auto", 1);
            res.put("journalEntry", jm);
        }
        return res;
    }

    @Transactional
    public void updateStatePreference(Long userId, String diseaseId, Integer lotIndex) {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản."));
        if (diseaseId != null && !diseaseId.isBlank()) {
            u.setCurrentDiseaseId(diseaseId);
        }
        if (lotIndex != null) {
            u.setActiveLotIndex(lotIndex);
        }
        userRepo.save(u);
    }

    @Transactional
    public void deleteScan(Long userId, Long scanId) {
        scanRepo.findByIdAndUserId(scanId, userId).ifPresent(rec -> {
            deletePhysicalFile(rec.getImageUrl());
            deletePhysicalFile(rec.getAnnotatedUrl());
            scanRepo.delete(rec);
        });
    }

    private void deletePhysicalFile(String url) {
        if (url == null || !url.startsWith("/uploads/")) return;
        try {
            String rel = url.substring("/uploads/".length());
            int qIdx = rel.indexOf('?');
            if (qIdx >= 0) rel = rel.substring(0, qIdx);
            Path p = Paths.get(uploadDir, rel).toAbsolutePath().normalize();
            Files.deleteIfExists(p);
        } catch (Exception ignored) {}
    }

    @Transactional
    public JournalEntry addJournal(Long userId, String txt, Integer days, boolean auto) {
        int cleanDays = days == null ? 0 : Math.max(0, Math.min(90, days));
        return journalRepo.save(new JournalEntry(userId, txt.trim(), cleanDays, auto, System.currentTimeMillis()));
    }

    @Transactional
    public YieldRecord addYield(Long userId, Integer lotIndex, Double kg) {
        int lot = lotIndex == null ? 0 : Math.max(0, Math.min(2, lotIndex));
        double weight = kg == null ? 0.0 : Math.max(1.0, kg);
        return yieldRepo.save(new YieldRecord(userId, lot, weight, System.currentTimeMillis()));
    }

    @Transactional
    public void updateCooperative(Long userId, String coopName) {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản."));
        u.setCooperativeName(coopName == null ? "" : coopName.trim());
        userRepo.save(u);
    }

    public String generateHistoryCsv(Long userId) {
        Map<String, DiseaseInfo> dMap = new HashMap<>();
        for (DiseaseInfo d : diseaseRepo.findAll()) dMap.put(d.getId(), d);
        String[] lots = {"Lô A", "Lô B", "Lô C"};

        StringBuilder sb = new StringBuilder("\ufeff");
        sb.append("\"Ngày\",\"Giờ\",\"Bệnh\",\"Tên khoa học\",\"Độ tin cậy %\",\"Lô\",\"Ghi chú AI\"\r\n");
        for (ScanRecord r : scanRepo.findByUserIdOrderByScannedAtDesc(userId)) {
            Instant inst = Instant.ofEpochMilli(r.getScannedAt());
            DiseaseInfo d = dMap.get(r.getDiseaseId());
            String dName = d != null ? d.getName() : r.getDiseaseId();
            String sci = d != null ? d.getScientificName() : "";
            int lotIdx = r.getLotIndex() != null && r.getLotIndex() >= 0 && r.getLotIndex() < 3 ? r.getLotIndex() : 0;
            sb.append(csvCell(DATE_FMT.format(inst))).append(",")
              .append(csvCell(TIME_FMT.format(inst))).append(",")
              .append(csvCell(dName)).append(",")
              .append(csvCell(sci)).append(",")
              .append(csvCell(String.valueOf(Math.round(r.getConfidence() * 100)))).append(",")
              .append(csvCell(lots[lotIdx])).append(",")
              .append(csvCell(r.getNote() == null ? "" : r.getNote()))
              .append("\r\n");
        }
        return sb.toString();
    }

    public String generateJournalCsv(Long userId) {
        StringBuilder sb = new StringBuilder("\ufeff");
        sb.append("\"Ngày\",\"Giờ\",\"Nội dung\",\"Số ngày cách ly\",\"Tự ghi\"\r\n");
        for (JournalEntry e : journalRepo.findByUserIdOrderByRecordedAtDesc(userId)) {
            Instant inst = Instant.ofEpochMilli(e.getRecordedAt());
            sb.append(csvCell(DATE_FMT.format(inst))).append(",")
              .append(csvCell(TIME_FMT.format(inst))).append(",")
              .append(csvCell(e.getContent())).append(",")
              .append(csvCell(String.valueOf(e.getQuarantineDays()))).append(",")
              .append(csvCell(Boolean.TRUE.equals(e.getAutoLogged()) ? "Có" : "Không"))
              .append("\r\n");
        }
        return sb.toString();
    }

    private String csvCell(String val) {
        if (val == null) val = "";
        // Chống CSV Formula Injection: nếu bắt đầu bằng dấu =, +, -, @, tab hoặc CR, chèn thêm ký tự nháy đơn
        if (!val.isEmpty()) {
            char first = val.charAt(0);
            if (first == '=' || first == '+' || first == '-' || first == '@' || first == '\t' || first == '\r') {
                val = "'" + val;
            }
        }
        return "\"" + val.replace("\"", "\"\"") + "\"";
    }
}