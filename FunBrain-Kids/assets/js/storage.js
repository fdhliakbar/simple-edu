// ===== STORAGE MANAGER =====
class StorageManager {
    static instance = null;
    static storageType = null;
    static prefix = 'FunBrainKids_';
    static memoryStorage = {};

    static getInstance() {
        if (!this.instance) {
            this.instance = new StorageManager();
        }
        return this.instance;
    }

    static getStorageType() {
        if (this.storageType) return this.storageType;
        
        try {
            const testKey = 'storage_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            this.storageType = 'localStorage';
            return 'localStorage';
        } catch (e) {
            console.warn('localStorage not available, using sessionStorage');
            try {
                const testKey = 'storage_test';
                sessionStorage.setItem(testKey, 'test');
                sessionStorage.removeItem(testKey);
                this.storageType = 'sessionStorage';
                return 'sessionStorage';
            } catch (e2) {
                console.warn('sessionStorage not available, using memory storage');
                this.storageType = 'memory';
                return 'memory';
            }
        }
    }

    static getStorage() {
        const storageType = this.getStorageType();
        switch (storageType) {
            case 'localStorage':
                return localStorage;
            case 'sessionStorage':
                return sessionStorage;
            case 'memory':
                return this.memoryStorage;
            default:
                return {};
        }
    }

