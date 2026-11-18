package com.cafeleaf.service;

import com.cafeleaf.entity.*;
import com.cafeleaf.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AiChatbotService {

    private final UserRepository userRepo;
    private final ScanRecordRepository scanRepo;
    private final DiseaseInfoRepository diseaseRepo;
    private final JournalEntryRepository journalRepo;
    private final ChatMessageRepository chatRepo;
    private final WeatherService weatherService;

    private static final String SAFE_RULE = "theo nhãn thuốc, hỏi cán bộ khuyến nông";
    private static final DateTimeFormatter DM_FMT = DateTimeFormatter.ofPattern("dd/MM")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    public AiChatbotService(UserRepository userRepo,
                            ScanRecordRepository scanRepo,
                            DiseaseInfoRepository diseaseRepo,
                            JournalEntryRepository journalRepo,
                            ChatMessageRepository chatRepo,
                            WeatherService weatherService) {
        this.userRepo = userRepo;
        this.scanRepo = scanRepo;
        this.diseaseRepo = diseaseRepo;
        this.journalRepo = journalRepo;
        this.chatRepo = chatRepo;
        this.weatherService = weatherService;
    }

    @Transactional
    public Map<String, Object> askAssistant(Long userId, String question) {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));
        String q = question == null ? "" : question.trim();
        if (q.isEmpty()) {
            throw new IllegalArgumentException("Câu hỏi không được để trống.");
        }

        long now = System.currentTimeMillis();
        chatRepo.save(new ChatMessage(userId, "u", q, now));

        String answer = generateSmartAnswer(u, q);
        ChatMessage botMsg = chatRepo.save(new ChatMessage(userId, "b", answer, now + 1));

        Map<String, Object> res = new HashMap<>();
        res.put("r", "b");
        res.put("t", botMsg.getText());
        res.put("time", botMsg.getCreatedAt());
        return res;
    }

    private final Map<String, DiseaseInfo> diseaseCache = new ConcurrentHashMap<>();
    private volatile long lastDiseaseCacheTime = 0L;

    private Map<String, DiseaseInfo> getCachedDiseases() {
        long now = System.currentTimeMillis();
        if (diseaseCache.isEmpty() || (now - lastDiseaseCacheTime > 600_000L)) {
            Map<String, DiseaseInfo> fresh = new HashMap<>();
            for (DiseaseInfo d : diseaseRepo.findAll()) {
                fresh.put(d.getId(), d);
            }
            diseaseCache.clear();
            diseaseCache.putAll(fresh);
            lastDiseaseCacheTime = now;
        }
        return diseaseCache;
    }

    private String generateSmartAnswer(User u, String rawQ) {
        String q = rawQ.toLowerCase(Locale.ROOT);
        Map<String, DiseaseInfo> dMap = getCachedDiseases();
        DiseaseInfo currentD = dMap.getOrDefault(u.getCurrentDiseaseId(), dMap.get("leaf_rust"));

        if (q.contains("gần nhất") || q.contains("bệnh của tôi") || q.contains("kết quả")) {
            List<ScanRecord> latestList = scanRepo.findByUserIdOrderByScannedAtDesc(u.getId(), PageRequest.of(0, 1));
            ScanRecord latest = latestList.isEmpty() ? null : latestList.get(0);
            if (latest == null) {
                return "Bạn chưa có lần quét nào trong cơ sở dữ liệu. Hãy mở mục Chẩn đoán và chụp 1 chiếc lá cà phê trước nhé.";
            }
            DiseaseInfo ld = dMap.getOrDefault(latest.getDiseaseId(), currentD);
            if (ld == null) {
                return "Lần quét gần nhất tại Lô " + (char)('A' + (latest.getLotIndex() != null ? latest.getLotIndex() : 0))
                     + " (không xác định được bệnh). Hãy mở mục Xử lý để xem thêm.";
            }
            String lotName = "Lô " + (char) ('A' + (latest.getLotIndex() != null ? latest.getLotIndex() : 0));
            return String.format(
                "Lần quét gần nhất tại %s: %s (%s), độ tin cậy %d%% (%s). Bạn hãy mở mục Xử lý để xem các bước phòng trừ chi tiết.",
                lotName, ld.getName(), ld.getScientificName(),
                Math.round(latest.getConfidence() * 100),
                ld.getSymptoms()
            );
        }

        if (q.contains("phun") || q.contains("thời tiết") || q.contains("mưa")) {
            List<Integer> rain = weatherService.get7DayRainMm(u.getProvince());
            int todayRain = (rain != null && !rain.isEmpty() && rain.get(0) != null) ? rain.get(0) : 0;
            if (todayRain >= 5) {
                return String.format(
                    "Tại %s hôm nay dự báo mưa khoảng %d mm (>= 5 mm), nước mưa dễ rửa trôi thuốc. Bạn nên tránh phun hôm nay, ưu tiên tỉa cành thông thoáng vườn.",
                    u.getProvince(), todayRain
                );
            }
            return String.format(
                "Thời tiết tại %s hôm nay dự báo mưa thấp (%d mm), thuận lợi để phun phòng trừ. Lưu ý nguyên tắc 4 đúng và dùng thuốc %s.",
                u.getProvince(), todayRain, SAFE_RULE
            );
        }

        if (q.contains("chụp") || q.contains("ảnh") || q.contains("mẹo")) {
            return "Mẹo chụp chuẩn AI: Chụp 1 chiếc lá rõ nét, đủ ánh sáng tự nhiên, giữ điện thoại thẳng góc cách lá 15-25 cm, chụp rõ mặt có đốm bệnh (đặc biệt mặt dưới ).";
        }

        if (q.contains("thu hoạch") || q.contains("cách ly")) {
            Long maxSafeTime = getHarvestSafeTimestamp(u.getId());
            if (maxSafeTime != null && maxSafeTime > System.currentTimeMillis()) {
                return "Theo Nhật ký vườn trong hệ thống, vườn đang trong thời gian cách ly thuốc. Chưa nên thu hoạch trước ngày "
                        + DM_FMT.format(Instant.ofEpochMilli(maxSafeTime)) + " để đảm bảo an toàn dư lượng.";
            }
            return "Hiện tại Nhật ký vườn không có lô nào đang trong thời gian cách ly thuốc. Nếu mới phun thuốc, bạn nhớ ghi số ngày cách ly " + SAFE_RULE + " vào Nhật ký nhé.";
        }

        if (q.contains("gỉ sắt") || q.contains("rỉ sắt") || q.contains("leaf rust")) {
            DiseaseInfo d = dMap.get("leaf_rust");
            return d != null ? (d.getName() + ": " + d.getSymptoms() + " Cách phòng trị: " + d.getPrevention() + " Dùng thuốc " + SAFE_RULE + ".") : "";
        }
        if (q.contains("mắt cua") || q.contains("cercospora")) {
            DiseaseInfo d = dMap.get("cercospora");
            return d != null ? (d.getName() + ": " + d.getSymptoms() + " Cách phòng trị: " + d.getPrevention()) : "";
        }
        if (q.contains("sâu đục lá") || q.contains("leaf miner") || q.contains("vẽ bùa")) {
            DiseaseInfo d = dMap.get("leaf_miner");
            return d != null ? (d.getName() + ": " + d.getSymptoms() + " Cách phòng trị: " + d.getPrevention()) : "";
        }
        if (q.contains("nhện đỏ") || q.contains("spider mite")) {
            DiseaseInfo d = dMap.get("red_spider_mite");
            return d != null ? (d.getName() + ": " + d.getSymptoms() + " Cách phòng trị: " + d.getPrevention()) : "";
        }
        if (q.contains("giá")) {
            return "Giá cà phê tham khảo hôm nay tại " + u.getProvince() + ": " + weatherService.getCoffeePriceForProvince(u.getProvince()) + ".";
        }

        return String.format(
            "Bạn đang theo dõi %s tại %s. Nguyên nhân: %s Về thuốc bảo vệ thực vật và liều lượng, bà con luôn tuân thủ '%s'.",
            currentD != null ? currentD.getName() : "vườn cà phê",
            u.getProvince(),
            currentD != null ? currentD.getCauseWhy() : "",
            SAFE_RULE
        );
    }

    public Long getHarvestSafeTimestamp(Long userId) {
        List<JournalEntry> entries = journalRepo.findByUserIdOrderByRecordedAtDesc(userId);
        long maxTime = 0;
        for (JournalEntry e : entries) {
            if (e.getQuarantineDays() != null && e.getQuarantineDays() > 0) {
                long end = e.getRecordedAt() + e.getQuarantineDays() * 86400_000L;
                if (end > maxTime) maxTime = end;
            }
        }
        return maxTime > System.currentTimeMillis() ? maxTime : null;
    }
}