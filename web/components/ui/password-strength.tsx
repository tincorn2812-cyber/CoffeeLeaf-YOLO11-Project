"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

// ============================================================================
// 1. CẤU HÌNH THÔNG SỐ HIỆU ỨNG VẬT LÝ (SPRING PHYSICS CONFIGURATION)
// ============================================================================
// Sử dụng mô hình lò xo vật lý (Spring) giúp chuyển động mượt mà, tự nhiên hơn
// so với chuyển động tuyến tính (linear) thông thường.
const CELL = {
  type: "spring",
  stiffness: 520, // Độ cứng lò xo: phản hồi nhanh tức thì khi người dùng gõ phím
  damping: 34,    // Hệ số giảm chấn: triệt tiêu dao động dư thừa, dừng êm ái
  mass: 0.45,     // Khối lượng ảo: tạo cảm giác nhẹ nhàng, linh hoạt
} as const;

// Hiệu ứng mờ chuyển tiếp chéo (Crossfade) khi đổi nhãn chữ hoặc màu sắc
const CROSSFADE = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 0.8,
} as const;

// Khi người dùng bật chế độ giảm hiệu ứng chuyển động trên hệ điều hành (Reduced Motion)
const INSTANT = { duration: 0 } as const;

// ============================================================================
// 2. ĐỊNH NGHĨA KIỂU DỮ LIỆU TYPESCRIPT (TYPES & INTERFACES)
// ============================================================================
// Mỗi quy tắc kiểm tra mật khẩu gồm: mã định danh, nhãn hiển thị và hàm kiểm tra boolean
export type PasswordRule = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

// Kết quả đánh giá của một quy tắc (thêm cờ 'met': true/false)
export type EvaluatedRule = PasswordRule & { met: boolean };

// Các tùy chọn truyền vào Custom Hook
export type UsePasswordStrengthOptions = {
  rules?: readonly PasswordRule[];
  labels?: readonly string[];
  announceDelay?: number;
};

// Trạng thái tổng hợp sau khi đánh giá mật khẩu
export type PasswordStrengthState = {
  score: number;          // Điểm số hiện tại (0..max)
  max: number;            // Số điểm tối đa (bằng số lượng quy tắc)
  label: string;          // Nhãn hiển thị trạng thái (Yếu / Trung bình / Đạt chuẩn)
  rules: EvaluatedRule[]; // Danh sách chi tiết từng quy tắc và trạng thái đạt/chưa đạt
  announcement: string;   // Chuỗi thông báo hỗ trợ người khiếm thị qua máy đọc màn hình (Screen Reader)
};

// ============================================================================
// 3. BỘ QUY TẮC MẬT KHẨU TỐI ƯU CHO NÔNG DÂN (FARMER-FRIENDLY RULES)
// ============================================================================
// Thiết kế thực tế: Tránh bắt buộc ký tự đặc biệt hoặc chữ hoa gây khó khăn khi gõ trên
// bàn phím điện thoại cảm ứng ngoài nương rẫy. Chỉ cần Chữ + Số, tối thiểu 8 ký tự.
export const farmerPasswordRules: readonly PasswordRule[] = [
  {
    id: "length",
    label: "Từ 8 ký tự trở lên (dễ nhớ, đủ an toàn)",
    test: (v) => v.length >= 8,
  },
  {
    id: "letter",
    label: "Có chữ cái không dấu (ví dụ: caphe, vuonnha, daklak)",
    test: (v) => /[a-zA-Z]/.test(v) && !/[^\x00-\x7F]/.test(v),
  },
  {
    id: "digit",
    label: "Có ít nhất 1 chữ số (ví dụ: 1985, 2026)",
    test: (v) => /\d/.test(v),
  },
];

// Danh sách nhãn hiển thị tương ứng với từng mức điểm (0..3)
const defaultLabels = [
  "Chưa nhập mật khẩu",
  "Yếu (Cần bổ sung)",
  "Trung bình",
  "Đạt chuẩn & An toàn",
] as const;

