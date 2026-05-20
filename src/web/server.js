/**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

const express = require('express');
const fs = require('fs');
const path = require('path');
const startpairing = require('./pair');

const app = express();
const PORT = process.env.PORT || 1506;

// Session limit configuration
const MAX_SESSIONS = 50;

// Bot info file path
const BOT_INFO_PATH = path.join(__dirname, '../../database/auth.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Store for managing active sessions
const activeSessions = new Map();

// ── Bot Info Management ─────────────────────────────────────────────────────

function getDefaultBotInfo() {
    const settings = require('../config/settings');
    return {
        botName: settings.botName || '❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥',
        botOwner: settings.botOwner || '𝕰𝖒𝖒𝖞𝕳𝖊𝖓𝖟',
        ownerNumber: settings.ownerNumber || '2349125042727',
        version: settings.version || '2.0.0',
        maxSessions: MAX_SESSIONS,
        description: settings.description || 'WhatsApp Multi-Device Pairing Bot'
    };
}

function loadBotInfo() {
    try {
        if (fs.existsSync(BOT_INFO_PATH)) {
            const raw = fs.readFileSync(BOT_INFO_PATH, 'utf8').trim();
            if (raw && raw !== '[]' && raw !== '{}') {
                const data = JSON.parse(raw);
                if (data && typeof data === 'object' && !Array.isArray(data) && data.botName) {
                    return { ...getDefaultBotInfo(), ...data };
                }
            }
        }
    } catch (error) {
        console.error('Error loading bot info:', error.message);
    }
    // Initialize with defaults
    const defaults = getDefaultBotInfo();
    saveBotInfo(defaults);
    return defaults;
}

function saveBotInfo(info) {
    try {
        const dir = path.dirname(BOT_INFO_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(BOT_INFO_PATH, JSON.stringify(info, null, 2));
    } catch (error) {
        console.error('Error saving bot info:', error.message);
    }
}

// ── Phone Number Validation ─────────────────────────────────────────────────

function validatePhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');

    if (cleaned.startsWith('0')) {
        return { valid: false, error: 'Phone numbers starting with 0 are not allowed' };
    }
    if (!/^\d+$/.test(cleaned)) {
        return { valid: false, error: 'Phone numbers can only contain digits' };
    }
    if (cleaned.length < 10) {
        return { valid: false, error: 'Phone number must be at least 10 digits' };
    }
    if (cleaned.length > 15) {
        return { valid: false, error: 'Phone number cannot exceed 15 digits' };
    }

    return { valid: true, number: cleaned };
}

// ── Session Helpers ─────────────────────────────────────────────────────────

function isSessionLimitReached() {
    return activeSessions.size >= MAX_SESSIONS;
}

function countSessionFolders() {
    const pairingDir = './database/session';
    if (!fs.existsSync(pairingDir)) return 0;

    try {
        return fs.readdirSync(pairingDir).filter(folder => {
            const sessionPath = path.join(pairingDir, folder);
            return fs.statSync(sessionPath).isDirectory() && folder.endsWith('@s.whatsapp.net');
        }).length;
    } catch (error) {
        console.error('Error counting session folders:', error);
        return 0;
    }
}

function getSessionStatus(phoneNumber) {
    // Check global.activeConnections (set by pair.js) for real-time socket status
    if (global.activeConnections && global.activeConnections.has(phoneNumber)) {
        return global.activeConnections.get(phoneNumber).status || 'unknown';
    }
    // Fallback to activeSessions map
    const session = activeSessions.get(phoneNumber);
    return session ? session.status : 'disconnected';
}

// ── Load Existing Sessions ──────────────────────────────────────────────────

function loadExistingSessions() {
    const pairingDir = './database/session';

    if (!fs.existsSync(pairingDir)) {
        fs.mkdirSync(pairingDir, { recursive: true });
        return;
    }

    try {
        const sessionFolders = fs.readdirSync(pairingDir);
        let loadedCount = 0;

        sessionFolders.forEach(folder => {
            if (loadedCount >= MAX_SESSIONS) return;

            const sessionPath = path.join(pairingDir, folder);
            const stats = fs.statSync(sessionPath);

            if (stats.isDirectory() && folder.endsWith('@s.whatsapp.net')) {
                const phoneNumber = folder.replace('@s.whatsapp.net', '');
                const validation = validatePhoneNumber(phoneNumber);

                if (validation.valid) {
                    console.log(`Loading existing session: ${phoneNumber}`);
                    activeSessions.set(phoneNumber, {
                        status: 'loaded',
                        sessionPath: sessionPath,
                        loadedAt: new Date(),
                        sessionId: folder
                    });

                    try {
                        startpairing(folder);
                    } catch (error) {
                        console.error(`Error starting session for ${phoneNumber}:`, error);
                    }

                    loadedCount++;
                }
            }
        });

        console.log(`Loaded ${activeSessions.size} existing sessions (limit: ${MAX_SESSIONS})`);

        const totalFolders = countSessionFolders();
        if (totalFolders > MAX_SESSIONS) {
            console.warn(`Warning: Found ${totalFolders} session folders, but only loaded ${MAX_SESSIONS} due to session limit`);
        }
    } catch (error) {
        console.error('Error loading existing sessions:', error);
    }
}

// ── Routes ──────────────────────────────────────────────────────────────────

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// ── Bot Info API ────────────────────────────────────────────────────────────

app.get('/api/bot-info', (req, res) => {
    const info = loadBotInfo();
    res.json({
        success: true,
        ...info,
        currentSessions: activeSessions.size,
        maxSessions: MAX_SESSIONS
    });
});

app.put('/api/bot-info', (req, res) => {
    try {
        const current = loadBotInfo();
        const updates = {};

        // Only allow updating specific fields
        const allowedFields = ['botName', 'botOwner', 'description', 'ownerNumber'];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const updated = { ...current, ...updates };
        saveBotInfo(updated);

        res.json({ success: true, ...updated });
    } catch (error) {
        console.error('Error updating bot info:', error);
        res.status(500).json({ success: false, error: 'Failed to update bot info' });
    }
});

// ── Pairing API ─────────────────────────────────────────────────────────────

app.post('/request-pairing', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        if (isSessionLimitReached()) {
            return res.status(429).json({
                success: false,
                error: `Session limit reached. Maximum ${MAX_SESSIONS} sessions allowed.`,
                limit: MAX_SESSIONS,
                current: activeSessions.size
            });
        }

        const validation = validatePhoneNumber(phoneNumber);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        const cleanedNumber = validation.number;
        const sessionId = `${cleanedNumber}@s.whatsapp.net`;

        // Add to active sessions
        activeSessions.set(cleanedNumber, {
            status: 'requesting',
            createdAt: new Date(),
            sessionId: sessionId
        });

        console.log(`Requesting pairing code for: ${cleanedNumber} (${activeSessions.size}/${MAX_SESSIONS})`);

        // Start pairing process
        await startpairing(sessionId);

        // Wait for pairing code
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            try {
                const pairingFilePath = './database/session/pairing.json';
                if (fs.existsSync(pairingFilePath)) {
                    const pairingData = JSON.parse(fs.readFileSync(pairingFilePath, 'utf8'));
                    if (pairingData.code) {
                        activeSessions.set(cleanedNumber, {
                            ...activeSessions.get(cleanedNumber),
                            status: 'code_generated',
                            pairingCode: pairingData.code
                        });

                        fs.unlinkSync(pairingFilePath);

                        return res.json({
                            success: true,
                            phoneNumber: cleanedNumber,
                            sessionId: sessionId,
                            pairingCode: pairingData.code,
                            message: 'Pairing code generated successfully',
                            sessionInfo: {
                                current: activeSessions.size,
                                limit: MAX_SESSIONS,
                                remaining: MAX_SESSIONS - activeSessions.size
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error reading pairing file:', error);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        activeSessions.delete(cleanedNumber);

        return res.status(408).json({
            success: false,
            error: 'Pairing code generation timed out. Please try again.'
        });

    } catch (error) {
        console.error('Error in pairing request:', error);

        if (req.body.phoneNumber) {
            const validation = validatePhoneNumber(req.body.phoneNumber);
            if (validation.valid) {
                activeSessions.delete(validation.number);
            }
        }

        return res.status(500).json({
            success: false,
            error: 'Internal server error occurred while generating pairing code'
        });
    }
});

// ── Sessions API ────────────────────────────────────────────────────────────

app.get('/sessions', (req, res) => {
    const sessions = Array.from(activeSessions.entries()).map(([phoneNumber, info]) => ({
        phoneNumber,
        ...info,
        // Override status with real-time connection status from global map
        status: getSessionStatus(phoneNumber)
    }));

    res.json({
        success: true,
        sessions: sessions,
        total: sessions.length,
        limit: MAX_SESSIONS,
        remaining: MAX_SESSIONS - sessions.length
    });
});

// ── Session Status API ──────────────────────────────────────────────────────

app.get('/api/session/:phoneNumber/status', (req, res) => {
    const { phoneNumber } = req.params;
    const validation = validatePhoneNumber(phoneNumber);

    if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
    }

    const cleanedNumber = validation.number;
    const status = getSessionStatus(cleanedNumber);
    const hasSession = activeSessions.has(cleanedNumber);

    res.json({
        success: true,
        phoneNumber: cleanedNumber,
        status: status,
        exists: hasSession,
        hasActiveSocket: !!(global.activeConnections && global.activeConnections.has(cleanedNumber))
    });
});

// ── Delete Session API (with proper socket disconnect) ──────────────────────

app.delete('/session/:phoneNumber', async (req, res) => {
    const { phoneNumber } = req.params;

    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            error: validation.error
        });
    }

    const cleanedNumber = validation.number;
    const sessionId = `${cleanedNumber}@s.whatsapp.net`;

    if (!activeSessions.has(cleanedNumber)) {
        return res.status(404).json({
            success: false,
            error: 'Session not found'
        });
    }

    // ── Step 1: Disconnect the active WhatsApp socket ──────────────────────
    try {
        if (global.activeConnections && global.activeConnections.has(cleanedNumber)) {
            const conn = global.activeConnections.get(cleanedNumber);
            if (conn && conn.socket) {
                console.log(`🔌 Disconnecting socket for ${cleanedNumber}...`);
                try {
                    // Try logout first (tells WhatsApp server to end the session)
                    await conn.socket.logout().catch(() => {});
                } catch (_) {
                    // Logout may fail if already disconnected, that's ok
                }
                try {
                    // End the socket connection
                    conn.socket.end(new Error('Session deleted by user'));
                } catch (_) {
                    // end() may throw if already closed
                }
                console.log(`✅ Socket disconnected for ${cleanedNumber}`);
            }
            global.activeConnections.delete(cleanedNumber);
        }
    } catch (error) {
        console.error(`Error disconnecting socket for ${cleanedNumber}:`, error.message);
    }

    // ── Step 2: Remove from active sessions map ────────────────────────────
    activeSessions.delete(cleanedNumber);

    // ── Step 3: Delete session files from disk ─────────────────────────────
    const sessionDir = `./database/session/${sessionId}`;
    try {
        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
            console.log(`🗑️ Session files deleted for ${cleanedNumber}`);
        }
    } catch (error) {
        console.error(`Error removing session directory for ${cleanedNumber}:`, error);
    }

    res.json({
        success: true,
        message: `Session for +${cleanedNumber} disconnected and removed successfully`,
        sessionInfo: {
            current: activeSessions.size,
            limit: MAX_SESSIONS,
            remaining: MAX_SESSIONS - activeSessions.size
        }
    });
});

// ── Error Handling ──────────────────────────────────────────────────────────

app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// ── Start Server ────────────────────────────────────────────────────────────

function startServer() {
    app.listen(PORT, () => {
        console.log(`🚀 WhatsApp Pairing Server running on port ${PORT}`);
        console.log(`📱 Access the web interface at: http://localhost:${PORT}`);
        console.log(`📊 Session limit: ${MAX_SESSIONS} concurrent sessions`);

        // Initialize bot info on startup
        loadBotInfo();

        // Load existing sessions after server starts
        setTimeout(loadExistingSessions, 1000);
    });
}

module.exports = startServer;

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Server terminated');
    process.exit(0);
});