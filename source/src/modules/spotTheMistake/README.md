# Spot the Mistake Game Module

## Tổng quan

Module trò chơi "Spot the Mistake" cho phép tạo và quản lý các trò chơi tìm lỗi trong hình ảnh. Người dùng có thể tạo trò chơi với các vùng lỗi có thể kéo thả, và người chơi sẽ tìm kiếm các vùng này trong hình ảnh.

## Tính năng chính

### 1. CMS Admin Interface

-   **GameListPage**: Danh sách tất cả các trò chơi
-   **GameForm**: Tạo/sửa trò chơi với drag & drop regions
-   **GamePlayPage**: Trang chơi game (có thể truy cập public)

### 2. Game Components

-   **DraggableRegion**: Component kéo thả vùng màu đỏ để đánh dấu lỗi
-   **GameImage**: Component hiển thị ảnh và xử lý click detection
-   **GamePlayPage**: Trang chơi game với UI đẹp

### 3. Tính năng kỹ thuật

-   Drag & Drop regions với @dnd-kit
-   Click detection chính xác
-   Responsive design
-   Real-time game stats
-   Progress tracking

## Cách sử dụng

### 1. Tạo trò chơi mới

1. Vào menu "Trò chơi" > "Spot the Mistake"
2. Click "Create New Game"
3. Điền thông tin trò chơi (tiêu đề, mô tả, điểm số, số lần thử)
4. Upload ảnh trò chơi
5. Kéo thả các vùng màu đỏ để đánh dấu vị trí lỗi
6. Lưu trò chơi

### 2. Chơi trò chơi

1. Vào trang chơi game (có thể public)
2. Click "Start Game"
3. Tìm và click vào các vùng lỗi trong ảnh
4. Xem kết quả và điểm số

## API Endpoints

### Admin APIs (Cần authentication)

-   `GET /api/v1/spot-the-mistake/list` - Lấy danh sách trò chơi
-   `GET /api/v1/spot-the-mistake/get/:id` - Lấy chi tiết trò chơi
-   `POST /api/v1/spot-the-mistake/create` - Tạo trò chơi mới
-   `PUT /api/v1/spot-the-mistake/update` - Cập nhật trò chơi
-   `DELETE /api/v1/spot-the-mistake/delete/:id` - Xóa trò chơi

### Public APIs

-   `GET /api/v1/spot-the-mistake/play/:id` - Lấy thông tin trò chơi để chơi
-   `POST /api/v1/spot-the-mistake/submit-result` - Gửi kết quả chơi

## Cấu trúc dữ liệu

### Game Object

```javascript
{
  id: string,
  title: string,
  description: string,
  imageUrl: string,
  pointsPerSpot: number,
  maxTries: number,
  mistakeRegions: Array<{
    id: string,
    x: number,        // Vị trí X (phần trăm)
    y: number,        // Vị trí Y (phần trăm)
    width: number,    // Chiều rộng (phần trăm)
    height: number,   // Chiều cao (phần trăm)
    color: string,    // Màu sắc
    opacity: number   // Độ trong suốt
  }>,
  isActive: boolean,
  createdAt: string,
  totalPlays: number,
  successRate: number
}
```

## Customization

### Thay đổi màu sắc

Chỉnh sửa file SCSS trong thư mục `components/`:

-   `DraggableRegion.scss` - Màu sắc cho admin interface
-   `GameImage.scss` - Màu sắc cho game interface
-   `GamePlayPage.scss` - Màu sắc cho trang chơi

### Thay đổi logic game

Chỉnh sửa file `GameImage.js` để thay đổi:

-   Cách tính điểm
-   Logic phát hiện click
-   Hiệu ứng visual

## Dependencies

-   `@dnd-kit/core` - Drag & Drop functionality
-   `@dnd-kit/utilities` - DnD utilities
-   `antd` - UI components
-   `react-color` - Color picker
-   `react-intl` - Internationalization

## Browser Support

-   Chrome 60+
-   Firefox 55+
-   Safari 12+
-   Edge 79+

## Troubleshooting

### Drag & Drop không hoạt động

-   Kiểm tra xem `@dnd-kit` đã được cài đặt chưa
-   Đảm bảo component được wrap trong `DndContext`

### Click detection không chính xác

-   Kiểm tra kích thước ảnh và vị trí regions
-   Đảm bảo regions được tính toán theo phần trăm

### Performance issues

-   Tối ưu hóa kích thước ảnh
-   Giới hạn số lượng regions
-   Sử dụng `useCallback` cho event handlers
