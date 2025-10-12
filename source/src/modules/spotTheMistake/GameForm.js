import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Button, Upload, message, Card, Row, Col, Switch } from 'antd';
import { UploadOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '@components/common/layout/PageWrapper';
import InteractDraggableRegion from './components/InteractDraggableRegion';
import MobileImageUpload from './components/MobileImageUpload';
import gameService from './services/gameService';
import './GameForm.scss';

const { TextArea } = Input;

const GameForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [mistakeRegions, setMistakeRegions] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);
    const imageRef = useRef(null);

    // Detect Safari iOS
    const isSafariIOS = () => {
        const ua = navigator.userAgent;
        return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
    };

    const isEdit = Boolean(id);

    useEffect(() => {
        if (isEdit) {
            loadGameData();
        }
    }, [id, isEdit]);

    const loadGameData = async () => {
        setLoading(true);
        try {
            const gameData = gameService.getGameById(id);
            if (gameData) {
                form.setFieldsValue(gameData);
                setImageUrl(gameData.imageUrl);
                setMistakeRegions(gameData.mistakeRegions || []);
            } else {
                message.error('Game not found');
                navigate('/spot-the-mistake');
            }
        } catch (error) {
            message.error('Failed to load game data');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (info) => {
        // Handle different upload states for Safari iOS compatibility
        if (info.file.status === 'done' || info.file.status === 'uploading') {
            // Convert image to base64 and store in localStorage
            const file = info.file.originFileObj || info.file;

            // Check if file is valid
            if (!file) {
                message.error('Please select a valid image file');
                return;
            }

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

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Image = e.target.result;
                setImageUrl(base64Image);
                message.success('Image uploaded successfully');
            };
            reader.onerror = () => {
                message.error('Failed to read image file');
            };
            reader.readAsDataURL(file);
        } else if (info.file.status === 'error') {
            message.error('Image upload failed');
        }
    };

    const handleMobileImageSelect = (base64Image) => {
        setImageUrl(base64Image);
    };

    const handleSave = async (values) => {
        console.log('1');
        if (mistakeRegions.length === 0) {
            message.warning('Please add at least one mistake region');
            return;
        }

        setLoading(true);
        try {
            const gameData = {
                ...values,
                imageUrl,
                mistakeRegions,
                id: isEdit ? id : Date.now().toString(),
            };

            const success = gameService.saveGame(gameData);
            if (success) {
                message.success(isEdit ? 'Game updated successfully' : 'Game created successfully');
                navigate('/spot-the-mistake');
            } else {
                message.error('Failed to save game');
            }
        } catch (error) {
            message.error('Failed to save game');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        name: 'file',
        action: '', // No server upload needed
        headers: {},
        onChange: handleImageUpload,
        beforeUpload: (file) => {
            // Check if file is valid
            if (!file) {
                message.error('Please select a valid image file');
                return false;
            }

            // Check file type for Safari iOS compatibility
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                message.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
                return false;
            }

            // Check file size (max 10MB for mobile)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                message.error('Image size must be less than 10MB');
                return false;
            }

            // Simulate upload success immediately
            setTimeout(() => {
                handleImageUpload({ file: { status: 'done', originFileObj: file } });
            }, 100);
            return false; // Prevent actual upload
        },
        showUploadList: false,
        // Safari iOS specific props
        accept: 'image/*',
        capture: 'environment', // Use camera on mobile
        multiple: false,
    };

    return (
        <PageWrapper>
            <div className="game-form-page">
                <div className="page-header">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/spot-the-mistake')}>
                        Back to Games
                    </Button>
                    <h1>{isEdit ? 'Edit Game' : 'Create New Game'}</h1>
                </div>

                <Form form={form} layout="vertical" onFinish={handleSave} className="game-form">
                    <Row gutter={24}>
                        <Col span={12}>
                            <Card title="Game Information" className="form-card">
                                <Form.Item
                                    name="title"
                                    label="Game Title"
                                    rules={[{ required: true, message: 'Please enter game title' }]}
                                >
                                    <Input placeholder="Enter game title" />
                                </Form.Item>

                                <Form.Item
                                    name="description"
                                    label="Description"
                                    rules={[{ required: true, message: 'Please enter game description' }]}
                                >
                                    <TextArea rows={3} placeholder="Enter game description" />
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="pointsPerSpot"
                                            label="Points per Spot"
                                            rules={[{ required: true, message: 'Please enter points per spot' }]}
                                        >
                                            <InputNumber min={1} max={100} placeholder="10" style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="maxTries"
                                            label="Max Tries"
                                            rules={[{ required: true, message: 'Please enter max tries' }]}
                                        >
                                            <InputNumber min={1} max={10} placeholder="3" style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item name="isActive" label="Active" valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Card>
                        </Col>

                        <Col span={12}>
                            <Card title="Game Image" className="form-card">
                                <div className="image-upload-section">
                                    {isSafariIOS() ? (
                                        <MobileImageUpload onImageSelect={handleMobileImageSelect} disabled={loading} />
                                    ) : (
                                        <Upload {...uploadProps}>
                                            <Button
                                                icon={<UploadOutlined />}
                                                block
                                                style={{
                                                    height: '48px',
                                                    fontSize: '16px',
                                                    touchAction: 'manipulation', // Safari iOS touch fix
                                                }}
                                            >
                                                Upload Game Image
                                            </Button>
                                        </Upload>
                                    )}

                                    {imageUrl && (
                                        <div className="image-preview">
                                            <img src={imageUrl} alt="Game preview" className="preview-image" />
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Mistake Regions Setup" className="form-card">
                        <div className="region-setup-header">
                            <p>
                                Click and drag to create mistake regions. Players need to click on these regions to find
                                mistakes.
                            </p>
                            <div className="region-controls">
                                <Button
                                    type={previewMode ? 'primary' : 'default'}
                                    onClick={() => setPreviewMode(!previewMode)}
                                >
                                    {previewMode ? 'Edit Mode' : 'Preview Mode'}
                                </Button>
                            </div>
                        </div>

                        {imageUrl ? (
                            <InteractDraggableRegion
                                regions={mistakeRegions}
                                onRegionsChange={setMistakeRegions}
                                imageRef={imageRef}
                                imageUrl={imageUrl}
                            />
                        ) : (
                            <div className="no-image-placeholder">
                                <p>Please upload an image first to set up mistake regions</p>
                            </div>
                        )}
                    </Card>

                    <div className="form-actions">
                        <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />} size="large">
                            {isEdit ? 'Update Game' : 'Create Game'}
                        </Button>
                        <Button onClick={() => navigate('/spot-the-mistake')} size="large">
                            Cancel
                        </Button>
                    </div>
                </Form>
            </div>
        </PageWrapper>
    );
};

export default GameForm;
