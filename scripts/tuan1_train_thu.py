import platform
import torch
import psutil
from ultralytics import YOLO
from datetime import datetime

def check_hardware():
    print("="*50)
    print("THÔNG TIN PHẦN CỨNG MÁY CÁ NHÂN (LENOVO LOQ 15IAX9E)")
    print("="*50)
    print(f"Hệ điều hành : {platform.system()} {platform.release()}")
    print(f"Vi xử lý CPU : {platform.processor()}")
    print(f"Tổng dung lượng RAM: {round(psutil.virtual_memory().total / (1024**3), 2)} GB")
    
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        vram = round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2)
        print(f"Card đồ họa GPU: {gpu_name} (VRAM: {vram} GB)")
        device = 0
    else:
        print("Card đồ họa GPU: Không tìm thấy CUDA, đang dùng CPU")
        device = 'cpu'
    print("="*50)
    return device

def run_test_training(device):
    # Cấu hình chuẩn để ghi vào Nhật ký thí nghiệm
    config = {
        "model": "yolo11n.pt",
        "data": "coco8.yaml", # Dataset siêu nhẹ tích hợp sẵn để test môi trường
        "epochs": 3,
        "imgsz": 640,
        "batch": 16,
        "optimizer": "SGD",
        "lr0": 0.01,
        "seed": 42,
        "device": device
    }
    
    print("\n[BẮT ĐẦU] Chạy lệnh train thử với YOLO11n...")
    model = YOLO(config["model"])
    
    # Chạy lệnh train thử
    results = model.train(
        data=config["data"],
        epochs=config["epochs"],
        imgsz=config["imgsz"],
        batch=config["batch"],
        optimizer=config["optimizer"],
        lr0=config["lr0"],
        seed=config["seed"],
        device=config["device"],
        project="runs/tuan1_test",
        name="yolo11n_test_run",
        exist_ok=True
    )
    
    # Tự động ghi vào Nhật ký thí nghiệm (Bắt buộc theo Mục 4)
    log_entry = (
        f"\n--- NHẬT KÝ THÍ NGHIỆM: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---\n"
        f"Mục đích : Chạy train thử nghiệm kiểm tra môi trường Tuần 1\n"
        f"Mô hình  : {config['model']}\n"
        f"Cấu hình : epochs={config['epochs']}, imgsz={config['imgsz']}, batch={config['batch']}, "
        f"optimizer={config['optimizer']}, lr0={config['lr0']}\n"
        f"Seed     : {config['seed']}\n"
        f"Phần cứng: {torch.cuda.get_device_name(0) if device == 0 else 'CPU'}\n"
        f"Kết quả  : mAP50 = {results.box.map50:.4f}, mAP50-95 = {results.box.map:.4f}\n"
    )
    
    with open("logs/nhat_ky_thi_nghiem.txt", "a", encoding="utf-8") as f:
        f.write(log_entry)
        
    print(log_entry)
    print("-> Đã lưu tự động vào file: logs/nhat_ky_thi_nghiem.txt")

if __name__ == "__main__":
    device_id = check_hardware()
    run_test_training(device_id)