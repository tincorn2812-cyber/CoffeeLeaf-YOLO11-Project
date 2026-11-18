import os
import glob

# Tự động tìm thư mục Downloads trên máy của bạn
downloads_dir = os.path.expanduser("~/Downloads")

print(f"=== ĐANG QUÉT CÁC FILE DATA.YAML TRONG: {downloads_dir} ===\n")
yaml_files = glob.glob(os.path.join(downloads_dir, "**", "data.yaml"), recursive=True)

if not yaml_files:
    print("Không tìm thấy trong Downloads! Hãy kiểm tra lại đường dẫn thư mục chứa dataset.")
else:
    for idx, y_path in enumerate(yaml_files, 1):
        folder_name = os.path.basename(os.path.dirname(y_path))
        print(f"[{idx}] THƯ MỤC: {folder_name}")
        print(f"    ĐƯỜNG DẪN: {os.path.dirname(y_path)}")
        with open(y_path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                if any(k in line for k in ["nc:", "names:", "- ", "roboflow:", "url:", "license:"]):
                    print("    " + line.strip())
        print("-" * 60)