package com.cafeleaf.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.cafeleaf.entity.DiseaseInfo;
import com.cafeleaf.entity.JournalEntry;
import com.cafeleaf.entity.NewsArticle;
import com.cafeleaf.entity.User;
import com.cafeleaf.entity.YieldRecord;
import com.cafeleaf.repository.DiseaseInfoRepository;
import com.cafeleaf.repository.FarmLotRepository;
import com.cafeleaf.repository.JournalEntryRepository;
import com.cafeleaf.repository.NewsArticleRepository;
import com.cafeleaf.repository.UserRepository;
import com.cafeleaf.repository.YieldRecordRepository;
import com.cafeleaf.service.AuthService;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DiseaseInfoRepository diseaseRepo;
    private final NewsArticleRepository newsRepo;
    private final UserRepository userRepo;
    private final FarmLotRepository lotRepo;
    private final JournalEntryRepository journalRepo;
    private final YieldRecordRepository yieldRepo;
    private final AuthService authService;

    private static final String L = "theo nhãn thuốc, hỏi cán bộ khuyến nông";

    public DataInitializer(DiseaseInfoRepository diseaseRepo,
                        NewsArticleRepository newsRepo,
                        UserRepository userRepo,
                        FarmLotRepository lotRepo,
                        JournalEntryRepository journalRepo,
                        YieldRecordRepository yieldRepo,
                        AuthService authService) {
        this.diseaseRepo = diseaseRepo;
        this.newsRepo = newsRepo;
        this.userRepo = userRepo;
        this.lotRepo = lotRepo;
        this.journalRepo = journalRepo;
        this.yieldRepo = yieldRepo;
        this.authService = authService;
    }

    @Override
    public void run(String... args) {
        seedDiseases();
        seedNews();
        seedDemoFarmer();
    }

    private void seedDiseases() {
        List<DiseaseInfo> list = List.of(
            new DiseaseInfo(
                "leaf_rust",
                "Gỉ sắt (leaf rust)",
                "Hemileia vastatrix",
                "Cao",
                "#E8590C",
                "Nấm phát triển mạnh khi ẩm cao, giọt nước đọng lâu trên lá và tán vườn rậm rạp thiếu sáng.",
                "Đốm vàng nhạt trên mặt lá, mặt dưới có lớp bột vàng cam. Đốm lan rộng, lá khô và rụng sớm.",
                "Giữ vườn thông thoáng, bón cân đối N-P-K, tránh để lá ướt lâu.",
                String.join("||",
                    "Cắt tỉa cành cho vườn thông thoáng",
                    "Thu gom và tiêu hủy lá bệnh rơi rụng",
                    "Phun thuốc phòng trừ đúng loại, " + L,
                    "Bón phân cân đối N-P-K giúp cây phục hồi"
                ),
                1
            ),
            new DiseaseInfo(
                "cercospora",
                "Đốm mắt cua (cercospora)",
                "Cercospora coffeicola",
                "Trung bình",
                "#C2342B",
                "Hay gặp khi cây thiếu dinh dưỡng, thiếu nước, đất nghèo hữu cơ hoặc bị nắng gắt.",
                "Đốm tròn màu nâu gỉ sắt, tâm xám nhạt, viền nâu đậm xung quanh có quầng vàng như mắt cua.",
                "Che bóng hợp lý, tưới và bón đủ dinh dưỡng, không để cây thiếu nước và vi lượng.",
                String.join("||",
                    "Bón phân cân đối, bổ sung phân hữu cơ vi sinh",
                    "Tưới đủ nước, điều tiết che bóng hợp lý",
                    "Tỉa lá bệnh nặng và theo dõi lại sau vài ngày"
                ),
                2
            ),
            new DiseaseInfo(
                "leaf_miner",
                "Sâu đục lá (leaf miner)",
                "Leucoptera coffeella",
                "Cao",
                "#D97706",
                "Sâu non đục đường hầm ngoằn ngoèo trong phiến lá, ăn phần mô thịt làm lá khô cháy.",
                "Vệt ngoằn ngoèo màu trắng bạc hoặc mảng phồng rộp khô màu nâu do sâu đục mô lá, lá biến dạng và dễ rụng.",
                "Trồng cây che bóng, vệ sinh vườn sạch sẽ, hạn chế thuốc phổ rộng làm hại thiên địch.",
                String.join("||",
                    "Bảo vệ thiên địch tự nhiên (ong ký sinh)",
                    "Ngắt bỏ và tiêu hủy lá có sâu non đục",
                    "Dọn sạch tàn dư lá rụng quanh gốc cây",
                    "Phun thuốc đặc trị khi mật độ sâu hại cao, " + L
                ),
                3
            ),
            new DiseaseInfo(
                "red_spider_mite",
                "Nhện đỏ (red spider mite)",
                "Oligonychus coffeae",
                "Cao",
                "#DC2626",
                "Phát triển mạnh trong thời tiết khô nóng, chích hút nhựa làm mặt lá xám bạc và rụng.",
                "Vết chích nhỏ li ti làm mặt trên lá chuyển màu xám bạc hoặc loang lổ vàng đồng, có lớp tơ mỏng mịn.",
                "Tưới phun mưa tạo ẩm mùa khô, bảo tồn thiên địch, bón phân cân đối hạn chế thừa đạm.",
                String.join("||",
                    "Tưới phun mưa rửa trôi nhện trên tán lá trong mùa khô",
                    "Bảo tồn bọ rùa và nhện bắt mồi thiên địch",
                    "Phun dầu khoáng sinh học trừ nhện hại",
                    "Luân phiên thuốc đặc trị nhện khi mật độ cao, " + L
                ),
                4
            ),
            new DiseaseInfo(
                "healthy",
                "Lá khoẻ mạnh (healthy)",
                "Không bệnh",
                "Không",
                "#2F9E44",
                "Lá xanh tốt, không thấy dấu hiệu sâu bệnh hại trên lá này.",
                "Lá xanh tươi đều màu, bề mặt lá bóng mịn, không có đốm nấm hay vết cắn phá của sâu bọ.",
                "Kiểm tra vườn định kỳ, giữ vệ sinh vườn, bón phân hữu cơ cân đối hàng năm.",
                String.join("||",
                    "Tiếp tục theo dõi định kỳ vườn cây",
                    "Giữ vườn thông thoáng, bón phân cân đối",
                    "Tưới tiêu hợp lý duy trì sức đề kháng"
                ),
                5
            )
        );
        diseaseRepo.saveAll(list);
    }

    private void seedNews() {
        if (newsRepo.count() > 0) return;
        newsRepo.saveAll(List.of(
            new NewsArticle(
                "Giá",
                "Giá cà phê nhân xô Tây Nguyên duy trì đà tích cực tuần này",
                "Cập nhật giá thu mua tại Đắk Lắk, Lâm Đồng, Gia Lai từ 118.500 - 119.800 đ/kg.",
                "Giá cà phê nhân xô tại các tỉnh Tây Nguyên tiếp tục ổn định ở mức cao. Đắk Lắk và Đắk Nông giao dịch quanh mức 119.500 - 119.800 đ/kg, Gia Lai đạt 119.200 đ/kg và Lâm Đồng ở mức 118.500 đ/kg. Nông hộ nên thu hái chín trên 90% và phơi sấy đúng kỹ thuật để đạt phẩm cấp xuất khẩu tốt nhất.",
                "chart"
            ),
            new NewsArticle(
                "Thời tiết",
                "Mưa rải rác đầu tuần tại Tây Nguyên: Chú ý độ ẩm vườn cà phê",
                "Ẩm độ cao tạo điều kiện cho nấm gỉ sắt (leaf rust) và đốm mắt cua phát tán.",
                "Theo dự báo khí tượng nông nghiệp, khu vực Tây Nguyên có mưa rào rải rác vào chiều tối. Bà con cần khơi thông rãnh thoát nước, tỉa bớt cành tăm và chồi vượt để ánh nắng lọt vào tán cây, hạn chế bào tử nấm gỉ sắt (Hemileia vastatrix) nảy mầm trên mặt dưới lá.",
                "cloud"
            ),
            new NewsArticle(
                "Kỹ thuật",
                "Phòng trừ Sâu đục lá (leaf miner) và Nhện đỏ (red spider mite) mùa khô",
                "Nhận biết sớm vết đục ngoằn ngoèo và lớp tơ nhện đỏ để bảo vệ bộ lá quang hợp.",
                "Trong điều kiện nắng ấm xen kẽ khô hạn, sâu đục lá (Leucoptera coffeella) và nhện đỏ (Oligonychus coffeae) thường bùng phát mạnh. Bà con nên tưới phun mưa lên tán lá để rửa trôi nhện đỏ, bảo tồn ong ký sinh và bọ rùa thiên địch, đồng thời ngắt tiêu hủy sớm các lá có sâu non đang đục.",
                "leaf"
            ),
            new NewsArticle(
                "Kỹ thuật",
                "Kỹ thuật cắt tỉa tạo tán và bón phân phục hồi sau thu hoạch",
                "Giúp cây cà phê tái tạo cành dự trữ khỏe mạnh và hạn chế đốm mắt cua.",
                "Sau vụ thu hoạch, cây cà phê tiêu hao nhiều dinh dưỡng nên dễ nhiễm bệnh đốm mắt cua (Cercospora). Cần tiến hành cắt bỏ cành khô, cành sâu bệnh, kết hợp bón phân hữu cơ hoai mục cùng vôi nông nghiệp để cải tạo pH đất và kích thích rễ tơ phát triển.",
                "leaf"
            ),
            new NewsArticle(
                "Giá",
                "Tiêu chuẩn cà phê không gây mất rừng (EUDR) và truy xuất nguồn gốc QR",
                "Ghi chép nhật ký nông hộ và định vị lô vườn nâng cao giá trị hạt cà phê Việt.",
                "Các thị trường xuất khẩu lớn ngày càng yêu cầu khắt khe về hồ sơ canh tác minh bạch, tuân thủ thời gian cách ly thuốc bảo vệ thực vật và có mã QR truy xuất nguồn gốc cho từng lô vườn. Việc ghi nhật ký vườn đều đặn trên CafeLeaf giúp nhà vườn sẵn sàng đáp ứng tiêu chuẩn xuất khẩu.",
                "chart"
            ),
            new NewsArticle(
                "Thời tiết",
                "Bảo vệ cây cà phê giai đoạn nuôi trái trước các đợt nắng gắt",
                "Duy trì độ ẩm gốc và cây che bóng giúp giảm rụng trái non và cháy lá.",
                "Khi thời tiết nắng nóng kéo dài, bà con nên tận dụng xác thực vật tủ gốc giữ ẩm, duy trì mật độ cây che bóng (như muồng đen, sầu riêng, bơ) hợp lý để giảm nhiệt độ tán lá từ 2-4 độ C, giúp hạn chế nhện đỏ và đốm mắt cua.",
                "cloud"
            )
        ));
    }

    private void seedDemoFarmer() {
        if (userRepo.existsByEmailIgnoreCase("nongdan@cafeleaf.vn")) return;
        User demo = authService.createAccountInternal(
            "nongdan",
            "nongdan@cafeleaf.vn",
            "12345678",
            "Nguyễn Văn Hòa",
            "0912345678",
            "Đắk Lắk"
        );
        demo.setCooperativeName("HTX Cà Phê Bền Vững Buôn Ma Thuột");
        userRepo.save(demo);

        long now = System.currentTimeMillis();
        journalRepo.saveAll(List.of(
            new JournalEntry(demo.getId(), "Cắt tỉa cành thông thoáng tại Lô A và thu gom lá gỉ sắt rụng", 0, false, now - 86400000L * 2),
            new JournalEntry(demo.getId(), "Bón bổ sung phân hữu cơ vi sinh cho Lô B (500 kg)", 0, false, now - 86400000L * 5)
        ));
        yieldRepo.saveAll(List.of(
            new YieldRecord(demo.getId(), 0, 1450.0, now - 86400000L * 10),
            new YieldRecord(demo.getId(), 1, 1180.0, now - 86400000L * 9),
            new YieldRecord(demo.getId(), 2, 1620.0, now - 86400000L * 8)
        ));
    }
}