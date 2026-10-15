# BẢN TỔNG HỢP ĐẶC ĐIỂM NHẬN DẠNG CÁC LOẠI BỆNH TRÊN LÁ CÀ PHÊ
**Thực tập sinh:** Ngô Đào Trung Tín
**Đề tài:** Nhận diện bệnh lá cà phê bằng model YOLO cải tiến, phục vụ nông nghiệp thông minh

## 1. Lớp 0: Bệnh gỉ sắt (Leaf Rust)
* **Nguyên nhân:** Do nấm *Hemileia vastatrix* gây ra, phát triển mạnh trong điều kiện ẩm ướt, mưa nhiều.
* **Triệu chứng:** Mặt dưới lá xuất hiện các đốm nhỏ màu vàng nhạt, sau đó lớn dần và phủ một lớp bột màu vàng cam hoặc cam đỏ (bào tử nấm). Mặt trên lá tương ứng chuyển sang màu vàng nhạt.
* **Dấu hiệu nhận biết bằng mắt (Gán nhãn Bounding Box):** Các đốm tròn hoặc mảng không đều có màu cam rực/vàng phấn đặc trưng ở mặt dưới lá, ranh giới vết bệnh giai đoạn đầu đôi khi mờ nhạt.
* **Biện pháp phòng trị:** Cắt tỉa cành tạo độ thông thoáng, bón phân cân đối, phun thuốc gốc đồng hoặc hoạt chất Hexaconazole, Propiconazole khi bệnh chớm xuất hiện.

## 2. Lớp 1: Bệnh đốm mắt cua (Cercospora / Brown Eye Spot)
* **Nguyên nhân:** Do nấm *Cercospora coffeicola* gây ra, thường xuất hiện khi cây thiếu dinh dưỡng hoặc chịu ánh nắng trực tiếp quá gắt (thiếu cây che bóng).
* **Triệu chứng:** Vết bệnh ban đầu là những chấm nhỏ màu nâu sẫm, sau lan rộng thành hình tròn.
* **Dấu hiệu nhận biết bằng mắt (Gán nhãn Bounding Box):** Vết đốm tròn có cấu trúc đồng tâm rất rõ: tâm màu xám trắng hoặc nâu sáng, bao quanh bởi vòng viền màu nâu đỏ/nâu sẫm và ngoài cùng thường có quầng vàng (trông giống mắt cua).
* **Biện pháp phòng trị:** Duy trì cây che bóng hợp lý, bổ sung phân bón cân đối (đặc biệt là Đạm và Kali), phun thuốc trừ nấm chứa hoạt chất Mancozeb hoặc Carbendazim.

## 3. Lớp 2: Sâu đục lá (Leaf Miner)
* **Nguyên nhân:** Do ấu trùng của loài bướm nhỏ *Leucoptera coffeella* đục vào phần nhu mô dưới lớp biểu bì của lá cà phê.
* **Triệu chứng:** Ấu trùng ăn phần thịt lá bên trong làm lớp biểu bì mặt trên phồng rộp, tách rời và khô cháy.
* **Dấu hiệu nhận biết bằng mắt (Gán nhãn Bounding Box):** Các vết ngoằn ngoèo hoặc mảng lớn không có hình dạng cố định màu nâu khô/xám cháy trên mặt lá, lớp vỏ biểu bì mỏng bị bong tróc.
* **Biện pháp phòng trị:** Bảo vệ thiên địch tự nhiên (ong ký sinh), vệ sinh vườn, sử dụng thuốc trừ sâu sinh học Abamectin hoặc hoạt chất lưu dẫn khi mật độ sâu cao.

## 4. Lớp 3: Nhện đỏ (Red Spider Mite)
* **Nguyên nhân:** Do loài nhện nhỏ *Oligonychus ilicis* chích hút dịch tế bào trên bề mặt lá cà phê, bùng phát mạnh vào mùa khô nắng nóng.
* **Triệu chứng:** Lá bị chích hút mất diệp lục, bề mặt lá mất độ bóng tự nhiên và chuyển dần sang màu đồng thau hoặc vàng xỉn.
* **Dấu hiệu nhận biết bằng mắt (Gán nhãn Bounding Box):** Toàn bộ hoặc từng mảng lớn trên phiến lá ngả màu nâu đồng/vàng rỉ, bề mặt có nhiều chấm nhỏ li ti màu trắng xám và có thể kèm bụi tơ mịn dọc theo gân chính.
* **Biện pháp phòng trị:** Tưới phun mưa lên tán lá vào mùa khô để tăng độ ẩm và rửa trôi nhện, sử dụng thuốc đặc trị nhện chứa hoạt chất Pyridaben hoặc Fenpyroximate.

## 5. Lớp 4: Lá khoẻ mạnh (Healthy)
* **Nguyên nhân:** Cây sinh trưởng trong điều kiện dinh dưỡng và môi trường tối ưu, không bị nấm bệnh hay côn trùng tấn công.
* **Triệu chứng:** Lá phát triển hoàn chỉnh về kích thước và sắc tố.
* **Dấu hiệu nhận biết bằng mắt (Gán nhãn Bounding Box):** Phiến lá nguyên vẹn, màu xanh đậm và có độ bóng tự nhiên, gân lá nổi rõ, bề mặt hoàn toàn sạch sẽ không có đốm lạ hay vết cháy.
* **Biện pháp phòng trị:** Duy trì chế độ tưới tiêu, cắt tỉa và bón phân định kỳ theo chu kỳ sinh trưởng của cây cà phê.