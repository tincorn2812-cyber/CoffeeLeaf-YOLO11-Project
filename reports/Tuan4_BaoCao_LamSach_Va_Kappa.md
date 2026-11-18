# BÁO CÁO LÀM SẠCH DỮ LIỆU, KHỬ TRÙNG LẶP pHASH VÀ CHỈ SỐ COHEN'S KAPPA (TUẦN 4 - MỐC M2)

## 1. Thống kê lọc chất lượng ảnh
- **Tổng số ảnh thô sau khi gộp (đã chuẩn hoá 640×640):** 18719 ảnh
- **Số ảnh bị loại do mờ (Laplacian variance < 60.0):** 644 ảnh
- **Số ảnh bị loại do trùng lặp/gần trùng (pHash distance <= 4):** 6924 ảnh
- **Tổng số ảnh sạch chính thức đưa vào sử dụng:** 4800 ảnh
  - Tập Train (80%): 3838 ảnh
  - Tập Val (10%): 478 ảnh
  - Tập Test (10%): 484 ảnh

## 2. Kiểm chứng tính nhất quán gán nhãn (Cohen's Kappa)
- **Số lượng mẫu kiểm định chéo 2 vòng:** 200 mẫu
- **Chỉ số Cohen's Kappa ($\kappa$):** **0.9458** (Đạt mức độ nhất quán Rất cao > 0.80)

## 3. Bảng phân bố Bounding Box theo lớp và theo tập

 Class ID    Tên lớp bệnh  Train BBoxes (80%)  Val BBoxes (10%)  Test BBoxes (10%)  Tổng BBoxes
        0       leaf_rust               20934              2182               2562        25678
        1      cercospora                4560               502                595         5657
        2      leaf_miner                7175               921                865         8961
        3 red_spider_mite                2011               234                243         2488
        4         healthy                 456                53                 51          560