    static save(key, data) {
        try {
            const fullKey = this.prefix + key;
            const jsonData = JSON.stringify(data);
            
            if (this.getStorageType() === 'memory') {
                this.getStorage()[fullKey] = jsonData;
            } else {
                this.getStorage().setItem(fullKey, jsonData);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    static load(key) {
        try {
            const fullKey = this.prefix + key;
            let jsonData;
            
            if (this.getStorageType() === 'memory') {
                jsonData = this.getStorage()[fullKey];
            } else {
                jsonData = this.getStorage().getItem(fullKey);
            }
            
            if (jsonData) {
                return JSON.parse(jsonData);
            }
            
            return null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    static remove(key) {
        try {
            const fullKey = this.prefix + key;
            
            if (this.getStorageType() === 'memory') {
                delete this.getStorage()[fullKey];
            } else {
                this.getStorage().removeItem(fullKey);
            }
            
            return true;
        } catch (error) {
            console.error('Error removing data:', error);
            return false;
        }
    }

    static clear(key) {
        return this.remove(key);
    }

    clear(key = null) {
        try {
            if (key) {
                return this.remove(key);
            }
            
            // Clear all FunBrainKids data
            if (this.storageType === 'memory') {
                const storage = this.getStorage();
                Object.keys(storage).forEach(storageKey => {
                    if (storageKey.startsWith(this.prefix)) {
                        delete storage[storageKey];
                    }
                });
            } else {
                const storage = this.getStorage();
                const keysToRemove = [];
                
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => storage.removeItem(key));
            }
            
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    exists(key) {
        const fullKey = this.prefix + key;
        
        if (this.storageType === 'memory') {
            return fullKey in this.getStorage();
        } else {
            return this.getStorage().getItem(fullKey) !== null;
        }
    }

    getSize() {
        try {
            let size = 0;
            
            if (this.storageType === 'memory') {
                const storage = this.getStorage();
                Object.keys(storage).forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        size += storage[key].length;
                    }
                });
            } else {
                const storage = this.getStorage();
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        const value = storage.getItem(key);
                        if (value) {
                            size += value.length;
                        }
                    }
                }
            }
            
            return size;
        } catch (error) {
            console.error('Error getting storage size:', error);
            return 0;
        }
    }

    static getAllKeys() {
        try {
            const keys = [];
            
            if (this.getStorageType() === 'memory') {
                const storage = this.getStorage();
                Object.keys(storage).forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        keys.push(key.replace(this.prefix, ''));
                    }
                });
            } else {
                const storage = this.getStorage();
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        keys.push(key.replace(this.prefix, ''));
                    }
                }
            }
            
            return keys;
        } catch (error) {
            console.error('Error getting all keys:', error);
            return [];
        }
    }

    static export() {
        try {
            const data = {};
            const keys = this.getAllKeys();
            
            keys.forEach(key => {
                data[key] = this.load(key);
            });
            
            return {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: data
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    static import(exportData) {
        try {
            if (!exportData || !exportData.data) {
                throw new Error('Invalid export data');
            }
            
            // Clear existing data
            this.clearAll();
            
            // Import new data
            Object.keys(exportData.data).forEach(key => {
                this.save(key, exportData.data[key]);
            });
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    static clearAll() {
        try {
            const keys = this.getAllKeys();
            keys.forEach(key => this.remove(key));
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    }

    // Game-specific methods
    static saveGameProgress(gameType, progress) {
        const key = `gameProgress_${gameType}`;
        return this.save(key, progress);
    }

    static loadGameProgress(gameType) {
        const key = `gameProgress_${gameType}`;
        return this.load(key);
    }

    static savePlayerStats(stats) {
        return this.save('playerStats', stats);
    }

    static loadPlayerStats() {
        return this.load('playerStats') || {
            totalGamesPlayed: 0,
            totalStarsEarned: 0,
            totalTimeSpent: 0,
            achievements: [],
            favoriteGame: null
        };
    }

    static saveSettings(settings) {
        return this.save('settings', settings);
    }

    static loadSettings() {
        return this.load('settings') || {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'normal',
            language: 'id',
            animations: true
        };
    }

    static saveHighScore(gameType, score) {
        const key = `highScore_${gameType}`;
        const currentHighScore = this.load(key) || 0;
        
        if (score > currentHighScore) {
            this.save(key, score);
            return true; // New high score
        }
        
        return false;
    }

    static loadHighScore(gameType) {
        const key = `highScore_${gameType}`;
        return this.load(key) || 0;
    }

    static saveUnlockedGames(games) {
        return this.save('unlockedGames', games);
    }

    static loadUnlockedGames() {
        return this.load('unlockedGames') || ['letters'];
    }

    static saveAchievements(achievements) {
        return this.save('achievements', achievements);
    }

    static loadAchievements() {
        return this.load('achievements') || {};
    }

    // Analytics methods
    static trackGameStart(gameType) {
        const stats = this.loadPlayerStats();
        stats.totalGamesPlayed++;
        
        const gameKey = `game_${gameType}_played`;
        const gameCount = this.load(gameKey) || 0;
        this.save(gameKey, gameCount + 1);
        
        this.savePlayerStats(stats);
    }

    static trackGameComplete(gameType, score, timeSpent) {
        const stats = this.loadPlayerStats();
        stats.totalStarsEarned += score;
        stats.totalTimeSpent += timeSpent;
        
        // Update favorite game
        const gameKey = `game_${gameType}_played`;
        const gameCount = this.load(gameKey) || 0;
        
        if (!stats.favoriteGame || gameCount > (this.load(`game_${stats.favoriteGame}_played`) || 0)) {
            stats.favoriteGame = gameType;
        }
        
        this.savePlayerStats(stats);
        
        // Save high score
        this.saveHighScore(gameType, score);
    }

    static getGameStatistics() {
        const stats = this.loadPlayerStats();
        const gameTypes = ['letters', 'fruits', 'numbers', 'colors', 'time'];
        
        const gameStats = gameTypes.map(gameType => ({
            gameType,
            timesPlayed: this.load(`game_${gameType}_played`) || 0,
            highScore: this.loadHighScore(gameType),
            progress: this.loadGameProgress(gameType)
        }));
        
        return {
            overall: stats,
            games: gameStats
        };
    }

    // Backup and restore methods
    static createBackup() {
        const backup = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: this.export()
        };
        
        const backupString = JSON.stringify(backup);
        const blob = new Blob([backupString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `funbrainkids_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static restoreBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    if (backup.data && this.import(backup.data)) {
                        resolve(true);
                    } else {
                        reject(new Error('Invalid backup file'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    // Privacy methods
    static hasParentalConsent() {
        return this.load('parentalConsent') === true;
    }

    static setParentalConsent(consent) {
        return this.save('parentalConsent', consent);
    }

    static getDataRetentionPeriod() {
        return this.load('dataRetentionPeriod') || 365; // days
    }

    static setDataRetentionPeriod(days) {
        return this.save('dataRetentionPeriod', days);
    }

    static cleanupOldData() {
        const retentionPeriod = this.getDataRetentionPeriod();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);
        
        const keys = this.getAllKeys();
        keys.forEach(key => {
            const data = this.load(key);
            if (data && data.timestamp) {
                const dataDate = new Date(data.timestamp);
                if (dataDate < cutoffDate) {
                    this.remove(key);
                }
            }
        });
    }
}

// Export StorageManager as static class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
} else {
    window.StorageManager = StorageManager;
}
