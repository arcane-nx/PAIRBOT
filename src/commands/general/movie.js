/**
 * Created By EmmyHenz
 * Contact Me on wa.me/2349125042727
 * commands/movie.js
 *
 * Architecture adapted from TECHLORD's approach
 * API: https://moviebox-api-production.up.railway.app
 *
 * COMMANDS:
 *  .movie <title>          → Search, shows numbered list, user replies with number
 *  .dlmovie <id> [s] [e]  → Download by ID (auto-triggered after selection)
 *  .smsubs <id> [s] [e]   → Show available subtitle languages
 *  .moviecancel            → Cancel active session
 *
 * FLOW:
 *  .movie batman
 *    → Shows list: 1. 🎬 Batman (1989)  2. 📺 Batman The Series  ...
 *  User types "2"
 *    → If MOVIE  → auto-runs .dlmovie <id> → downloads + sends MP4
 *    → If SERIES → shows season list → user types "1" → episode list → user types "5"
 *              → auto-runs .dlmovie <id> 1 5 → downloads + sends MP4
 */

const axios = require('axios')
const fs    = require('fs')
const path  = require('path')

// ── API Base ──────────────────────────────────────────────────────────────────
const API = 'https://moviebox-api-production.up.railway.app'

// ── Global session store (keyed by userId) ────────────────────────────────────
if (!global.movieSessions)   global.movieSessions   = {}
if (!global.movieSubCache)   global.movieSubCache   = {}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtSize(bytes) {
    if (!bytes) return '?'
    const gb = bytes / 1e9
    return gb >= 1 ? `${gb.toFixed(2)} GB` : `${(bytes / 1e6).toFixed(0)} MB`
}
function pad2(n) { return String(n).padStart(2, '0') }

async function apiGet(path_) {
    const res = await axios.get(`${API}${path_}`, { timeout: 25000 })
    if (res.data?.success === 'false') throw new Error(res.data.message || 'API error')
    return res.data?.results || res.data
}

// ── Main exported function ────────────────────────────────────────────────────
// main.js calls: movieCommand(sock, chatId, message, argsArray)
// We adapt to also support the command routing internally
async function movieCommand(sock, chatId, message, argsOrCommand, _senderId) {
    const from   = chatId
    const m      = message
    const userId = message.key.participant || message.key.remoteJid

    // Normalise: argsOrCommand can be array (from .movie dispatch) or string command
    let command, args
    if (Array.isArray(argsOrCommand)) {
        command = 'movie'
        args    = argsOrCommand
    } else {
        // Called internally for other commands
        command = String(argsOrCommand || '').toLowerCase()
        args    = []
    }

    const reply = (text) => sock.sendMessage(from, { text, ...CH }, { quoted: m }).catch(console.error)

    switch (command) {
        case 'movie':
        case 'film':
        case 'cinema':
        case 'sm':
        case 'cineverse':
            return await handleSearch(sock, from, m, args, userId, reply)

        case 'dlmovie':
        case 'downloadmovie':
            return await handleDownload(sock, from, m, args, userId, reply)

        case 'smsubs':
            return await handleSubtitles(sock, from, m, args, reply)

        case 'moviecancel':
        case 'cancelmovie':
            return await handleCancel(userId, reply)

        default:
            return await handleSearch(sock, from, m, args, userId, reply)
    }
}

