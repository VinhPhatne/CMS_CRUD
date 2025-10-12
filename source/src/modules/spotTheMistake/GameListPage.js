import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, message, Card, Row, Col, Statistic } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    PlayCircleOutlined,
    EyeOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import PageWrapper from '@components/common/layout/PageWrapper';
import JsonImport from './components/JsonImport';
import gameService from './services/gameService';
import './GameListPage.scss';

const GameListPage = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = async () => {
        setLoading(true);
        try {
            const games = gameService.getAllGames();
            setGames(games);
        } catch (error) {
            message.error('Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Game',
            content: 'Are you sure you want to delete this game?',
            onOk: async () => {
                try {
                    const success = gameService.deleteGame(id);
                    if (success) {
                        setGames(games.filter((game) => game.id !== id));
                        message.success('Game deleted successfully');
                    } else {
                        message.error('Failed to delete game');
                    }
                } catch (error) {
                    message.error('Failed to delete game');
                }
            },
        });
    };

    const handlePreview = (game) => {
        setSelectedGame(game);
        setPreviewVisible(true);
    };

    const handleExport = () => {
        const success = gameService.exportGames();
        if (success) {
            message.success('Games exported successfully');
        } else {
            message.error('Failed to export games');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <div className="game-title">{text}</div>
                    <div className="game-description">{record.description}</div>
                </div>
            ),
        },
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'image',
            width: 100,
            render: (url) => (
                <img
                    src={url}
                    alt="Game"
                    className="game-thumbnail"
                    onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                    }}
                />
            ),
        },
        {
            title: 'Settings',
            key: 'settings',
            width: 150,
            render: (_, record) => (
                <div className="game-settings">
                    <div>Points: {record.pointsPerSpot}</div>
                    <div>Tries: {record.maxTries}</div>
                    <div>Spots: {record.mistakeRegions.length}</div>
                </div>
            ),
        },
        {
            title: 'Stats',
            key: 'stats',
            width: 120,
            render: (_, record) => (
                <div className="game-stats">
                    <div>Plays: {record.totalPlays}</div>
                    <div>Success: {(record.successRate * 100).toFixed(1)}%</div>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'status',
            width: 100,
            render: (isActive) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} size="small" onClick={() => handlePreview(record)}>
                        Preview
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => navigate(`/spot-the-mistake/edit/${record.id}`)}
                    >
                        Edit
                    </Button>
                    <Button
                        icon={<PlayCircleOutlined />}
                        size="small"
                        type="primary"
                        onClick={() => navigate(`/spot-the-mistake/play/${record.id}`)}
                    >
                        Play
                    </Button>
                    <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const totalGames = games.length;
    const activeGames = games.filter((game) => game.isActive).length;
    const totalPlays = games.reduce((sum, game) => sum + game.totalPlays, 0);
    const avgSuccessRate = games.length > 0 ? games.reduce((sum, game) => sum + game.successRate, 0) / games.length : 0;

    return (
        <PageWrapper>
            <div className="game-list-page">
                <div className="page-header">
                    <h1>
                        <FormattedMessage id="spotTheMistake.title" defaultMessage="Spot the Mistake Games" />
                    </h1>
                    <Space>
                        <Button icon={<DownloadOutlined />} onClick={handleExport}>
                            Export JSON
                        </Button>
                        <JsonImport onImportSuccess={loadGames} />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/spot-the-mistake/create')}
                        >
                            Create New Game
                        </Button>
                    </Space>
                </div>

                <Row gutter={16} className="stats-row">
                    <Col span={6}>
                        <Card>
                            <Statistic title="Total Games" value={totalGames} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="Active Games" value={activeGames} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="Total Plays" value={totalPlays} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="Avg Success Rate" value={(avgSuccessRate * 100).toFixed(1)} suffix="%" />
                        </Card>
                    </Col>
                </Row>

                <Card className="games-table-card">
                    <Table
                        columns={columns}
                        dataSource={games}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} games`,
                        }}
                    />
                </Card>

                <Modal
                    title="Game Preview"
                    open={previewVisible}
                    onCancel={() => setPreviewVisible(false)}
                    footer={[
                        <Button
                            key="play"
                            type="primary"
                            onClick={() => {
                                setPreviewVisible(false);
                                navigate(`/spot-the-mistake/play/${selectedGame?.id}`);
                            }}
                        >
                            Play Game
                        </Button>,
                        <Button key="close" onClick={() => setPreviewVisible(false)}>
                            Close
                        </Button>,
                    ]}
                    width={800}
                >
                    {selectedGame && (
                        <div className="game-preview">
                            <h3>{selectedGame.title}</h3>
                            <p>{selectedGame.description}</p>
                            <div className="preview-image">
                                <img
                                    src={selectedGame.imageUrl}
                                    alt={selectedGame.title}
                                    style={{ width: '100%', height: 'auto' }}
                                />
                            </div>
                            <div className="preview-settings">
                                <p>
                                    <strong>Points per spot:</strong> {selectedGame.pointsPerSpot}
                                </p>
                                <p>
                                    <strong>Max tries:</strong> {selectedGame.maxTries}
                                </p>
                                <p>
                                    <strong>Mistake spots:</strong> {selectedGame.mistakeRegions.length}
                                </p>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </PageWrapper>
    );
};

export default GameListPage;
