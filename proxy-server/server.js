const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- ПОДКЛЮЧЕНИЕ К MONGODB ---
// Теперь сервер понимает любое название переменной, включая твое MONGODB_URL
const mongoString = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGODB_URL;

if (!mongoString) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Переменная базы данных не найдена в Render!');
} else {
    mongoose.connect(mongoString)
        .then(() => console.log('✅ MongoDB успешно подключена'))
        .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));
}

// Схема хранения наших данных (Цены, Статусы, Метки, Ручные переопределения)
const AppDataSchema = new mongoose.Schema({
    id: { type: String, default: 'main' },
    priceBook: { type: Object, default: {} },
    statusBook: { type: Object, default: {} },
    notesBook: { type: Object, default: {} },
    overridePriceBook: { type: Object, default: {} }
}, { minimize: false });

const AppData = mongoose.model('AppData', AppDataSchema);

// --- ЭНДПОИНТЫ ДЛЯ РАБОТЫ С БД ---
// 1. Получить данные из облака
app.get('/api/data', async (req, res) => {
    try {
        let data = await AppData.findOne({ id: 'main' });
        if (!data) data = await AppData.create({ id: 'main' });
        res.json(data);
    } catch (e) { res.status(500).json({ error: 'Ошибка загрузки БД' }); }
});

// 2. Сохранить изменения в облако
app.post('/api/data', async (req, res) => {
    try {
        const { priceBook, statusBook, notesBook, overridePriceBook } = req.body;
        await AppData.findOneAndUpdate(
            { id: 'main' },
            { priceBook, statusBook, notesBook, overridePriceBook },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Ошибка сохранения в БД' }); }
});

// --- СТАРЫЙ КОД ДЛЯ CRM ---
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
        const groupCodeMatch = ev.group.title.match(/[a-zA-Z]+\d+/);
        if (groupCodeMatch) parts.push(groupCodeMatch[0]);
    }
    if (ev.description) {
        const firstWord = ev.description.split(/[\s.()]/)[0];
        if (firstWord && /[a-zA-Z]/.test(firstWord)) { if (!parts.includes(firstWord)) parts.push(firstWord); }
    }
    if (ev.subscribes && ev.subscribes.length > 0 && ev.subscribes[0].child_name) { parts.push(ev.subscribes[0].child_name); }
    if (parts.length > 0) return parts.join(' - ');
    return ev.subject ? ev.subject.title : 'Урок';
}

app.get('/api/schedule', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: 'Нужны параметры start и end' });

        const unixStart = Math.floor(new Date(start).getTime() / 1000);
        const endObj = new Date(end); endObj.setHours(23, 59, 59);
        const unixEnd = Math.floor(endObj.getTime() / 1000);
        
        const datesArray = getDatesArray(start, end);
        let finalSchedule = [];

        const fetchITC = async () => {
            let events = [];
            try {
                const res = await fetch('https://it-school.t8s.ru/Interactive/GetSchedulesEvents', {
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
                const res = await fetch('https://crm.genius-school.online/', {
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
                                events.push({
                                    id: `zero_${ev.id}`, date: ev.date, startTime: ev.time.substring(0, 5), endTime: addMinutesToTime(ev.time.substring(0, 5), ev.duration),
                                    title: buildLessonTitle(ev), school: 'Zerocoder'
                                });
                            });
                        }
                    });
                } else events.push({ isError: true, school: 'Zerocoder' });
            } catch (e) { events.push({ isError: true, school: 'Zerocoder' }); }
            return events;
        };

        const [itcEvents, zeroEvents] = await Promise.all([fetchITC(), fetchZero()]);
        finalSchedule.push(...itcEvents, ...zeroEvents);
        res.json(finalSchedule);
    } catch (error) { res.status(500).json({ error: 'Ошибка' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));