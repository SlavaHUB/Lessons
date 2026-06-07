const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const LessonState = mongoose.model('LessonState', new mongoose.Schema({
    lessonId: { type: String, unique: true, required: true },
    status: String, notes: String, price: Number, date: String,
    monthYear: String // добавили для хранения по месяцам
}));

const PriceBook = mongoose.model('PriceBook', new mongoose.Schema({
    configId: { type: String, default: 'main_config', unique: true },
    prices: { type: Map, of: mongoose.Schema.Types.Mixed }
}));

app.get('/api/lessons/states', async (req, res) => {
    try { res.json(await LessonState.find({})); }
    catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});

app.post('/api/lessons/states', async (req, res) => {
    try {
        const { lessonId, status, notes, price, date } = req.body;
        const monthYear = date ? date.substring(0, 7) : '';
        const updated = await LessonState.findOneAndUpdate(
            { lessonId }, { status, notes, price, date, monthYear }, { upsert: true, new: true }
        );
        res.json(updated);
    } catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});

app.get('/api/prices', async (req, res) => {
    try {
        let config = await PriceBook.findOne({ configId: 'main_config' }) || await PriceBook.create({ configId: 'main_config', prices: {} });
        res.json(config.prices || {});
    } catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});

app.post('/api/prices', async (req, res) => {
    try {
        const config = await PriceBook.findOneAndUpdate({ configId: 'main_config' }, { prices: req.body }, { upsert: true, new: true });
        res.json(config.prices);
    } catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});

function addMinutesToTime(timeStr, minsToAdd) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(2000, 0, 1, hours, minutes + minsToAdd);
    return date.toTimeString().substring(0, 5);
}

function getDatesArray(startStr, endStr) {
    const dates = [];
    let curr = new Date(startStr);
    const end = new Date(endStr);
    while (curr <= end) {
        dates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
    }
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
        if (firstWord && /[a-zA-Z]/.test(firstWord)) {
            if (!parts.includes(firstWord)) parts.push(firstWord);
        }
    }
    if (ev.subscribes && ev.subscribes.length > 0 && ev.subscribes[0].child_name) {
        parts.push(ev.subscribes[0].child_name);
    }
    if (parts.length > 0) return parts.join(' - ');
    return ev.subject ? ev.subject.title : 'Урок';
}

app.get('/api/schedule', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: 'Нужны параметры start и end' });

        const unixStart = Math.floor(new Date(start).getTime() / 1000);
        const endObj = new Date(end);
        endObj.setHours(23, 59, 59);
        const unixEnd = Math.floor(endObj.getTime() / 1000);

        const datesArray = getDatesArray(start, end);
        let finalSchedule = [];

        // 1. ПАРСЕР ITCompot
        const fetchITC = async () => {
            let events = [];
            try {
                const res = await fetch('https://it-school.t8s.ru/Interactive/GetSchedulesEvents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cookie': process.env.ITC_COOKIE, 'X-Requested-With': 'XMLHttpRequest' },
                    body: JSON.stringify({
                        start: unixStart,
                        end: unixEnd,
                        model: { TeacherId: 12445, TrialLessonsOnly: false, StudyRequestsMode: false, SplitByClassrooms: true, DefaultView: "agendaWeek", ExpandableFormClosed: false, Submitted: false }
                    })
                });
                if (res.headers.get("content-type")?.includes("application/json")) {
                    const data = await res.json();
                    if (data && data.Events) {
                        data.Events.forEach(ev => {
                            if (ev.title && !ev.title.includes('Занят(а)')) {
                                events.push({
                                    id: `itc_${ev.id}`,
                                    date: ev.start.split('T')[0],
                                    startTime: ev.start.split('T')[1].substring(0, 5),
                                    endTime: ev.end.split('T')[1].substring(0, 5),
                                    title: ev.title.split('\r\n')[0].replace(' (Web-программирование (1 ступень frontend))', '').replace(' (Web-программирование (2 ступень backend))', ''),
                                    school: 'ITCompot'
                                });
                            }
                        });
                    }
                } else events.push({ isError: true, school: 'ITCompot' });
            } catch (e) { events.push({ isError: true, school: 'ITCompot' }); }
            return events;
        };

        // 2. ПАРСЕР Zerocoder
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
                                    id: `zero_${ev.id}`,
                                    date: ev.date,
                                    startTime: ev.time.substring(0, 5),
                                    endTime: addMinutesToTime(ev.time.substring(0, 5), ev.duration),
                                    title: buildLessonTitle(ev),
                                    school: 'Zerocoder'
                                });
                            });
                        }
                    });
                } else events.push({ isError: true, school: 'Zerocoder' });
            } catch (e) { events.push({ isError: true, school: 'Zerocoder' }); }
            return events;
        };

        // Запрашиваем только 2 школы
        const [itcEvents, zeroEvents] = await Promise.all([fetchITC(), fetchZero()]);

        finalSchedule.push(...itcEvents, ...zeroEvents);
        res.json(finalSchedule);

    } catch (error) { res.status(500).json({ error: 'Ошибка' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));