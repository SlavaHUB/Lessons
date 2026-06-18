const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*';
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '2mb' }));

// Отключаем буферизацию команд, чтобы сразу видеть ошибки, если они есть
mongoose.set('bufferCommands', false);

// --- 1. ПОДКЛЮЧЕНИЕ К БАЗЕ ---
// Берем URL из .env (теперь поддерживаются оба варианта названия)
const mongoString = process.env.MONGO_URI || process.env.MONGODB_URL;

// --- 2. СХЕМЫ ДАННЫХ ---
const AppData = mongoose.model('AppData', new mongoose.Schema({
    id: { type: String, default: 'main', unique: true },
    priceBook: { type: mongoose.Schema.Types.Mixed, default: {} },
    statusBook: { type: mongoose.Schema.Types.Mixed, default: {} },
    notesBook: { type: mongoose.Schema.Types.Mixed, default: {} },
    overridePriceBook: { type: mongoose.Schema.Types.Mixed, default: {} },
    customLessons: { type: Array, default: [] },
    schemaVersion: { type: Number, default: 1 },
    revision: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
}, { minimize: false }));

const PriceBook = mongoose.model('PriceBook', new mongoose.Schema({
    configId: { type: String, default: 'main_config' },
    prices: { type: Map, of: mongoose.Schema.Types.Mixed }
}));

// --- 3. ЭНДПОИНТЫ ДЛЯ БД (Универсальные) ---

function escapeMongoKey(key) {
    return encodeURIComponent(String(key)).replace(/%/g, '%25');
}

function unescapeMongoKey(key) {
    try {
        return decodeURIComponent(String(key).replace(/%25/g, '%'));
    } catch (e) {
        return key;
    }
}

function normalizeMapForStorage(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const result = {};
    Object.entries(value).forEach(([key, val]) => {
        result[escapeMongoKey(key)] = val;
    });
    return result;
}

function denormalizeMap(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const result = {};
    Object.entries(value).forEach(([key, val]) => {
        result[unescapeMongoKey(key)] = val;
    });
    return result;
}

function serializeAppData(data) {
    return {
        priceBook: denormalizeMap(data.priceBook || {}),
        statusBook: denormalizeMap(data.statusBook || {}),
        notesBook: denormalizeMap(data.notesBook || {}),
        overridePriceBook: denormalizeMap(data.overridePriceBook || {}),
        customLessons: data.customLessons || [],
        schemaVersion: data.schemaVersion || 1,
        revision: data.revision || 0,
        updatedAt: data.updatedAt || null
    };
}

