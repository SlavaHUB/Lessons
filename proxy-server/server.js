const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

// Настройка CORS
app.use(cors());


app.use(express.json());

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

app.get('/api/schedule', async (req, res) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ error: 'Нужны параметры start и end (YYYY-MM-DD)' });
        }

        const unixStart = Math.floor(new Date(start).getTime() / 1000);
        const unixEnd = unixStart + 7 * 24 * 60 * 60; // Ровно 7 дней для ITCompot
        const datesArray = getDatesArray(start, end);

        let finalSchedule = [];

        // ==========================================
        // 1. ЗАПРОС К ITCOMPOT
        // ==========================================
        try {
            const itcRes = await fetch('https://it-school.t8s.ru/Interactive/GetSchedulesEvents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Cookie': process.env.ITC_COOKIE,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    start: unixStart,
                    end: unixEnd,
                    model: { TeacherId: 12445, TrialLessonsOnly: false, StudyRequestsMode: false, SplitByClassrooms: true, DefaultView: "agendaWeek", ExpandableFormClosed: false, Submitted: false }
                })
            });
            const itcData = await itcRes.json();

            if (itcData && itcData.Events) {
                itcData.Events.forEach(ev => {
                    if (ev.title && !ev.title.includes('Занят(а)')) {
                        const date = ev.start.split('T')[0];
                        const startTime = ev.start.split('T')[1].substring(0, 5);
                        const endTime = ev.end.split('T')[1].substring(0, 5);
                        const cleanTitle = ev.title.split('\r\n')[0].replace(' (Web-программирование (1 ступень frontend))', '').replace(' (Web-программирование (2 ступень backend))', '');

                        finalSchedule.push({
                            id: `itc_${ev.id}`,
                            date: date,
                            startTime: startTime,
                            endTime: endTime,
                            title: cleanTitle,
                            school: 'ITCompot',
                            status: 'Проведен'
                        });
                    }
                });
            }
        } catch (e) { console.error('Ошибка ITCompot:', e); }

        // ==========================================
        // 2. ЗАПРОС К ZEROCODER
        // ==========================================
        try {
            const zeroRes = await fetch('https://crm.genius-school.online/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-OCTOBER-REQUEST-HANDLER': 'onGetFilteredLessonsByDate',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cookie': process.env.ZERO_COOKIE
                },
                body: JSON.stringify({
                    dates: datesArray, teacher_id: 52617, branch_id: null, subject_ids: [], is_conducted: null, is_transfer: null, is_canceled: null, age: null, is_extra: false
                })
            });
            const zeroData = await zeroRes.json();

            Object.values(zeroData).forEach(dayArray => {
                if (Array.isArray(dayArray)) {
                    dayArray.forEach(ev => {
                        if (ev.is_empty_slot) return;
                        const startTime = ev.time.substring(0, 5);
                        const endTime = addMinutesToTime(startTime, ev.duration);

                        finalSchedule.push({
                            id: `zero_${ev.id}`,
                            date: ev.date,
                            startTime: startTime,
                            endTime: endTime,
                            title: ev.subject ? ev.subject.title : 'Урок',
                            school: 'Zerocoder',
                            status: 'Проведен'
                        });
                    });
                }
            });
        } catch (e) { console.error('Ошибка Zerocoder:', e); }

        // ==========================================
        // 3. ЗАПРОС К MATRIUS
        // ==========================================
        try {
            const matRes = await fetch('https://crm.genius-school.online/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-OCTOBER-REQUEST-HANDLER': 'onGetFilteredLessonsByDate',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cookie': process.env.MATRIUS_COOKIE
                },
                body: JSON.stringify({
                    dates: datesArray,
                    teacher_id: 51282, // ID для Matrius
                    branch_id: null, subject_ids: [], is_conducted: null, is_transfer: null, is_canceled: null, age: null, is_extra: false
                })
            });
            const matData = await matRes.json();

            Object.values(matData).forEach(dayArray => {
                if (Array.isArray(dayArray)) {
                    dayArray.forEach(ev => {
                        if (ev.is_empty_slot) return;
                        const startTime = ev.time.substring(0, 5);
                        const endTime = addMinutesToTime(startTime, ev.duration);

                        finalSchedule.push({
                            id: `mat_${ev.id}`,
                            date: ev.date,
                            startTime: startTime,
                            endTime: endTime,
                            title: ev.subject ? ev.subject.title : 'Урок',
                            school: 'Matrius',
                            status: 'Проведен'
                        });
                    });
                }
            });
        } catch (e) { console.error('Ошибка Matrius:', e); }

        res.json(finalSchedule);

    } catch (error) {
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Прокси-сервер запущен на порту ${PORT}`);
});