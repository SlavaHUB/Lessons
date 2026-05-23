const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
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

// Умная функция сборки названия урока (Код группы + Код ученика + Имя)
function buildLessonTitle(ev) {
    let parts = [];

    // 1. Ищем код группы (например, NIN489)
    if (ev.group && ev.group.title) {
        // Ищем подряд идущие английские буквы и цифры (NIN489, GR123)
        const groupCodeMatch = ev.group.title.match(/[a-zA-Z]+\d+/);
        if (groupCodeMatch) parts.push(groupCodeMatch[0]);
    }

    // 2. Ищем код ученика/курса в описании (например, NTk04, Nt75)
    if (ev.description) {
        // Берем самое первое слово до пробела, точки или скобки
        const firstWord = ev.description.split(/[\s.()]/)[0];
        // Если слово содержит английские буквы (значит это код, а не русское слово)
        if (firstWord && /[a-zA-Z]/.test(firstWord)) {
            if (!parts.includes(firstWord)) parts.push(firstWord);
        }
    }

    // 3. Добавляем имя ученика
    if (ev.subscribes && ev.subscribes.length > 0 && ev.subscribes[0].child_name) {
        parts.push(ev.subscribes[0].child_name);
    }

    // Если нашли хоть какие-то данные, склеиваем их через дефис
    if (parts.length > 0) {
        return parts.join(' - ');
    }

    // Если кодов нет, отдаем базовое название предмета
    return ev.subject ? ev.subject.title : 'Урок';
}

app.get('/api/schedule', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: 'Нужны параметры start и end' });

        const unixStart = Math.floor(new Date(start).getTime() / 1000);
        const unixEnd = unixStart + 7 * 24 * 60 * 60; 
        const datesArray = getDatesArray(start, end);
        let finalSchedule = [];

        // ==========================================
        // 1. ITCompot
        // ==========================================
        try {
            const itcRes = await fetch('https://it-school.t8s.ru/Interactive/GetSchedulesEvents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cookie': process.env.ITC_COOKIE, 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({
                    start: unixStart,
                    end: unixEnd,
                    model: { TeacherId: 12445, TrialLessonsOnly: false, StudyRequestsMode: false, SplitByClassrooms: true, DefaultView: "agendaWeek", ExpandableFormClosed: false, Submitted: false }
                })
            });
            const contentType = itcRes.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const itcData = await itcRes.json();
                if (itcData && itcData.Events) {
                    itcData.Events.forEach(ev => {
                        if (ev.title && !ev.title.includes('Занят(а)')) {
                            finalSchedule.push({
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
            } else finalSchedule.push({ isError: true, school: 'ITCompot' });
        } catch (e) { finalSchedule.push({ isError: true, school: 'ITCompot' }); }

        // ==========================================
        // 2. Zerocoder
        // ==========================================
        try {
            const zeroRes = await fetch('https://crm.genius-school.online/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-OCTOBER-REQUEST-HANDLER': 'onGetFilteredLessonsByDate', 'X-Requested-With': 'XMLHttpRequest', 'Cookie': process.env.ZERO_COOKIE },
                body: JSON.stringify({ dates: datesArray, teacher_id: 52617, is_extra: false })
            });
            const contentType = zeroRes.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const zeroData = await zeroRes.json();
                Object.values(zeroData).forEach(dayArray => {
                    if (Array.isArray(dayArray)) {
                        dayArray.forEach(ev => {
                            if (ev.is_empty_slot) return;
                            finalSchedule.push({
                                id: `zero_${ev.id}`,
                                date: ev.date,
                                startTime: ev.time.substring(0, 5),
                                endTime: addMinutesToTime(ev.time.substring(0, 5), ev.duration),
                                title: buildLessonTitle(ev), // Используем новую умную функцию
                                school: 'Zerocoder'
                            });
                        });
                    }
                });
            } else finalSchedule.push({ isError: true, school: 'Zerocoder' });
        } catch (e) { finalSchedule.push({ isError: true, school: 'Zerocoder' }); }

        // ==========================================
        // 3. Matrius
        // ==========================================
        try {
            const matRes = await fetch('https://crm.genius-school.online/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-OCTOBER-REQUEST-HANDLER': 'onGetFilteredLessonsByDate', 'X-Requested-With': 'XMLHttpRequest', 'Cookie': process.env.MATRIUS_COOKIE },
                body: JSON.stringify({ dates: datesArray, teacher_id: 51282, is_extra: false })
            });
            const contentType = matRes.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const matData = await matRes.json();
                Object.values(matData).forEach(dayArray => {
                    if (Array.isArray(dayArray)) {
                        dayArray.forEach(ev => {
                            if (ev.is_empty_slot) return;
                            finalSchedule.push({
                                id: `mat_${ev.id}`,
                                date: ev.date,
                                startTime: ev.time.substring(0, 5),
                                endTime: addMinutesToTime(ev.time.substring(0, 5), ev.duration),
                                title: buildLessonTitle(ev), // Применяем и для Матриус, так как CRM одинаковые
                                school: 'Matrius'
                            });
                        });
                    }
                });
            } else finalSchedule.push({ isError: true, school: 'Matrius' });
        } catch (e) { finalSchedule.push({ isError: true, school: 'Matrius' }); }

        res.json(finalSchedule);
    } catch (error) { res.status(500).json({ error: 'Ошибка' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));