package com.cafeleaf.service;

import com.cafeleaf.entity.FarmLot;
import com.cafeleaf.entity.User;
import com.cafeleaf.repository.FarmLotRepository;
import com.cafeleaf.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.*;

// ============================================================================
// CAFELEAF AI - TẦNG DỊCH VỤ XÁC THỰC & BẢO MẬT (AUTH SERVICE)
// ============================================================================
// Chịu trách nhiệm:
// 1. Quản lý vòng đời tài khoản nông dân (Đăng ký, Đăng nhập, Đổi mật khẩu)
// 2. Bảo mật mật khẩu nhiều lớp: Giải mã Client Cipher -> Băm SHA-256 kèm Salt ngẫu nhiên
// 3. Khởi tạo nông trại số cho nông hộ (Tự động tạo 3 Lô vườn mặc định: Lô A, Lô B, Lô C)
// ============================================================================
@Service
public class AuthService {

    private final UserRepository userRepo;
    private final FarmLotRepository lotRepo;
    private final SecureRandom random = new SecureRandom();

    public AuthService(UserRepository userRepo, FarmLotRepository lotRepo) {
        this.userRepo = userRepo;
        this.lotRepo = lotRepo;
    }

    /**
     * CHỨC NĂNG 1: Sinh chuỗi muối bảo mật ngẫu nhiên (Salt Generator)
     * Thuyết trình: Mỗi tài khoản khi tạo sẽ có 1 chuỗi Salt riêng biệt 16 ký tự hex.
     * Dù 2 người dùng đặt cùng một mật khẩu, chuỗi băm trong CSDL vẫn hoàn toàn khác nhau,
     * chống lại kỹ thuật tấn công bảng băm tính trước (Rainbow Table Attack).
     */
    public String generateSalt() {
        byte[] bytes = new byte[8];
        random.nextBytes(bytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    /**
     * CHỨC NĂNG 2: Băm mật khẩu một chiều bằng thuật toán chuẩn SHA-256
     * Thuyết trình: Không bao giờ lưu mật khẩu gốc vào CSDL. Mật khẩu được kết hợp với Salt:
     * Hash = SHA-256(Salt + ":" + Password).
     */
    public String hashPassword(String password, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest((salt + ":" + password).getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    /**
     * CHỨC NĂNG 3: Khởi tạo tài khoản và tự động cấp phát 3 Lô vườn trong MySQL
     * Thuyết trình: Sử dụng @Transactional để đảm bảo tính toàn vẹn dữ liệu (ACID).
     * Khi tạo người dùng mới, hệ thống tự động gán vai trò "Nông dân" và tạo sẵn 3 lô đất:
     * - Lô A: Khu vực vườn chính
     * - Lô B: Khu vực sườn đồi
     * - Lô C: Khu vực gần hồ tưới
     */
    @Transactional
    public User createAccountInternal(String username, String email, String password,
                                      String fullName, String phone, String province) {
        String cleanUn = username.trim();
        String cleanEm = email.trim().toLowerCase();
        String salt = generateSalt();
        String hash = hashPassword(password, salt);

        User u = new User();
        u.setUsername(cleanUn);
        u.setEmail(cleanEm);
        u.setSalt(salt);
        u.setPasswordHash(hash);
        u.setFullName((fullName == null || fullName.isBlank()) ? cleanUn : fullName.trim());
        u.setPhone(phone == null ? "" : phone.trim());
        u.setProvince((province == null || province.isBlank()) ? "Đắk Lắk" : province.trim());
        u.setRole("Nông dân");
        u.setCurrentDiseaseId("leaf_rust");
        u.setActiveLotIndex(0);

        User saved = userRepo.save(u);
        lotRepo.saveAll(List.of(
            new FarmLot(saved.getId(), 0, "Lô A", "Khu vực vườn chính"),
            new FarmLot(saved.getId(), 1, "Lô B", "Khu vực sườn đồi"),
            new FarmLot(saved.getId(), 2, "Lô C", "Khu vực gần hồ tưới")
        ));
        return saved;
    }

    private static final String CLIENT_CIPHER_KEY = "CafeLeaf_Sec_Key_2026";

    /**
     * CHỨC NĂNG 4: Giải mã gói tin bảo mật gửi từ trình duyệt (Client Cipher Decoder)
     * Thuyết trình: Tiếp nhận chuỗi dạng "cfsec1$<nonce>$<hexCipher>$<sig>", bóc tách
     * nonce và dùng chung khóa động để phục hồi mật khẩu trước khi băm lưu vào CSDL.
     * Nếu là mật khẩu chưa mã hóa (từ API gọi thử), hệ thống vẫn tương thích ngược linh hoạt.
     */
    public String decodeClientSecret(String rawOrEncoded) {
        if (rawOrEncoded == null) return "";
        if (!rawOrEncoded.startsWith("cfsec1$")) {
            return rawOrEncoded;
        }
        try {
            // Định dạng: cfsec1$<8-hex-nonce>$<hex-cipher>$<16-hex-sig>
            String[] parts = rawOrEncoded.split("\\$");
            if (parts.length < 3) return rawOrEncoded;
            String nonce = parts[1];
            String hexCipher = parts[2];
            String keyStream = nonce + ":" + CLIENT_CIPHER_KEY;
            byte[] keyBytes = keyStream.getBytes(StandardCharsets.UTF_8);
            byte[] out = new byte[hexCipher.length() / 2];
            for (int i = 0; i < out.length; i++) {
                int b = Integer.parseInt(hexCipher.substring(i * 2, i * 2 + 2), 16);
                out[i] = (byte) (b ^ (keyBytes[i % keyBytes.length] & 0xFF));
            }
            return new String(out, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return rawOrEncoded;
        }
    }

    /**
     * CHỨC NĂNG 5: Kiểm tra tính sẵn sàng của Tên đăng nhập và Email
     * Thuyết trình: Phục vụ tính năng Real-time Validation ở giao diện. Khi người dùng nhập
     * đến đâu, API kiểm tra ngay trong CSDL và phản hồi xem đã bị người khác dùng hay chưa.
     */
    public Map<String, Object> checkAvailability(String username, String email) {
        Map<String, Object> res = new LinkedHashMap<>();
        boolean unTaken = (username != null && !username.isBlank()) && userRepo.existsByUsername(username.trim());
        boolean emTaken = (email != null && !email.isBlank()) && userRepo.existsByEmail(email.trim());
        res.put("usernameTaken", unTaken);
        res.put("emailTaken", emTaken);
        res.put("unTaken", unTaken);
        res.put("emTaken", emTaken);
        if (unTaken) {
            res.put("usernameMessage", "Tên đăng nhập \"" + username.trim() + "\" đã có người sử dụng.");
        }
        if (emTaken) {
            res.put("emailMessage", "Email \"" + email.trim() + "\" đã được đăng ký tài khoản.");
        }
        return res;
    }

    /**
     * CHỨC NĂNG 6: Đăng ký tài khoản với các tiêu chí tối ưu cho Nông dân
     * Thuyết trình:
     * - Tên đăng nhập: 3-20 ký tự không dấu (a-z, 0-9, ., _)
     * - Email: Chuẩn cú pháp email
     * - Mật khẩu: Tối thiểu 8 ký tự, gồm cả chữ cái và số (ví dụ: caphe1985)
     * - Số điện thoại: Chuẩn 10 số di động Việt Nam (03, 05, 07, 08, 09)
     * - Gắn nhãn lỗi cụ thể (field: "un", "email", "pw", "phone") để giao diện báo đỏ đúng ô.
     */
    @Transactional
    public User register(String username, String email, String rawOrEncodedPassword,
                         String fullName, String phone, String province) {
        String password = decodeClientSecret(rawOrEncodedPassword);
        String cleanUn = username == null ? "" : username.trim();
        String cleanEm = email == null ? "" : email.trim();
        String cleanPhone = phone == null ? "" : phone.trim();

        if (!cleanUn.matches("^[a-zA-Z0-9._]{3,20}$")) {
            throw new IllegalArgumentException("un|Tên đăng nhập phải từ 3–20 ký tự, chỉ gồm chữ không dấu (a-z), số (0-9), dấu chấm (.) hoặc gạch dưới (_).");
        }
        if (userRepo.existsByUsername(cleanUn)) {
            throw new IllegalArgumentException("un|Tên đăng nhập \"" + cleanUn + "\" đã được sử dụng. Vui lòng chọn tên khác.");
        }
        if (!cleanEm.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            throw new IllegalArgumentException("email|Địa chỉ email không đúng định dạng (ví dụ: tenban@gmail.com).");
        }
        if (userRepo.existsByEmail(cleanEm)) {
            throw new IllegalArgumentException("email|Email \"" + cleanEm + "\" đã được đăng ký tài khoản.");
        }
        if (password == null || password.length() < 8
                || !password.matches(".*[a-zA-Z].*")
                || !password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("pw|Mật khẩu cần tối thiểu 8 ký tự, gồm cả chữ cái và chữ số.");
        }
        if (!cleanPhone.isEmpty() && !cleanPhone.matches("^0[35789][0-9]{8}$")) {
            throw new IllegalArgumentException("phone|Số điện thoại phải gồm đúng 10 chữ số hợp lệ (bắt đầu bằng 03, 05, 07, 08, 09), không chứa chữ cái.");
        }
        return createAccountInternal(cleanUn, cleanEm, password, fullName, cleanPhone, province);
    }

    /**
     * CHỨC NĂNG 7: Xác thực đăng nhập linh hoạt (Hỗ trợ cả Email lẫn Tên đăng nhập)
     * Thuyết trình: Nông dân có thể đăng nhập bằng email (ngoclinh@gmail.com) hoặc bằng tên đăng nhập (ngoclinh).
     * Hệ thống tự động tìm bản ghi, lấy Salt của người dùng đó để băm mật khẩu nhập vào,
     * rồi so sánh chuỗi băm để xác thực an toàn tuyệt đối.
     */
    @Transactional
    public User login(String identifier, String rawOrEncodedPassword) {
        String password = decodeClientSecret(rawOrEncodedPassword);
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("id|Vui lòng nhập email hoặc tên đăng nhập.");
        }
        String id = identifier.trim().toLowerCase();
        Optional<User> opt = userRepo.findByEmail(id);
        if (opt.isEmpty()) {
            opt = userRepo.findByUsername(id);
        }
        User user = opt.orElseThrow(() ->
            new IllegalArgumentException("id|Không tìm thấy tài khoản \"" + identifier.trim() + "\". Hãy kiểm tra lại hoặc tạo tài khoản mới.")
        );

        String expectedHash = hashPassword(password == null ? "" : password, user.getSalt());
        if (!expectedHash.equals(user.getPasswordHash())) {
            throw new IllegalArgumentException("pw|Mật khẩu chưa đúng. Vui lòng kiểm tra lại.");
        }
        return user;
    }

    @Transactional
    public User updateProfile(Long userId, String fullName, String username, String phone, String province, String avatarData) {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));
        if (fullName != null && !fullName.isBlank()) {
            u.setFullName(fullName.trim());
        }
        if (username != null && !username.isBlank() && !username.equalsIgnoreCase(u.getUsername())) {
            if (userRepo.existsByUsername(username.trim())) {
                throw new IllegalArgumentException("Tên đăng nhập đã được sử dụng.");
            }
            u.setUsername(username.trim());
        }
        if (phone != null) {
            u.setPhone(phone.trim());
        }
        if (province != null && !province.isBlank()) {
            u.setProvince(province.trim());
        }
        if (avatarData != null && !avatarData.isBlank()) {
            u.setAvatarData(avatarData);
        }
        return userRepo.save(u);
    }

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Mật khẩu mới cần tối thiểu 8 ký tự.");
        }
        if (oldPassword != null && !oldPassword.isBlank()) {
            String oldHash = hashPassword(oldPassword, u.getSalt());
            if (!oldHash.equals(u.getPasswordHash())) {
                throw new IllegalArgumentException("Mật khẩu hiện tại không đúng.");
            }
        }
        String newSalt = generateSalt();
        u.setSalt(newSalt);
        u.setPasswordHash(hashPassword(newPassword, newSalt));
        userRepo.save(u);
    }

    public List<Map<String, String>> listQuickAccounts() {
        List<Map<String, String>> out = new ArrayList<>();
        for (com.cafeleaf.dto.UserQuickSummary u : userRepo.findAllQuickSummaries()) {
            Map<String, String> m = new HashMap<>();
            m.put("email", u.getEmail());
            m.put("un", u.getUsername());
            m.put("name", u.getFullName());
            m.put("prov", u.getProvince());
            out.add(m);
        }
        return out;
    }
}