// ── handleMoviePick — called from main.js for number replies ──────────────────
// main.js calls: handleMoviePick(sock, chatId, message, userMessage)
async function handleMoviePick(sock, chatId, message, userMessage, _senderId) {
    const userId  = message.key.participant || message.key.remoteJid
    const session = global.movieSessions[userId]
    if (!session) return false

    const reply = (text) => sock.sendMessage(chatId, { text, ...CH }, { quoted: message }).catch(console.error)

    // Check if message is a number
    const num = parseInt(userMessage.trim())
    if (isNaN(num) || num < 1) return false

    // ── Session: pick_movie ───────────────────────────────────────────────────
    if (session.stage === 'pick_movie') {
        if (num > session.results.length) {
            await reply(`❌ Pick 1–${session.results.length}, or *.moviecancel* to quit.`)
            return true
        }
        const movie    = session.results[num - 1]
        const isSeries = movie.subjectType === 2

        if (isSeries) {
            // Fetch seasons
            await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } }).catch(() => {})
            try {
                const info    = await apiGet(`/api/info/${movie.id}`)
                const subject = info?.subject || {}
                let seasons   = subject.seasons || []

                if (!seasons.length) {
                    const sc = subject.seasonCount || 1
                    const ec = subject.episodeCount || 12
                    seasons  = Array.from({ length: sc }, (_, i) => ({
                        num:      i + 1,
                        episodes: Math.ceil(ec / sc)
                    }))
                } else {
                    seasons = seasons.map(s => ({
                        num:      s.season || s.seasonNumber || s.index || 1,
                        episodes: s.episodeCount || s.episodes || '?'
                    }))
                }
                seasons.sort((a, b) => a.num - b.num)

                session.stage         = 'pick_season'
                session.selectedMovie = movie
                session.seasons       = seasons
                global.movieSessions[userId] = session

                let text = `📺 *${movie.title}*\n`
                text += `━━━━━━━━━━━━━━━━━━━━━━\n`
                text += `🗂️ *AVAILABLE SEASONS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n`
                seasons.forEach(s => {
                    text += `*${s.num}.* Season ${s.num}  —  ${s.episodes} episodes\n`
                })
                text += `\n_Reply with season number_\n_*.moviecancel* to quit_`
                await reply(text)
            } catch (_) {
                await reply(`📺 *${movie.title}* is a series.\n\nReply with: *season episode*\nExample: \`1 3\` for S1E3\n\n*.moviecancel* to quit.`)
                session.stage         = 'pick_season_ep'
                session.selectedMovie = movie
                global.movieSessions[userId] = session
            }
        } else {
            // Movie — download immediately
            delete global.movieSessions[userId]
            await handleDownload(sock, chatId, message, [movie.id], userId,
                (text) => sock.sendMessage(chatId, { text, ...CH }, { quoted: message }).catch(console.error)
            )
        }
        return true
    }

    // ── Session: pick_season ──────────────────────────────────────────────────
    if (session.stage === 'pick_season') {
        const seasons = session.seasons
        const sel     = seasons.find(s => s.num === num) || seasons[num - 1]
        if (!sel) {
            await reply(`❌ Pick 1–${seasons.length}`)
            return true
        }

        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } }).catch(() => {})

        // Fetch episodes for this season
        let episodes = []
        try {
            const info = await apiGet(`/api/info/${session.selectedMovie.id}`)
            const subj = info?.subject || {}
            const all  = subj.episodes || subj.tvInfo?.episodes || []
            if (all.length) {
                episodes = all
                    .filter(e => (e.season || e.seasonNumber || 1) === sel.num)
                    .map(e => ({
                        num:  e.episode || e.episodeNumber || e.index,
                        name: e.title || e.name || `Episode ${e.episode || e.episodeNumber}`
                    }))
            }
        } catch (_) { /* ignore */ }

        if (!episodes.length) {
            const count  = typeof sel.episodes === 'number' ? sel.episodes : 12
            episodes = Array.from({ length: count }, (_, i) => ({ num: i + 1, name: `Episode ${i + 1}` }))
        }

        session.stage         = 'pick_episode'
        session.selectedSeason = sel.num
        session.episodes      = episodes
        global.movieSessions[userId] = session

        let text = `📺 *${session.selectedMovie.title}* — Season ${sel.num}\n`
        text += `━━━━━━━━━━━━━━━━━━━━━━\n`
        text += `🎞️ *EPISODES*\n━━━━━━━━━━━━━━━━━━━━━━\n\n`
        const limit = 24
        episodes.slice(0, limit).forEach(ep => {
            text += `*${ep.num}.* ${ep.name}\n`
        })
        if (episodes.length > limit) text += `\n_...${episodes.length - limit} more. Type episode number directly._`
        text += `\n\n_Reply with episode number_\n_*.moviecancel* to quit_`
        await reply(text)
        return true
    }

    // ── Session: pick_episode ─────────────────────────────────────────────────
    if (session.stage === 'pick_episode') {
        const ep = session.episodes.find(e => e.num === num) || session.episodes[num - 1]
        if (!ep) {
            await reply(`❌ Pick 1–${session.episodes.length}`)
            return true
        }
        const movieId = session.selectedMovie.id
        const season  = session.selectedSeason
        delete global.movieSessions[userId]

        await handleDownload(sock, chatId, message, [movieId, String(season), String(ep.num)], userId,
            (text) => sock.sendMessage(chatId, { text, ...CH }, { quoted: message }).catch(console.error)
        )
        return true
    }

    // ── Session: pick_season_ep (fallback for when no season list) ────────────
    if (session.stage === 'pick_season_ep') {
        await reply('❌ Format: `season episode` — e.g. `1 3`\n*.moviecancel* to quit.')
        return true
    }

    return false
}

