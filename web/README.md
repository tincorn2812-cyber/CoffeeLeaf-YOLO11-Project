# CafeLeaf AI - Hệ thống Chẩn đoán Sâu bệnh Lá Cà phê YOLO11 & Quản lý Nông hộ

Hệ thống Web End-to-End xây dựng bằng **Java 21 + Spring Boot 3.5 + MySQL 8 (MySQL Workbench) + YOLO11 Hybrid AI**.

---

## 1. Cấu trúc thư mục chuẩn trong VS Code (`web/`)

```text
web/
├── .vscode/
│   ├── launch.json                      # Bấm F5 trong VS Code để chạy trực tiếp Spring Boot
│   └── tasks.json                       # Task chạy nhanh Server
├── python_bridge/
│   └── yolo_infer.py                    # Cầu nối gọi mô hình YOLO11 (best.pt) & vẽ khung nhận diện
├── src/main/
│   ├── java/com/cafeleaf/
│   │   ├── CafeLeafApplication.java     # Điểm khởi chạy chính (Main Class)
│   │   ├── config/
│   │   │   ├── WebConfig.java           # Cấu hình CORS & phục vụ ảnh quét (/uploads/**)
│   │   │   └── DataInitializer.java     # Tự động khởi tạo 5 lớp bệnh, tin tức & tài khoản mẫu vào MySQL
│   │   ├── entity/                      # 9 Bảng thực thể JPA ánh xạ vào MySQL (cafeleaf_db)
│   │   │   ├── User.java                # Bảng users (Tài khoản nông hộ)
│   │   │   ├── DiseaseInfo.java         # Bảng disease_info (5 lớp sâu bệnh chuẩn YOLO11)
│   │   │   ├── FarmLot.java             # Bảng farm_lots (Lô A, Lô B, Lô C)
│   │   │   ├── ScanRecord.java          # Bảng scan_records (Lịch sử quét AI & ảnh khoanh vùng)
│   │   │   ├── TreatmentProgress.java   # Bảng treatment_progress (Tiến độ các bước xử lý)
│   │   │   ├── JournalEntry.java        # Bảng journal_entries (Nhật ký vườn & ngày cách ly)
│   │   │   ├── YieldRecord.java         # Bảng yield_records (Sản lượng thu hoạch theo lô)
│   │   │   ├── NewsArticle.java         # Bảng news_articles (Tin tức giá cả, thời tiết, kỹ thuật)
│   │   │   └── ChatMessage.java         # Bảng chat_messages (Lịch sử hỏi đáp Trợ lý AI)
│   │   ├── repository/                  # Tầng truy vấn cơ sở dữ liệu Spring Data JPA
│   │   ├── service/                     # Tầng xử lý nghiệp vụ logic & AI
│   │   │   ├── AuthService.java         # Đăng ký, đăng nhập, băm mật khẩu SHA-256 + Salt
│   │   │   ├── YoloAiService.java       # Hybrid AI: YOLO11 (best.pt) + Java BufferedImage Vision
│   │   │   ├── FarmManagementService.java # Quản lý lô, phác đồ, nhật ký, sản lượng, xuất CSV
│   │   │   ├── WeatherService.java      # Dự báo mưa 7 ngày & giá cà phê theo tỉnh
│   │   │   └── AiChatbotService.java    # Trợ lý AI tư vấn theo dữ liệu vườn trong MySQL
│   │   └── controller/                  # Tầng REST API Controllers
│   │       ├── AuthController.java      # /api/auth/*
│   │       ├── ScanController.java      # /api/scan/*
│   │       ├── FarmController.java      # /api/farm/*
│   │       └── ChatController.java      # /api/chat/*
│   └── resources/
│       ├── application.properties       # Cấu hình kết nối MySQL (root/123456) & đường dẫn YOLO11
│       └── static/                      # Giao diện Frontend tách biệt gọn gàng
│           ├── index.html
│           ├── css/style.css
│           └── js/
│               ├── api.js               # Kết nối REST API tới Spring Boot
│               └── app.js               # Điều khiển giao diện & đồng bộ dữ liệu
├── mvnw.cmd                             # Maven Wrapper chạy ngay không cần cài đặt thêm
└── pom.xml                              # Khai báo thư viện Maven
```

---

## 2. Danh mục 5 lớp nhận diện (Đồng bộ với `data.yaml` của YOLO11)

1. **`leaf_rust`** — **Gỉ sắt (leaf rust)** (*Hemileia vastatrix*)
2. **`cercospora`** — **Đốm mắt cua (cercospora)** (*Cercospora coffeicola*)
3. **`leaf_miner`** — **Sâu đục lá (leaf miner)** (*Leucoptera coffeella*)
4. **`red_spider_mite`** — **Nhện đỏ (red spider mite)** (*Oligonychus coffeae*)
5. **`healthy`** — **Lá khoẻ mạnh (healthy)** (*Không bệnh*)

---

## 3. Thông tin kết nối MySQL Workbench & Tài khoản mẫu

- **Database:** `cafeleaf_db` (Tự động khởi tạo trên cổng `3306`, tài khoản `root` / mật khẩu `123456`)
- **Địa chỉ Web:** `http://localhost:8080`
- **Tài khoản mẫu có sẵn:**
  - **Tên đăng nhập / Email:** `nongdan` hoặc `nongdan@cafeleaf.vn`
  - **Mật khẩu:** `12345678`

---

## 4. Cách chạy dự án trong VS Code

- **Cách 1:** Mở thư mục `web` trong VS Code và nhấn **`F5`** (Run CafeLeaf Spring Boot Server).
- **Cách 2:** Chạy lệnh trong Terminal của VS Code:
  ```powershell
  .\mvnw.cmd spring-boot:run
  ```
