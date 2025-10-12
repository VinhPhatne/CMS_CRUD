// Game Service - Sử dụng localStorage để lưu trữ dữ liệu
const GAME_STORAGE_KEY = 'spotTheMistake_games';
const GAME_RESULTS_KEY = 'spotTheMistake_results';

export const gameService = {
    // Lấy danh sách tất cả games
    getAllGames: () => {
        try {
            const games = localStorage.getItem(GAME_STORAGE_KEY);
            return games ? JSON.parse(games) : [];
        } catch (error) {
            console.error('Error loading games:', error);
            return [];
        }
    },

    // Lấy game theo ID
    getGameById: (id) => {
        const games = gameService.getAllGames();
        return games.find((game) => game.id === id);
    },

    // Lưu game (tạo mới hoặc cập nhật)
    saveGame: (gameData) => {
        console.log('1');

        try {
            const games = gameService.getAllGames();
            const existingIndex = games.findIndex((game) => game.id === gameData.id);

            // Process image if it's a base64 string
            let processedGameData = { ...gameData };
            if (gameData.imageUrl && gameData.imageUrl.startsWith('data:image/')) {
                // Image is already base64, no processing needed
                processedGameData.imageUrl = gameData.imageUrl;
            }

            if (existingIndex >= 0) {
                // Cập nhật game existing
                games[existingIndex] = {
                    ...processedGameData,
                    updatedAt: new Date().toISOString(),
                };
            } else {
                // Tạo game mới
                const newGame = {
                    ...processedGameData,
                    id: gameData.id || Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    totalPlays: 0,
                    successRate: 0,
                };
                games.push(newGame);
            }
            console.log('1');
            localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(games));
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            return false;
        }
    },

    // Xóa game
    deleteGame: (id) => {
        try {
            const games = gameService.getAllGames();
            const filteredGames = games.filter((game) => game.id !== id);
            localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(filteredGames));
            return true;
        } catch (error) {
            console.error('Error deleting game:', error);
            return false;
        }
    },

    // Cập nhật thống kê game
    updateGameStats: (gameId) => {
        try {
            const games = gameService.getAllGames();
            const gameIndex = games.findIndex((game) => game.id === gameId);

            if (gameIndex >= 0) {
                games[gameIndex].totalPlays += 1;

                // Tính success rate
                const results = gameService.getGameResults(gameId);
                const successfulPlays = results.filter((r) => r.won).length;
                games[gameIndex].successRate = results.length > 0 ? successfulPlays / results.length : 0;

                localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(games));
            }
        } catch (error) {
            console.error('Error updating game stats:', error);
        }
    },

    // Lưu kết quả chơi game
    saveGameResult: (gameId, result) => {
        try {
            const results = gameService.getGameResults(gameId);
            const newResult = {
                id: Date.now().toString(),
                gameId,
                ...result,
                playedAt: new Date().toISOString(),
            };

            results.push(newResult);
            localStorage.setItem(`${GAME_RESULTS_KEY}_${gameId}`, JSON.stringify(results));

            // Cập nhật thống kê game
            gameService.updateGameStats(gameId);

            return true;
        } catch (error) {
            console.error('Error saving game result:', error);
            return false;
        }
    },

    // Lấy kết quả chơi game
    getGameResults: (gameId) => {
        try {
            const results = localStorage.getItem(`${GAME_RESULTS_KEY}_${gameId}`);
            return results ? JSON.parse(results) : [];
        } catch (error) {
            console.error('Error loading game results:', error);
            return [];
        }
    },

    // Export games ra JSON
    exportGames: () => {
        try {
            const games = gameService.getAllGames();

            // Process games to ensure images are properly formatted
            const processedGames = games.map((game) => ({
                ...game,
                imageUrl: game.imageUrl || '',
                mistakeRegions: game.mistakeRegions || [],
            }));

            const dataStr = JSON.stringify(processedGames, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `spot-the-mistake-games-${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error exporting games:', error);
            return false;
        }
    },

    // Import games từ JSON
    importGames: (file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const fileContent = e.target.result;
                    console.log('File content:', fileContent.substring(0, 200) + '...'); // Debug log

                    const importedGames = JSON.parse(fileContent);
                    console.log('Parsed games:', importedGames); // Debug log

                    // Validate data structure
                    if (!Array.isArray(importedGames)) {
                        throw new Error('Invalid file format: Expected array of games');
                    }

                    // Validate each game has required fields
                    importedGames.forEach((game, index) => {
                        if (!game.id || !game.title) {
                            throw new Error(`Invalid game at index ${index}: Missing required fields (id, title)`);
                        }
                    });

                    // Merge với games hiện tại
                    const existingGames = gameService.getAllGames();
                    const mergedGames = [...existingGames];
                    let addedCount = 0;
                    let updatedCount = 0;

                    importedGames.forEach((importedGame) => {
                        const existingIndex = mergedGames.findIndex((game) => game.id === importedGame.id);
                        if (existingIndex >= 0) {
                            // Update existing
                            mergedGames[existingIndex] = {
                                ...importedGame,
                                updatedAt: new Date().toISOString(),
                            };
                            updatedCount++;
                        } else {
                            // Add new
                            mergedGames.push({
                                ...importedGame,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                totalPlays: importedGame.totalPlays || 0,
                                successRate: importedGame.successRate || 0,
                            });
                            addedCount++;
                        }
                    });

                    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(mergedGames));
                    console.log(`Import completed: ${addedCount} added, ${updatedCount} updated`);
                    resolve({ addedCount, updatedCount, totalGames: mergedGames.length });
                } catch (error) {
                    console.error('Import error:', error);
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    },
};

export default gameService;