// ── Search handler ────────────────────────────────────────────────────────────
async function handleSearch(sock, from, m, args, userId, reply) {
    const query = args.join(' ').trim()
    if (!query) {
        return reply(
            `🎬 *MOVIE COMMAND*\n\n` +
            `*Usage:* \`.movie <title>\`\n\n` +
            `*Examples:*\n` +
            `• \`.movie batman\`\n` +
            `• \`.movie breaking bad\`\n\n` +
            `_After results appear, reply with a number to download_`
        )
    }

    try {
        await sock.sendMessage(from, { react: { text: '🔎', key: m.key } }).catch(() => {})
        reply(`🔎 *Searching:* _"${query}"_\n_Please wait..._`)

        const data    = await apiGet(`/api/search/${encodeURIComponent(query)}`)
        const results = (data?.items || []).slice(0, 8)

        if (!results.length) {
            await sock.sendMessage(from, { react: { text: '❌', key: m.key } }).catch(() => {})
            return reply(`❌ *No results for:* "${query}"\n\nTry a different title.`)
        }

        // Cache subtitle info if available
        results.forEach(r => {
            if (r.subtitles) global.movieSubCache[r.id] = r.subtitles
        })

        // Store session
        global.movieSessions[userId] = { stage: 'pick_movie', results, query }
        // Auto-expire session after 5 minutes
        setTimeout(() => {
            if (global.movieSessions[userId]?.query === query) {
                delete global.movieSessions[userId]
            }
        }, 5 * 60 * 1000)

        // Build result text
        let text = `🎬 *Results for:* _"${query}"_\n`
        text += `━━━━━━━━━━━━━━━━━━━━━━\n`
        text += `_Reply with a number to select_\n\n`

        results.forEach((r, i) => {
            const icon  = r.subjectType === 2 ? '📺' : '🎬'
            const title = r.title || r.name || 'Unknown'
            const year  = r.releaseYear || r.year || 'N/A'
            const genre = (r.genres || []).slice(0, 2).join(', ')
            const type  = r.subjectType === 2 ? 'Series' : 'Movie'
            text += `*${i + 1}.* ${icon} *${title}* (${year})\n`
            text += `    🎭 ${genre || type}  📌 ${type}\n\n`
        })
        text += `💡 _Send *.moviecancel* to cancel_`

        // Send with cover of first result
        const cover = results[0]?.thumbnail || results[0]?.cover?.url
        if (cover) {
            try {
                await sock.sendMessage(from, {
                    image: { url: cover },
                    caption: text,
                    ...CH
                }, { quoted: m })
                await sock.sendMessage(from, { react: { text: '✅', key: m.key } }).catch(() => {})
                return
            } catch (_) { /* ignore */ }
        }

        await reply(text)
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } }).catch(() => {})

    } catch (e) {
        console.error('[MOVIE SEARCH ERROR]', e.message)
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } }).catch(() => {})
        reply(`❌ Search failed: ${e.message}\n_Please try again._`)
    }
}

