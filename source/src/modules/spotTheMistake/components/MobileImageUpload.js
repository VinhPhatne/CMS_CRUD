import React, { useRef } from 'react';
import { Button, message } from 'antd';
import { UploadOutlined, CameraOutlined } from '@ant-design/icons';

const MobileImageUpload = ({ onImageSelect, disabled = false }) => {
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check file type for Safari iOS compatibility
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            message.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
            return;
        }

        // Check file size (max 10MB for mobile)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            message.error('Image size must be less than 10MB');
            return;
        }

        // Read file as base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            onImageSelect(base64Image);
            message.success('Image uploaded successfully!');
        };
        reader.onerror = () => {
            message.error('Failed to read image file');
        };
        reader.readAsDataURL(file);
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="mobile-image-upload">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
            <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleUploadClick}
                disabled={disabled}
                block
                style={{
                    height: '48px',
                    fontSize: '16px',
                    touchAction: 'manipulation',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                }}
            >
                Upload Game Image
            </Button>
            <Button
                type="default"
                icon={<CameraOutlined />}
                onClick={handleUploadClick}
                disabled={disabled}
                block
                style={{
                    height: '48px',
                    fontSize: '16px',
                    marginTop: '8px',
                    touchAction: 'manipulation',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                }}
            >
                Take Photo
            </Button>
        </div>
    );
};

export default MobileImageUpload;