// ============================================================================
// 4. CUSTOM REACT HOOK: usePasswordStrength (XỬ LÝ LOGIC ĐÁNH GIÁ MẬT KHẨU)
// ============================================================================
// Tách biệt hoàn toàn phần Logic tính toán khỏi phần Giao diện (Separation of Concerns),
// giúp dễ dàng tái sử dụng và kiểm thử đơn vị (Unit Test).
export function usePasswordStrength(
  value: string,
  {
    rules = farmerPasswordRules,
    labels = defaultLabels,
    announceDelay = 700,
  }: UsePasswordStrengthOptions = {},
): PasswordStrengthState {
  // useMemo: Chỉ tính toán lại khi chuỗi mật khẩu 'value' hoặc tập quy tắc 'rules' thay đổi
  const state = useMemo(() => {
    // 1. Chạy hàm test() cho từng quy tắc
    const evaluated = rules.map((rule) => ({ ...rule, met: rule.test(value) }));
    
    // 2. Đếm số lượng quy tắc đã thỏa mãn
    const passed = evaluated.reduce((n, r) => n + (r.met ? 1 : 0), 0);

    // 3. Tính điểm số: Nếu chưa nhập thì 0 điểm, ngược lại lấy số quy tắc đạt
    const score =
      value.length === 0
        ? 0
        : Math.min(rules.length, Math.max(1, passed));

    // 4. Lấy nhãn chữ tương ứng
    const label = labels[Math.min(score, labels.length - 1)] ?? "";
    const unmet = evaluated.filter((r) => !r.met);

    // 5. Tạo chuỗi thông báo tự động cho trợ năng (Accessibility)
    const announcement =
      value.length === 0
        ? ""
        : [
            `Độ mạnh mật khẩu: ${label.toLowerCase()}.`,
            unmet.length === 0
              ? "Tất cả yêu cầu đã đạt."
              : `Còn thiếu: ${unmet.map((r) => r.label.toLowerCase()).join(", ")}.`,
          ]
            .filter(Boolean)
            .join(" ");

    return {
      score,
      max: rules.length,
      label,
      rules: evaluated,
      announcement,
    };
  }, [value, rules, labels]);

  // Debounce thông báo đọc màn hình để không đọc liên tục mỗi mili-giây khi người dùng gõ nhanh
  const [settled, setSettled] = useState("");

  useEffect(() => {
    if (state.announcement === "") {
      setSettled("");
      return;
    }
    const id = setTimeout(() => setSettled(state.announcement), announceDelay);
    return () => clearTimeout(id);
  }, [state.announcement, announceDelay]);

  return { ...state, announcement: settled };
}

