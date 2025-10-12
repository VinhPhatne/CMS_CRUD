import React, { useState } from 'react';
import { Card, Button, Row, Col, Typography, Space } from 'antd';
import { PlayCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import UserGameImage from './components/UserGameImage';
import './Demo.scss';

const { Title, Paragraph } = Typography;

const Demo = () => {
    const navigate = useNavigate();
    const [showDemo, setShowDemo] = useState(false);

    // Demo data
    const demoGame = {
        title: 'Spot the Mistake Demo',
        description: 'Find the hidden mistakes in this beautiful landscape',
        imageUrl:
            'https://images.unsplash.com/photo-1506905925346-14b5e6d8a1a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        pointsPerSpot: 10,
        maxTries: 3,
        mistakeRegions: [
            { id: '1', x: 20, y: 30, width: 15, height: 20, color: '#ff0000', opacity: 0.7 },
            { id: '2', x: 60, y: 45, width: 12, height: 18, color: '#ff0000', opacity: 0.7 },
        ],
    };

    const handleMistakeFound = (region) => {
        console.log('Found mistake:', region);
    };

    return (
        <div className="spot-the-mistake-demo">
            <div className="demo-header">
                <Title level={1}>Spot the Mistake Game</Title>
                <Paragraph>
                    A fun and interactive game where players find hidden mistakes in images. Perfect for educational
                    purposes, team building, or entertainment.
                </Paragraph>
            </div>

            <Row gutter={24}>
                <Col span={12}>
                    <Card title="Features" className="features-card">
                        <ul className="features-list">
                            <li>🎯 Drag & Drop mistake regions in admin panel</li>
                            <li>🎮 Interactive click detection</li>
                            <li>📊 Real-time scoring and progress tracking</li>
                            <li>📱 Responsive design for all devices</li>
                            <li>🎨 Customizable colors and settings</li>
                            <li>📈 Game statistics and analytics</li>
                            <li>🌐 Multi-language support</li>
                            <li>⚡ Fast and smooth performance</li>
                        </ul>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="How to Play" className="instructions-card">
                        <ol className="instructions-list">
                            <li>Click Start Game to begin</li>
                            <li>Look carefully at the image</li>
                            <li>Click on any mistakes you find</li>
                            <li>Try to find all mistakes before running out of tries</li>
                            <li>Earn points for each mistake found</li>
                            <li>Check your final score and time</li>
                        </ol>
                    </Card>
                </Col>
            </Row>

            <Card title="Live Demo" className="demo-card">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div className="demo-controls">
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlayCircleOutlined />}
                            onClick={() => setShowDemo(!showDemo)}
                        >
                            {showDemo ? 'Hide Demo' : 'Show Demo'}
                        </Button>
                        <Button size="large" icon={<SettingOutlined />} onClick={() => navigate('/spot-the-mistake')}>
                            Manage Games
                        </Button>
                    </div>

                    {showDemo && (
                        <div className="demo-game">
                            <UserGameImage
                                imageUrl={demoGame.imageUrl}
                                mistakeRegions={demoGame.mistakeRegions}
                                onMistakeFound={handleMistakeFound}
                                isPlaying={true}
                                showRegions={false}
                            />
                        </div>
                    )}
                </Space>
            </Card>

            <Card title="Get Started" className="get-started-card">
                <Row gutter={16}>
                    <Col span={8}>
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Create Game</h3>
                            <p>Upload an image and set up mistake regions using our intuitive drag & drop interface.</p>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Configure Settings</h3>
                            <p>
                                Set points per spot, maximum tries, and other game parameters to customize the
                                experience.
                            </p>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Share & Play</h3>
                            <p>Share your game with players and track their progress with detailed analytics.</p>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Demo;