app.get('/api/data', async (req, res) => {
    try {
        let data = await AppData.findOne({ id: 'main' });
        if (!data) data = await AppData.create({ id: 'main' });
        res.json(serializeAppData(data));
    } catch (e) {
        console.error('Ошибка GET /api/data:', e.stack || e.message);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        const body = req.body || {};
        const now = new Date();
        const current = await AppData.findOne({ id: 'main' });
        const nextRevision = (current?.revision || 0) + 1;

        const data = await AppData.findOneAndUpdate(
            { id: 'main' },
            {
                $set: {
                    priceBook: normalizeMapForStorage(body.priceBook),
                    statusBook: normalizeMapForStorage(body.statusBook),
                    notesBook: normalizeMapForStorage(body.notesBook),
                    overridePriceBook: normalizeMapForStorage(body.overridePriceBook),
                    customLessons: Array.isArray(body.customLessons) ? body.customLessons : [],
                    schemaVersion: 1,
                    revision: nextRevision,
                    updatedAt: now
                }
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, revision: data.revision, updatedAt: data.updatedAt });
    } catch (e) {
        console.error('Ошибка POST /api/data:', e.stack || e.message);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/health', async (req, res) => {
    try {
        const mongoReady = mongoose.connection.readyState === 1;
        res.json({
            ok: mongoReady,
            mongo: mongoReady ? 'connected' : 'disconnected',
            dbUriConfigured: !!mongoString,
            itcCookieConfigured: !!process.env.ITC_COOKIE,
            zeroCookieConfigured: !!process.env.ZERO_COOKIE,
            now: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

app.get('/api/prices', async (req, res) => {
    try {
        let config = await PriceBook.findOne({ configId: 'main_config' });
        if (!config) config = await PriceBook.create({ configId: 'main_config', prices: {} });
        res.json(config.prices || {});
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/prices', async (req, res) => {
    try {
        const config = await PriceBook.findOneAndUpdate({ configId: 'main_config' }, { prices: req.body }, { upsert: true, new: true });
        res.json(config.prices);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- 4. ПАРСЕРЫ CRM ---
const CRM_REQUEST_TIMEOUT_MS = 10000;

function fetchWithTimeout(url, options = {}, timeoutMs = CRM_REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timeout));
}

function addMinutesToTime(timeStr, minsToAdd) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(2000, 0, 1, hours, minutes + minsToAdd);
    return date.toTimeString().substring(0, 5);
}

function getDatesArray(startStr, endStr) {
    const dates = []; let curr = new Date(startStr); const end = new Date(endStr);
    while (curr <= end) { dates.push(curr.toISOString().split('T')[0]); curr.setDate(curr.getDate() + 1); }
    return dates;
}

function buildLessonTitle(ev) {
    let parts = [];
    if (ev.group && ev.group.title) {
        const match = ev.group.title.match(/[a-zA-Z]+\d+/);
        if (match) parts.push(match[0]);
    }
    if (ev.description) {
        const firstWord = ev.description.split(/[\s.()]/)[0];
        if (firstWord && /[a-zA-Z]/.test(firstWord) && !parts.includes(firstWord)) parts.push(firstWord);
    }
    if (ev.subscribes && ev.subscribes.length > 0 && ev.subscribes[0].child_name) { parts.push(ev.subscribes[0].child_name); }
    return parts.length > 0 ? parts.join(' - ') : (ev.subject ? ev.subject.title : 'Урок');
}

app.get('/api/schedule', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: 'Нужны параметры start и end' });

        const unixStart = Math.floor(new Date(start).getTime() / 1000);
        const endObj = new Date(end); endObj.setHours(23, 59, 59);
        const unixEnd = Math.floor(endObj.getTime() / 1000);
        const datesArray = getDatesArray(start, end);

        const fetchITC = async () => {
            let events = [];
            try {
                const res = await fetchWithTimeout('https://it-school.t8s.ru/Interactive/GetSchedulesEvents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cookie': process.env.ITC_COOKIE, 'X-Requested-With': 'XMLHttpRequest' },
                    body: JSON.stringify({ start: unixStart, end: unixEnd, model: { TeacherId: 12445, TrialLessonsOnly: false, StudyRequestsMode: false, SplitByClassrooms: true, DefaultView: "agendaWeek", ExpandableFormClosed: false, Submitted: false } })
                });
                if (res.headers.get("content-type")?.includes("application/json")) {
                    const data = await res.json();
                    if (data && data.Events) {
                        data.Events.forEach(ev => {
                            if (ev.title && !ev.title.includes('Занят(а)')) {
                                events.push({
                                    id: `itc_${ev.id}`, date: ev.start.split('T')[0], startTime: ev.start.split('T')[1].substring(0, 5), endTime: ev.end.split('T')[1].substring(0, 5),
                                    title: ev.title.split('\r\n')[0].replace(' (Web-программирование (1 ступень frontend))', '').replace(' (Web-программирование (2 ступень backend))', ''), school: 'ITCompot'
                                });
                            }
                        });
                    }
                } else events.push({ isError: true, school: 'ITCompot' });
            } catch (e) { events.push({ isError: true, school: 'ITCompot' }); }
            return events;
        };

        const fetchZero = async () => {
            let events = [];
            try {
                const res = await fetchWithTimeout('https://crm.genius-school.online/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-OCTOBER-REQUEST-HANDLER': 'onGetFilteredLessonsByDate', 'X-Requested-With': 'XMLHttpRequest', 'Cookie': process.env.ZERO_COOKIE },
                    body: JSON.stringify({ dates: datesArray, teacher_id: 52617, is_extra: false })
                });
                if (res.headers.get("content-type")?.includes("application/json")) {
                    const data = await res.json();
                    Object.values(data).forEach(dayArray => {
                        if (Array.isArray(dayArray)) {
                            dayArray.forEach(ev => {
                                if (ev.is_empty_slot) return;
                                events.push({ id: `zero_${ev.id}`, date: ev.date, startTime: ev.time.substring(0, 5), endTime: addMinutesToTime(ev.time.substring(0, 5), ev.duration), title: buildLessonTitle(ev), school: 'Zerocoder' });
                            });
                        }
                    });
                } else events.push({ isError: true, school: 'Zerocoder' });
            } catch (e) { events.push({ isError: true, school: 'Zerocoder' }); }
            return events;
        };

        const [itcEvents, zeroEvents] = await Promise.all([fetchITC(), fetchZero()]);
        res.json([...itcEvents, ...zeroEvents]);
    } catch (error) { res.status(500).json({ error: 'Ошибка' }); }
});

// --- 5. ЗАПУСК СЕРВЕРА С ОЖИДАНИЕМ ПОДКЛЮЧЕНИЯ ---
const PORT = process.env.PORT || 3000;

async function startServer() {
    if (!mongoString) {
        console.warn('⚠️ MONGO_URI / MONGODB_URL не задан в .env. БД недоступна.');
    } else {
        try {
            // Ждем подключения к MongoDB перед тем, как поднимать сервер
            await mongoose.connect(mongoString, {
                serverSelectionTimeoutMS: 5000,
                family: 4
            });
            console.log('✅ MongoDB успешно подключена!');
        } catch (err) {
            console.error('❌ Ошибка подключения к MongoDB:', err);
        }
    }

    // Запускаем Express только после попытки подключения к БД
    app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
}

startServer();