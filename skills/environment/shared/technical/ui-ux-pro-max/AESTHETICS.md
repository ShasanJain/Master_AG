# 🎨 Universal Aesthetic Standard (Magic UI & Glassmorphism)
> **Ref**: NextLevelBuilder / Magic UI / Vercel Design System

Tất cả giao diện được tạo bởi Jack phải tuân thủ chuẩn thẩm mỹ "Luxury Tech" này.

## 1. Màu sắc & Ánh sáng (Luminance)
- **Primary**: Sử dụng `HSL` colors thay vì `Hex` để kiểm soát độ sáng tối tốt hơn.
- **Glassmorphism**: 
  - `bg-white/10` hoặc `bg-black/20` tùy theme.
  - Phải có `backdrop-blur-md` (8px trở lên).
  - Viền phải cực mảnh (0.5px - 1px) với độ mờ (opacity) thấp.

## 2. Typo (Font & Hierarchy)
- **Headers**: Sử dụng `Inter` hoặc `Geist Sans` (Vercel).
- **Tracking**: Giảm tracking (`tracking-tight`) cho các tiêu đề lớn để tạo cảm giác chuyên nghiệp.
- **Weight**: Sử dụng `font-semibold` cho tiêu đề và `font-normal` (opacity 80%) cho sub-text.

## 3. Motion (Biển động tinh tế)
- **Staggered Entrance**: Các phần tử không được hiện ra cùng lúc. Dùng `delay` cách nhau 0.1s.
- **Bounces**: Không dùng bounce mạnh. Chỉ dùng `spring` vật lý nhẹ nhàng (`damping: 20`, `stiffness: 100`).

## 4. Layout (Bento & Cards)
- **Bento Grid**: Ưu tiên sử dụng Grid không đối xứng để tạo sự mới mẻ.
- **Inner Padding**: Tối thiểu 24px cho desktop, 16px cho mobile.

---
*Tiêu chuẩn này là bắt buộc cho mọi workflow /ui-ux-pro-max hoặc khi tạo giao diện mới.*