// ── Download handler ──────────────────────────────────────────────────────────
async function handleDownload(sock, from, m, args, userId, reply) {
    const movieId = String(args[0] || '').trim()
    const season  = args[1] && args[1] !== 'null' ? args[1] : null
    const episode = args[2] && args[2] !== 'null' ? args[2] : null
    const subLang = args.slice(3).join(' ').trim()

    if (!movieId) {
        return reply(
            `📥 *DOWNLOAD COMMAND*\n\n` +
            `*.dlmovie <id>* — Movie\n` +
            `*.dlmovie <id> <season> <episode>* — Series episode\n` +
            `*.dlmovie <id> <s> <e> English* — With subtitles\n\n` +
            `_Get ID from *.movie <title>* search_`
        )
    }

    // Safe temp dir
    const tempDir = path.join(process.cwd(), 'temp_movies')
    try { if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true }) } catch (_) { /* ignore */ }

    let tempPath = null

    try {
        await sock.sendMessage(from, { react: { text: '⏳', key: m.key } }).catch(() => {})
        const epLabel = season ? ` S${pad2(season)}E${pad2(episode)}` : ''
        const subMsg  = subLang ? `\n🗣️ Subtitle: *${subLang}*` : ''
        reply(`⏳ *Fetching${epLabel}...*${subMsg}\n_Please wait, this may take a minute_`)

        // Get movie info first for title + cover
        let title = movieId, cover = null
        try {
            const info  = await apiGet(`/api/info/${movieId}`)
            const subj  = info?.subject || {}
            title = subj.title || subj.name || movieId
            cover = subj.thumbnail || subj.cover?.url
        } catch (_) { /* ignore */ }

        // Get sources
        let sourcePath = `/api/sources/${movieId}`
        if (season && episode) sourcePath += `?season=${season}&episode=${episode}`

        const srcData = await apiGet(sourcePath)
        const sources = (srcData?.processedSources || srcData?.downloads || [])
            .filter(s => s.streamUrl || s.proxyUrl || s.directUrl)

        if (!sources.length) throw new Error('No download sources found. Try another episode.')

        // Best source = first (API returns best first)
        const src  = sources[0]
        const url  = src.streamUrl || src.proxyUrl || src.directUrl
        const qual = src.quality || 'HD'
        const size = fmtSize(src.size)

        const fileName = `${title.replace(/[^a-z0-9 ]/gi, '_')}${epLabel}_${qual}.mp4`
        tempPath = path.join(tempDir, fileName)

        reply(`📥 *Downloading ${size}...*\n_Streaming ${qual} to WhatsApp_`)

        // Stream download to temp file
        const dlRes = await axios({ url, method: 'GET', responseType: 'stream', timeout: 0 })
        const writer = fs.createWriteStream(tempPath)
        await new Promise((resolve, reject) => {
            dlRes.data.pipe(writer)
            writer.on('finish', resolve)
            writer.on('error', reject)
        })

        reply(`☁️ *Download complete (${size})!*\n_Sending to WhatsApp..._`)

        // Get thumbnail
        let thumb = null
        if (cover) {
            try {
                const tr = await axios.get(cover, { responseType: 'arraybuffer', timeout: 8000 })
                thumb = Buffer.from(tr.data)
            } catch (_) { /* ignore */ }
        }

        const caption =
            `🎬 *${title}${epLabel}*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `📦 Size: *${size}*\n` +
            `⚡ Quality: *${qual}*\n\n` +
            `▶️ _Stream URL:_\n${url}\n\n` +
            `_© EmmyHenz Bot v3.5 — wa.me/2349125042727_`

        const fileMsg = {
            document:  fs.readFileSync(tempPath),
            mimetype:  'video/mp4',
            fileName,
            caption,
            ...CH
        }
        if (thumb) fileMsg.jpegThumbnail = thumb

        await sock.sendMessage(from, fileMsg, { quoted: m })

        // Cleanup
        try { fs.unlinkSync(tempPath) } catch (_) { /* ignore */ }
        tempPath = null

        // Send subtitle if available from sources
        if (srcData?.subtitle_url) {
            try {
                const subRes = await axios.get(srcData.subtitle_url, { responseType: 'arraybuffer', timeout: 20000 })
                await sock.sendMessage(from, {
                    document: Buffer.from(subRes.data),
                    mimetype: 'application/x-subrip',
                    fileName: `Subtitles_${subLang || 'English'}.srt`,
                    caption:  `📝 *${subLang || 'English'} Subtitles*`,
                    ...CH
                }, { quoted: m })
            } catch (_) { /* ignore */ }
        }

        // Show other available qualities
        if (sources.length > 1) {
            let qText = `📦 *Other Qualities Available:*\n━━━━━━━━━━━━━━━━━━━━━━\n\n`
            sources.slice(1).forEach(s => {
                const u = s.streamUrl || s.proxyUrl || s.directUrl
                qText += `• *${s.quality || 'HD'}*${s.size ? ' · ' + fmtSize(s.size) : ''}\n${u}\n\n`
            })
            qText += `_Copy the URL to download in browser or VLC_`
            await reply(qText)
        }

        await sock.sendMessage(from, { react: { text: '✅', key: m.key } }).catch(() => {})

    } catch (e) {
        console.error('[DLMOVIE ERROR]', e.message)
        if (tempPath) { try { fs.unlinkSync(tempPath) } catch (_) { /* ignore */ } }
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } }).catch(() => {})
        reply(`❌ *Download failed:* ${e.message}\n\n_Try a different episode or search again._`)
    }
}

// ── Subtitle handler ──────────────────────────────────────────────────────────
async function handleSubtitles(sock, from, m, args, reply) {
    const movieId = args[0]
    const season  = args[1] || 'null'
    const episode = args[2] || 'null'

    if (!movieId) return reply('❌ Usage: `.smsubs <id> [season] [episode]`')

    let subList = []

    // Check cache first
    const cached = global.movieSubCache[movieId]
    if (cached && cached !== 'None') {
        subList = typeof cached === 'string'
            ? cached.split(',').map(s => s.trim()).filter(Boolean)
            : Array.isArray(cached) ? cached : []
    }

    // Fetch from API if not cached
    if (!subList.length) {
        try {
            const info = await apiGet(`/api/info/${movieId}`)
            const subj = info?.subject || {}
            if (subj.subtitles) {
                subList = typeof subj.subtitles === 'string'
                    ? subj.subtitles.split(',').map(s => s.trim()).filter(Boolean)
                    : Array.isArray(subj.subtitles)
                        ? subj.subtitles.map(s => s.language || s)
                        : []
                global.movieSubCache[movieId] = subList
            }
        } catch (e) {
            console.error('[SMSUBS ERROR]', e.message)
        }
    }

    if (!subList.length) return reply('💬 No subtitles available for this title.')

    let msg = `🗣️ *AVAILABLE SUBTITLES*\n━━━━━━━━━━━━━━━━━━━━━━\n\n`
    subList.forEach(sub => {
        msg += `🌐 *${sub}*\n`
        msg += `👉 \`.dlmovie ${movieId} ${season} ${episode} ${sub}\`\n\n`
    })
    msg += `_Copy and send one of the commands above to download with subtitles_`
    await reply(msg)
}

// ── Cancel handler ────────────────────────────────────────────────────────────
async function handleCancel(userId, reply) {
    if (global.movieSessions[userId]) {
        delete global.movieSessions[userId]
        return reply('✅ Movie session cancelled.')
    }
    return reply('⚠️ No active movie session found.')
}

// ── Channel info ──────────────────────────────────────────────────────────────
const CH = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid:  '120363410694173688@newsletter',
            newsletterName: '❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.5🎊❤️‍🔥',
            serverMessageId: -1
        }
    }
}

module.exports = {
    name: 'movie',
    alias: ['film', 'cinema', 'sm', 'cineverse', 'dlmovie', 'smsubs', 'moviecancel'],
    handleMoviePick,
    async exec(sock, chatId, msg, args, rawText) {
        const command = rawText.split(' ')[0].slice(1).toLowerCase();
        return movieCommand(sock, chatId, msg, args, command);
    }
};
