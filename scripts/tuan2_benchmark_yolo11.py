import time
import torch
import numpy as np
import pandas as pd
from ultralytics import YOLO

def run_week2_evaluation():
    device = 0 if torch.cuda.is_available() else 'cpu'
    hw_name = torch.cuda.get_device_name(0) if device == 0 else "CPU Local"
    print(f"Đang thực hiện đo đạc trên phần cứng: {hw_name}\n")

    # Danh sách các mô hình cần đánh giá
    all_variants = ["yolo11n.pt", "yolo11s.pt", "yolo11m.pt", "yolo11l.pt", "yolo11x.pt"]
    latency_variants = ["yolo11n.pt", "yolo11s.pt", "yolo11m.pt"]

    # Tạo ảnh giả lập 640x640 để đo tốc độ đồng nhất
    dummy_img = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
    results_table = []

    for weight_name in all_variants:
        print(f"--- Đang xử lý mô hình: {weight_name} ---")
        model = YOLO(weight_name)
        
        # Lấy thông số mô hình (Xử lý an toàn cho Ultralytics 8.4+)
        info = model.info(verbose=False)
        
        if isinstance(info, (list, tuple)) and len(info) >= 4:
            layers, params, gradients, flops = info[:4]
            params_m = round(params / 1e6, 2)
            flops_b = round(flops, 2)
        else:
            # Fallback tính toán thủ công nếu thư viện trả về None
            params = sum(p.numel() for p in model.model.parameters())
            params_m = round(params / 1e6, 2)
            layers = "N/A"
            flops_b = "N/A"

        p50_ms, p95_ms, fps_p50 = "N/A", "N/A", "N/A"

        # Nếu thuộc nhóm N/S/M thì đo Latency
        if weight_name in latency_variants:
            print(f" -> Đang chạy Warm-up 10 lần cho {weight_name}...")
            for _ in range(10):
                _ = model.predict(dummy_img, imgsz=640, device=device, verbose=False)
            
            if device == 0:
                torch.cuda.synchronize()

            print(f" -> Đang đo Latency thực tế (100 vòng lặp)...")
            latencies = []
            for _ in range(100):
                if device == 0:
                    torch.cuda.synchronize()
                t0 = time.perf_counter()
                
                _ = model.predict(dummy_img, imgsz=640, device=device, verbose=False)
                
                if device == 0:
                    torch.cuda.synchronize()
                t1 = time.perf_counter()
                latencies.append((t1 - t0) * 1000)

            # Báo cáo theo P50 và P95 theo đúng yêu cầu đề tài
            p50_val = np.percentile(latencies, 50)
            p95_val = np.percentile(latencies, 95)
            p50_ms = round(p50_val, 2)
            p95_ms = round(p95_val, 2)
            fps_p50 = round(1000.0 / p50_val, 1)

        results_table.append({
            "Model": weight_name.replace(".pt", "").upper(),
            "Layers": layers,
            "Parameters (M)": params_m,
            "GFLOPs": flops_b,
            "Latency P50 (ms)": p50_ms,
            "Latency P95 (ms)": p95_ms,
            "FPS (tại P50)": fps_p50,
            "Phần cứng": hw_name if weight_name in latency_variants else "Chỉ lấy thông số"
        })

    # Xuất dữ liệu ra file CSV
    df = pd.DataFrame(results_table)
    print("\n" + "="*80)
    print("BẢNG KẾT QUẢ THỰC NGHIỆM TUẦN 2 (YOLO11 N/S/M/L/X)")
    print("="*80)
    print(df.to_string(index=False))
    
    output_csv = "reports/Tuan2_KetQua_DoThucTe_YOLO11.csv"
    df.to_csv(output_csv, index=False, encoding="utf-8-sig")
    print(f"\n-> Đã xuất bảng số liệu ra file: {output_csv}")

if __name__ == "__main__":
    run_week2_evaluation()