import React, { useState, useEffect } from 'react';
import { Card, Button, Progress, message, Modal, Statistic, Row, Col, Typography } from 'antd';
import {
    PlayCircleOutlined,
    ReloadOutlined,
    HomeOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import UserGameImage from './components/UserGameImage';
import gameService from './services/gameService';
import './GamePlayPage.scss';

const { Title, Text } = Typography;

const GamePlayPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [foundRegions, setFoundRegions] = useState(new Set());
    const [triesLeft, setTriesLeft] = useState(0);
    const [score, setScore] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        loadGame();
    }, [id]);

    const loadGame = async () => {
        setLoading(true);
        try {
            const gameData = gameService.getGameById(id);
            if (gameData) {
                setGame(gameData);
                setTriesLeft(gameData.maxTries);
            } else {
                message.error('Game not found');
                navigate('/');
            }
        } catch (error) {
            message.error('Failed to load game');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const startGame = () => {
        setGameStarted(true);
        setStartTime(Date.now());
        message.success('Game started! Find the mistakes!');
    };

    const handleMistakeFound = (region) => {
        if (foundRegions.has(region.id)) return;

        const newFoundRegions = new Set([...foundRegions, region.id]);
        setFoundRegions(newFoundRegions);
        setScore(score + game.pointsPerSpot);

        // Check if all mistakes found
        if (newFoundRegions.size === game.mistakeRegions.length) {
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
            totalMistakes: game.mistakeRegions.length,
            timeSpent: getGameTime(),
            triesUsed: game.maxTries - triesLeft,
        };
        gameService.saveGameResult(game.id, result);

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
        setTriesLeft(game.maxTries);
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

    const getProgress = () => {
        if (!game) return 0;
        return (foundRegions.size / game.mistakeRegions.length) * 100;
    };

    if (loading) {
        return (
            <div className="game-loading">
                <div className="loading-spinner">Loading game...</div>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="game-error">
                <Title level={3}>Game not found</Title>
                <Button type="primary" onClick={() => navigate('/')}>
                    Go Home
                </Button>
            </div>
        );
    }

    return (
        <div className="game-play-page">
            <div className="game-header">
                <div className="game-info">
                    <Title level={2}>{game.title}</Title>
                    <Text type="secondary">{game.description}</Text>
                </div>
                <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
                    Home
                </Button>
            </div>

            <Row gutter={24}>
                <Col span={16}>
                    <Card className="game-card">
                        <UserGameImage
                            imageUrl={game.imageUrl}
                            mistakeRegions={game.mistakeRegions}
                            onMistakeFound={handleMistakeFound}
                            isPlaying={gameStarted && !gameEnded}
                            showRegions={!gameStarted || gameEnded}
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title="Game Stats" className="stats-card">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic title="Score" value={score} prefix={<TrophyOutlined />} />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Tries Left"
                                    value={triesLeft}
                                    valueStyle={{ color: triesLeft <= 1 ? '#ff4d4f' : '#262626' }}
                                />
                            </Col>
                        </Row>

                        <div className="progress-section">
                            <Text strong>Progress</Text>
                            <Progress
                                percent={getProgress()}
                                status={gameEnded ? 'success' : 'active'}
                                strokeColor={{
                                    '0%': '#108ee9',
                                    '100%': '#87d068',
                                }}
                            />
                            <Text type="secondary">
                                {foundRegions.size} / {game.mistakeRegions.length} mistakes found
                            </Text>
                        </div>

                        {gameStarted && (
                            <div className="time-section">
                                <Text strong>Time</Text>
                                <div className="time-display">
                                    <ClockCircleOutlined /> {getGameTime()}s
                                </div>
                            </div>
                        )}

                        <div className="game-controls">
                            {!gameStarted ? (
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<PlayCircleOutlined />}
                                    onClick={startGame}
                                    block
                                >
                                    Start Game
                                </Button>
                            ) : gameEnded ? (
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ReloadOutlined />}
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
            </Row>

            <Modal
                title="Game Result"
                open={showResult}
                onCancel={() => setShowResult(false)}
                footer={[
                    <Button
                        key="play-again"
                        type="primary"
                        onClick={() => {
                            setShowResult(false);
                            restartGame();
                        }}
                    >
                        Play Again
                    </Button>,
                    <Button key="home" onClick={() => navigate('/')}>
                        Go Home
                    </Button>,
                ]}
                width={500}
            >
                <div className="game-result">
                    <div className="result-header">
                        <TrophyOutlined className="result-icon" />
                        <Title level={3}>
                            {foundRegions.size === game.mistakeRegions.length ? 'Congratulations!' : 'Game Over!'}
                        </Title>
                    </div>

                    <Row gutter={16} className="result-stats">
                        <Col span={8}>
                            <Statistic title="Score" value={score} />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Mistakes Found"
                                value={`${foundRegions.size}/${game.mistakeRegions.length}`}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic title="Time" value={`${getGameTime()}s`} />
                        </Col>
                    </Row>

                    <div className="result-message">
                        {foundRegions.size === game.mistakeRegions.length ? (
                            <Text type="success">
                                Excellent! You found all the mistakes in {getGameTime()} seconds!
                            </Text>
                        ) : (
                            <Text type="danger">
                                You found {foundRegions.size} out of {game.mistakeRegions.length} mistakes. Try again to
                                find them all!
                            </Text>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GamePlayPage;
