import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, Space, message } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import UserGameImage from './components/UserGameImage';
import JsonImport from './components/JsonImport';
import gameService from './services/gameService';
import './PublicSpotTheMistake.scss';

const { Title, Paragraph, Text } = Typography;

const PublicSpotTheMistake = () => {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [foundRegions, setFoundRegions] = useState(new Set());
    const [triesLeft, setTriesLeft] = useState(0);
    const [score, setScore] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = () => {
        try {
            const games = gameService.getAllGames();
            setGames(games);
        } catch (error) {
            console.error('Error loading games:', error);
        }
    };

    const startGame = (game) => {
        setSelectedGame(game);
        setGameStarted(true);
        setGameEnded(false);
        setFoundRegions(new Set());
        setTriesLeft(game.maxTries);
        setScore(0);
        setStartTime(Date.now());
        setEndTime(null);
        setShowResult(false);
        message.success('Game started! Find the mistakes!');
    };

    const handleMistakeFound = (region) => {
        if (foundRegions.has(region.id)) return;

        const newFoundRegions = new Set([...foundRegions, region.id]);
        setFoundRegions(newFoundRegions);
        setScore(score + selectedGame.pointsPerSpot);

        // Check if all mistakes found
        if (newFoundRegions.size === selectedGame.mistakeRegions.length) {
            endGame(true);
        }
    };

    const handleMiss = () => {
        const newTriesLeft = triesLeft - 1;
        setTriesLeft(newTriesLeft);

        if (newTriesLeft <= 0) {
            endGame(false);
        } else {
            message.warning(`Wrong! ${newTriesLeft} tries left`);
        }
    };

    const endGame = (won) => {
        setGameEnded(true);
        setEndTime(Date.now());
        setShowResult(true);

        // Save game result
        const result = {
            won,
            score,
            mistakesFound: foundRegions.size,
            totalMistakes: selectedGame.mistakeRegions.length,
            timeSpent: getGameTime(),
            triesUsed: selectedGame.maxTries - triesLeft,
        };
        gameService.saveGameResult(selectedGame.id, result);

        if (won) {
            message.success('Congratulations! You found all mistakes!');
        } else {
            message.error('Game Over! You ran out of tries.');
        }
    };

    const restartGame = () => {
        setGameStarted(false);
        setGameEnded(false);
        setFoundRegions(new Set());
        setTriesLeft(selectedGame.maxTries);
        setScore(0);
        setStartTime(null);
        setEndTime(null);
        setShowResult(false);
    };

    const getGameTime = () => {
        if (!startTime) return 0;
        const end = endTime || Date.now();
        return Math.floor((end - startTime) / 1000);
    };

    if (gameStarted && selectedGame) {
        return (
            <div className="public-spot-the-mistake">
                <div className="game-header">
                    <div className="game-info">
                        <Title level={2}>{selectedGame.title}</Title>
                        <Text type="secondary">{selectedGame.description}</Text>
                    </div>
                    <Button onClick={() => window.location.reload()}>Back to Games</Button>
                </div>

                <Row gutter={24} className="game-layout">
                    {/* Mobile: Stats on top, Desktop: Stats on right */}
                    <Col xs={24} lg={8} order={{ xs: 1, lg: 2 }}>
                        <Card title="Game Stats" className="stats-card">
                            <div className="stat-item">
                                <Text strong>Score: </Text>
                                <Text type="success">{score}</Text>
                            </div>
                            <div className="stat-item">
                                <Text strong>Tries Left: </Text>
                                <Text type={triesLeft <= 1 ? 'danger' : 'default'}>{triesLeft}</Text>
                            </div>
                            <div className="stat-item">
                                <Text strong>Progress: </Text>
                                <Text>
                                    {foundRegions.size} / {selectedGame.mistakeRegions.length} mistakes found
                                </Text>
                            </div>
                            {gameStarted && (
                                <div className="stat-item">
                                    <Text strong>Time: </Text>
                                    <Text>{getGameTime()}s</Text>
                                </div>
                            )}

                            <div className="game-controls">
                                {!gameStarted ? (
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<PlayCircleOutlined />}
                                        onClick={() => startGame(selectedGame)}
                                        block
                                    >
                                        Start Game
                                    </Button>
                                ) : gameEnded ? (
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<PlayCircleOutlined />}
                                        onClick={restartGame}
                                        block
                                    >
                                        Play Again
                                    </Button>
                                ) : (
                                    <Button danger size="large" onClick={handleMiss} block>
                                        Give Up (Wrong Guess)
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </Col>

                    {/* Mobile: Game image below, Desktop: Game image on left */}
                    <Col xs={24} lg={16} order={{ xs: 2, lg: 1 }}>
                        <Card className="game-card">
                            <UserGameImage
                                imageUrl={selectedGame.imageUrl}
                                mistakeRegions={selectedGame.mistakeRegions}
                                onMistakeFound={handleMistakeFound}
                                isPlaying={gameStarted && !gameEnded}
                                showRegions={true} // Show regions for testing
                            />
                        </Card>
                    </Col>
                </Row>

                {showResult && (
                    <Card className="result-card">
                        <div className="game-result">
                            <Title level={3}>
                                {foundRegions.size === selectedGame.mistakeRegions.length
                                    ? '🎉 Congratulations!'
                                    : '😔 Game Over!'}
                            </Title>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <div className="result-stat">
                                        <Text strong>Score</Text>
                                        <div className="result-value">{score}</div>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div className="result-stat">
                                        <Text strong>Mistakes Found</Text>
                                        <div className="result-value">
                                            {foundRegions.size}/{selectedGame.mistakeRegions.length}
                                        </div>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div className="result-stat">
                                        <Text strong>Time</Text>
                                        <div className="result-value">{getGameTime()}s</div>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div className="result-stat">
                                        <Text strong>Success Rate</Text>
                                        <div className="result-value">
                                            {((foundRegions.size / selectedGame.mistakeRegions.length) * 100).toFixed(
                                                1,
                                            )}
                                            %
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                )}
            </div>
        );
    }

    return (
        <div className="public-spot-the-mistake">
            <div className="hero-section">
                <Title level={1}>🎯 Spot the Mistake Game</Title>
                <Paragraph>
                    A fun and interactive game where you find hidden mistakes in images. Perfect for educational
                    purposes, team building, or entertainment.
                </Paragraph>
            </div>

            <Card title="📁 Load Game" className="load-game-card">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div className="load-instructions">
                        <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                        <Text>Upload a JSON file containing game data to start playing</Text>
                    </div>

                    <JsonImport onImportSuccess={loadGames} size="large" buttonText="Upload Game JSON File" />
                </Space>
            </Card>

            {games.length > 0 && (
                <Card title="🎮 Available Games" className="games-card">
                    <Row gutter={[16, 16]}>
                        {games.map((game) => (
                            <Col span={8} key={game.id}>
                                <Card
                                    hoverable
                                    className="game-item"
                                    cover={
                                        <div className="game-image-preview">
                                            <img
                                                src={game.imageUrl}
                                                alt={game.title}
                                                onError={(e) => {
                                                    e.target.src =
                                                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjVmNWY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K';
                                                }}
                                            />
                                        </div>
                                    }
                                    actions={[
                                        <Button
                                            key={game.id}
                                            type="primary"
                                            icon={<PlayCircleOutlined />}
                                            onClick={() => startGame(game)}
                                        >
                                            Play Game
                                        </Button>,
                                    ]}
                                >
                                    <Card.Meta
                                        title={game.title}
                                        description={
                                            <div>
                                                <div>{game.description}</div>
                                                <div className="game-meta">
                                                    <Text type="secondary">
                                                        {game.mistakeRegions.length} mistakes • {game.pointsPerSpot}{' '}
                                                        points each • {game.maxTries} tries
                                                    </Text>
                                                </div>
                                            </div>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>
            )}

            <Card title="ℹ️ How to Play" className="instructions-card">
                <Row gutter={16}>
                    <Col span={8}>
                        <div className="instruction-step">
                            <div className="step-number">1</div>
                            <h3>Load Game</h3>
                            <p>Upload a JSON file containing game data or select from available games</p>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="instruction-step">
                            <div className="step-number">2</div>
                            <h3>Find Mistakes</h3>
                            <p>Look carefully at the image and click on any mistakes you find</p>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="instruction-step">
                            <div className="step-number">3</div>
                            <h3>Score Points</h3>
                            <p>Earn points for each mistake found and try to complete before running out of tries</p>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default PublicSpotTheMistake;
