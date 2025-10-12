import React, { useRef } from 'react';
import { Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import gameService from '../services/gameService';

const JsonImport = ({ onImportSuccess, size = 'default', buttonText = 'Import JSON' }) => {
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) {
            message.error('No file selected');
            return;
        }

        // Check file type
        if (!file.name.toLowerCase().endsWith('.json')) {
            message.error('Please select a JSON file');
            return;
        }

        console.log('Processing file:', file.name, file.size);

        gameService
            .importGames(file)
            .then((result) => {
                message.success(
                    `Games imported successfully! Added: ${result.addedCount}, Updated: ${result.updatedCount}`,
                );
                if (onImportSuccess) {
                    onImportSuccess();
                }
            })
            .catch((error) => {
                console.error('Import error:', error);
                message.error('Failed to import games: ' + error.message);
            });
    };

    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="json-import">
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
            <Button
                type="primary"
                size={size}
                icon={<UploadOutlined />}
                onClick={handleImportClick}
                style={{
                    touchAction: 'manipulation',
                }}
            >
                {buttonText}
            </Button>
        </div>
    );
};

export default JsonImport;
