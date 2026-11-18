#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script tự động cân bằng Dataset YOLO11 (Xử lý Nguyên nhân 3: Mất cân bằng dữ liệu giữa 5 lớp)
- Phân tích phân bố mẫu trong train/labels
- Nhân bản thông minh + biến đổi ảnh (Augmentation: Lật ngang/dọc, chỉnh sáng HSV, xoay nhẹ)
  cho các lớp thiểu số:
    + 4: healthy (Lá khỏe mạnh - chỉ có 456 mẫu)
    + 3: red_spider_mite (Nhện đỏ - 2,011 mẫu)
    + 1: cercospora (Đốm mắt cua - 4,560 mẫu)
- Loại bỏ các ảnh bị nhiễm chéo với lớp đa số (0: leaf_rust) khi nhân bản để không làm tăng thêm rỉ sắt.
"""
import os
import glob
import random
import shutil
import cv2
import numpy as np

DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets", "coffee_leaf_clean"))
TRAIN_IMG_DIR = os.path.join(DATASET_DIR, "train", "images")
TRAIN_LBL_DIR = os.path.join(DATASET_DIR, "train", "labels")

CLASS_NAMES = {
    0: "leaf_rust (Gỉ sắt)",
    1: "cercospora (Đốm mắt cua)",
    2: "leaf_miner (Sâu vẽ bùa)",
    3: "red_spider_mite (Nhện đỏ)",
    4: "healthy (Lá khỏe mạnh)"
}

# Số lượng nhân bản thêm cho mỗi ảnh thuần của từng lớp thiểu số
OVERSAMPLE_FACTORS = {
    4: 8,  # healthy: tăng gấp ~9 lần (từ 456 -> ~4,100 mẫu)
    3: 3,  # red_spider_mite: tăng gấp ~4 lần (từ 2,011 -> ~7,500 mẫu)
    1: 1,  # cercospora: tăng gấp ~2 lần (từ 4,560 -> ~8,000 mẫu)
}


def count_dataset_stats(lbl_dir):
    counts = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}
    files = glob.glob(os.path.join(lbl_dir, "*.txt"))
    for f in files:
        with open(f, "r", encoding="utf-8") as fp:
            for line in fp:
                parts = line.strip().split()
                if parts:
                    c = int(parts[0])
                    counts[c] = counts.get(c, 0) + 1
    return counts, len(files)


def augment_image_and_boxes(img, boxes, aug_type):
    """
    Thực hiện biến đổi ảnh + tọa độ YOLO bbox [cls, x_center, y_center, w, h]
    """
    aug_img = img.copy()
    aug_boxes = [list(b) for b in boxes]

    # 1. Lật ngang (Horizontal Flip)
    if aug_type in (0, 2, 4, 6):
        aug_img = cv2.flip(aug_img, 1)
        for b in aug_boxes:
            b[1] = 1.0 - b[1]

    # 2. Lật dọc (Vertical Flip)
    if aug_type in (1, 2, 5, 7):
        aug_img = cv2.flip(aug_img, 0)
        for b in aug_boxes:
            b[2] = 1.0 - b[2]

    # 3. Biến đổi ánh sáng & độ bão hòa (HSV Jitter) giúp mô hình quen nhiều điều kiện nắng/râm
    hsv = cv2.cvtColor(aug_img, cv2.COLOR_BGR2HSV).astype(np.float32)
    sat_scale = random.uniform(0.85, 1.20)
    val_scale = random.uniform(0.85, 1.18)
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * sat_scale, 0, 255)
    hsv[:, :, 2] = np.clip(hsv[:, :, 2] * val_scale, 0, 255)
    aug_img = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

    return aug_img, aug_boxes


def main():
    if not os.path.exists(TRAIN_LBL_DIR):
        print(f"[!] Không tìm thấy thư mục nhãn: {TRAIN_LBL_DIR}")
        return

    print("=" * 65)
    print("THỐNG KÊ TRƯỚC KHI CÂN BẰNG DỮ LIỆU:")
    before_counts, total_files = count_dataset_stats(TRAIN_LBL_DIR)
    total_boxes = sum(before_counts.values()) or 1
    for cid, name in CLASS_NAMES.items():
        cnt = before_counts.get(cid, 0)
        pct = cnt * 100.0 / total_boxes
        print(f"  - Lớp {cid} [{name:<26}]: {cnt:>6} vùng ({pct:5.1f}%)")
    print(f"  => Tổng số file ảnh train: {total_files}")
    print("=" * 65)

    lbl_files = [
        f for f in glob.glob(os.path.join(TRAIN_LBL_DIR, "*.txt"))
        if not os.path.basename(f).startswith("bal_aug_")
    ]

    created_count = 0
    for lbl_path in lbl_files:
        base_name = os.path.splitext(os.path.basename(lbl_path))[0]
        # Tìm file ảnh tương ứng
        img_path = None
        for ext in (".jpg", ".jpeg", ".png", ".JPG", ".PNG"):
            candidate = os.path.join(TRAIN_IMG_DIR, base_name + ext)
            if os.path.exists(candidate):
                img_path = candidate
                break
        if not img_path:
            continue

        boxes = []
        classes_in_img = set()
        with open(lbl_path, "r", encoding="utf-8") as fp:
            for line in fp:
                parts = line.strip().split()
                if len(parts) == 5:
                    cid = int(parts[0])
                    coords = [float(x) for x in parts[1:]]
                    boxes.append([cid] + coords)
                    classes_in_img.add(cid)

        if not boxes:
            continue

        # Chỉ nhân bản các ảnh chứa lớp thiểu số (4, 3, 1) và KHÔNG chứa lớp 0 (leaf_rust)
        # để tránh việc nhân bản vô tình làm tăng thêm số lượng leaf_rust
        if 0 in classes_in_img:
            continue

        target_factor = 0
        for target_cls, factor in OVERSAMPLE_FACTORS.items():
            if target_cls in classes_in_img:
                target_factor = max(target_factor, factor)

        if target_factor <= 0:
            continue

        img = cv2.imread(img_path)
        if img is None:
            continue

        for k in range(target_factor):
            aug_img, aug_boxes = augment_image_and_boxes(img, boxes, k % 8)
            new_name = f"bal_aug_{k}_{base_name}"
            new_img_path = os.path.join(TRAIN_IMG_DIR, new_name + ".jpg")
            new_lbl_path = os.path.join(TRAIN_LBL_DIR, new_name + ".txt")

            cv2.imwrite(new_img_path, aug_img, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
            with open(new_lbl_path, "w", encoding="utf-8") as out_fp:
                for b in aug_boxes:
                    out_fp.write(f"{int(b[0])} {b[1]:.6f} {b[2]:.6f} {b[3]:.6f} {b[4]:.6f}\n")
            created_count += 1

    print(f"\n[+] Đã tạo thêm {created_count} ảnh + nhãn cân bằng (tiền tố 'bal_aug_')!")
    print("=" * 65)
    print("THỐNG KÊ SAU KHI CÂN BẰNG DỮ LIỆU:")
    after_counts, after_files = count_dataset_stats(TRAIN_LBL_DIR)
    after_total = sum(after_counts.values()) or 1
    for cid, name in CLASS_NAMES.items():
        cnt = after_counts.get(cid, 0)
        pct = cnt * 100.0 / after_total
        print(f"  - Lớp {cid} [{name:<26}]: {cnt:>6} vùng ({pct:5.1f}%)")
    print(f"  => Tổng số file ảnh train mới: {after_files}")
    print("=" * 65)


if __name__ == "__main__":
    main()