// ============================================================================
// 5. BẢNG MÀU SẮC TRẠNG THÁI (TONE COLORS CONFIGURATION)
// ============================================================================
// Hỗ trợ cả 2 chế độ Light Mode (sáng) và Dark Mode (tối) theo chuẩn Tailwind CSS
const TONES = {
  none: {
    bar: "bg-stone-300 dark:bg-white/20",
    text: "text-stone-500 dark:text-stone-400",
  },
  danger: { bar: "bg-red-500", text: "text-red-600 dark:text-red-400" },     // 1 vạch: Đỏ cảnh báo
  caution: { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" }, // 2 vạch: Vàng cam trung bình
  safe: {
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",                         // 3 vạch: Xanh ngọc đạt chuẩn
  },
} as const;

// Hàm chọn màu theo tỉ lệ điểm đạt được
function toneFor(score: number, max: number) {
  if (score === 0) return TONES.none;
  const ratio = score / max;
  if (ratio <= 0.34) return TONES.danger;
  if (ratio <= 0.67) return TONES.caution;
  return TONES.safe;
}

// Props của Component hiển thị
export type PasswordStrengthProps = {
  value: string;
  rules?: readonly PasswordRule[];
  labels?: readonly string[];
  announceDelay?: number;
  showRules?: boolean;
  className?: string;
};

// ============================================================================
// 6. COMPONENT CHÍNH: PasswordStrength (GIAO DIỆN HIỂN THỊ TRỰC QUAN)
// ============================================================================
export function PasswordStrength({
  value,
  rules = farmerPasswordRules,
  labels = defaultLabels,
  announceDelay = 700,
  showRules = true,
  className = "",
}: PasswordStrengthProps) {
  // Gọi Custom Hook để lấy trạng thái tính toán
  const {
    score,
    max,
    label,
    rules: evaluated,
    announcement,
  } = usePasswordStrength(value, { rules, labels, announceDelay });
  
  // Kiểm tra thiết lập hệ điều hành để tắt animation nếu người dùng bị tiền đình / nhạy cảm chuyển động
  const reduced = useReducedMotion();
  const tone = toneFor(score, max);

  return (
    <div className={`w-full ${className}`}>
      {/* --------------------------------------------------------------------
          PHẦN 1: THANH ĐO TIẾN TRÌNH NHIỀU VẠCH (PROGRESS METER BARS)
          Chuẩn ARIA role="meter" giúp trình duyệt hiểu đây là thước đo giá trị
      -------------------------------------------------------------------- */}
      <div
        role="meter"
        aria-label="Độ mạnh mật khẩu"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={score}
        aria-valuetext={label}
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${max}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: max }, (_, i) => (
          <div
            key={i}
            className="relative h-1.5 overflow-hidden rounded-[2px] bg-stone-200 dark:bg-white/12"
          >
            {/* Thanh bar con: Co giãn trục X (scaleX: 0 -> 1) bằng hiệu ứng lò xo vật lý */}
            <motion.span
              className={`absolute inset-0 origin-left rounded-[2px] transition-colors duration-200 ${tone.bar}`}
              initial={false}
              animate={{ scaleX: i < score ? 1 : 0 }}
              transition={
                reduced ? INSTANT : { ...CELL, delay: i < score ? i * 0.03 : 0 }
              }
            />
          </div>
        ))}
      </div>

      {/* --------------------------------------------------------------------
          PHẦN 2: DÒNG TRẠNG THÁI VĂN BẢN (STRENGTH LABEL)
          Hiệu ứng Crossfade đổi chữ mượt mà và đồng bộ màu sắc với thanh bar
      -------------------------------------------------------------------- */}
      <div className="mt-2 flex h-5 items-center justify-between gap-3">
        <span className="inline-grid text-[12.5px] font-medium leading-5">
          {labels.map((text, i) => (
            <motion.span
              key={text}
              aria-hidden
              className={`col-start-1 row-start-1 whitespace-nowrap transition-colors duration-200 ${tone.text}`}
              initial={false}
              animate={{
                opacity: i === Math.min(score, labels.length - 1) ? 1 : 0,
              }}
              transition={reduced ? INSTANT : CROSSFADE}
            >
              {text}
            </motion.span>
          ))}
        </span>
      </div>

      {/* --------------------------------------------------------------------
          PHẦN 3: DANH SÁCH TIÊU CHÍ (CHECKLIST ITEMS VỚI DẤU TÍCH XANH NẢY ĐỘNG)
      -------------------------------------------------------------------- */}
      {showRules && (
        <ul className="mt-3 grid gap-1.5">
          {evaluated.map((rule) => (
            <li key={rule.id} className="flex items-center gap-2">
              {/* Ô vuông checkbox: Tự động đổi màu nền và nảy dấu tích xanh khi đạt */}
              <span className="relative grid size-[14px] shrink-0 place-items-center rounded-[4px] border border-stone-200 text-white dark:border-white/[0.16] dark:text-stone-900">
                <motion.span
                  className="absolute inset-0 rounded-[3px] bg-emerald-500"
                  initial={false}
                  animate={{ opacity: rule.met ? 1 : 0 }}
                  transition={reduced ? INSTANT : CROSSFADE}
                />
                <motion.svg
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden
                  className="relative size-[9px]"
                  initial={false}
                  animate={{
                    opacity: rule.met ? 1 : 0,
                    scale: rule.met ? 1 : 0.6,
                  }}
                  transition={reduced ? INSTANT : CELL}
                >
                  <path
                    d="M2 6.2 4.7 8.9 10 3.3"
                    stroke="currentColor"
                    strokeWidth={1.9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </span>
              {/* Nhãn điều kiện: Tự động đậm chữ và đổi màu khi thỏa mãn */}
              <span
                className={`text-[12.5px] leading-5 transition-colors duration-200 ${
                  rule.met
                    ? "text-stone-700 dark:text-stone-200 font-medium"
                    : "text-stone-500 dark:text-stone-400"
                }`}
              >
                {rule.label}
              </span>
              <span className="sr-only">{rule.met ? "đạt" : "chưa đạt"}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Hỗ trợ máy đọc trợ năng không hiển thị ra mắt thường */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

export default PasswordStrength;
