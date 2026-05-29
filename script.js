// ==========================================
// НАСТРОЙКИ СЕРВЕРА И ТЕМЫ
// ==========================================
const API_URL = 'https://lessons-mqy0.onrender.com/api/schedule';
let currentWeekMonday = getMonday(new Date());

const BYN_RATE = 0.0387;
const ITCOMPOT_RATE = 190;
const HOUR_HEIGHT = 80;
const START_HOUR = 8;
const END_HOUR = 23;
const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const monthsRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

const LINKS = {
  ITCompot: 'https://it-school.t8s.ru/Interactive/12445?TeacherId=12445&TrialLessonsOnly=False&StudyRequestsMode=False&ClassroomsColumnsMode=True&DefaultView=agendaWeek&ExpandableFormClosed=False&Submitted=False',
  Zerocoder: 'https://crm.genius-school.online/#/lessons',
  Matrius: 'https://crm.genius-school.online/#/lessons'
};

// ==========================================
// КЭШ И ДАННЫЕ
// ==========================================
let scheduleData = JSON.parse(localStorage.getItem('cachedSchedule')) || [];
let loadedStartStr = localStorage.getItem('loadedStartStr') || "";
let loadedEndStr = localStorage.getItem('loadedEndStr') || "";
let isFetching = false;
let currentEditingLesson = null;

let priceBook = JSON.parse(localStorage.getItem('lessonPrices_v2')) || {};
let statusBook = JSON.parse(localStorage.getItem('lessonStatuses')) || {};
let notesBook = JSON.parse(localStorage.getItem('lessonNotes')) || {};

document.documentElement.setAttribute('data-theme', 'dark');

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }
function formatDateToString(date) {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
}
function getTheme(school, dayName) {
  if (dayName === 'Вт' || dayName === 'Ср') return 'theme-red';
  switch (school) {
    case 'RTS': return 'theme-blue';
    case 'ITCompot': return 'theme-green';
    case 'Zerocoder': return 'theme-purple';
    case 'Matrius': return 'theme-grey';
    default: return 'theme-blue';
  }
}
function timeToMins(timeStr) { const [h, m] = timeStr.split(':').map(Number); return h * 60 + m; }
function minsToTime(mins) { const h = Math.floor(mins / 60).toString().padStart(2, '0'); const m = (mins % 60).toString().padStart(2, '0'); return `${h}:${m}`; }
function timeToPixels(timeStr) { const [hours, minutes] = timeStr.split(':').map(Number); return ((hours - START_HOUR) + minutes / 60) * HOUR_HEIGHT; }
function updateModalTotals(price) {
  const byn = (price * BYN_RATE).toFixed(2);
  document.getElementById('lm-total-rub').textContent = `${price} ₽`;
  document.getElementById('lm-total-byn').textContent = `(≈ ${byn} Br)`;
}
function getStandardPrice(school, duration) {
  if (school === 'ITCompot' && duration === 45) return 390;
  if (school === 'Zerocoder' && duration === 45) return 450;
  if (school === 'Zerocoder' && duration === 30) return 300;
  if (school === 'Matrius' && duration === 90) return 645;
  return 0;
}

// ==========================================
// СЕТЕВАЯ ЛОГИКА
// ==========================================
async function fetchLessons(forceSync = false) {
  const viewStart = currentWeekMonday;
  const viewEnd = addDays(currentWeekMonday, 6);
  let hasCacheForThisWeek = false;
  if (loadedStartStr && loadedEndStr) {
    const vsTime = viewStart.getTime(); const veTime = viewEnd.getTime();
    const lsTime = new Date(loadedStartStr).getTime(); const leTime = new Date(loadedEndStr).getTime();
    if (vsTime >= lsTime && veTime <= leTime) hasCacheForThisWeek = true;
  }
  if (hasCacheForThisWeek && !forceSync) { initCalendar(); return; }
  if (isFetching) return;
  isFetching = true;

  const btnRefresh = document.getElementById('btn-refresh');
  if (btnRefresh && forceSync) btnRefresh.innerHTML = '⏳';

  try {
    const reqStart = addDays(currentWeekMonday, -7);
    const reqEnd = addDays(currentWeekMonday, 21);
    const startStr = formatDateToString(reqStart);
    const endStr = formatDateToString(reqEnd);

    const response = await fetch(`${API_URL}?start=${startStr}&end=${endStr}`);
    if (response.ok) {
      const rawData = await response.json();
      const validEvents = [];
      rawData.forEach(item => { if (!item.isError) validEvents.push(item); });
      scheduleData = validEvents;
      localStorage.setItem('cachedSchedule', JSON.stringify(scheduleData));
      localStorage.setItem('loadedStartStr', startStr);
      localStorage.setItem('loadedEndStr', endStr);
      loadedStartStr = startStr; loadedEndStr = endStr;
      initCalendar();
    }
  } catch (error) {
    if (scheduleData.length > 0) initCalendar();
  } finally {
    isFetching = false;
    if (btnRefresh) btnRefresh.innerHTML = '🔄';
  }
}

// ==========================================
// ЛОГИКА МОДАЛКИ ДЕТАЛЕЙ УРОКА (Статусы и Метки)
// ==========================================
function openLessonModal(event, dayName) {
  currentEditingLesson = { event, dayName };
  document.getElementById('lm-school').textContent = event.school || 'Неизвестно';
  const [, month, day] = event.date.split('-');
  document.getElementById('lm-time').textContent = `${day}.${month} | ${event.startTime} - ${event.endTime}`;
  document.getElementById('lm-name').textContent = event.title;

  const lessonKey = `${dayName}_${event.startTime}_${event.title}`;
  let currentPrice = parseFloat(priceBook[lessonKey]);
  let currentStatus = statusBook[lessonKey] || 'done';
  const currentNote = notesBook[lessonKey] || '';

  const duration = timeToMins(event.endTime) - timeToMins(event.startTime);
  const isPerStudent = (event.school === 'ITCompot' && duration >= 90);
  currentEditingLesson.isPerStudent = isPerStudent;

  if (isNaN(currentPrice)) currentPrice = getStandardPrice(event.school, duration);

  const priceZone = document.getElementById('lm-price-zone');

  function renderPriceInput(price) {
    if (isPerStudent) {
      const students = price > 0 ? Math.round(price / ITCOMPOT_RATE) : 0;
      priceZone.innerHTML = `<label>Количество учеников (по ${ITCOMPOT_RATE} ₽):</label><input type="number" id="lm-input-price" value="${students}" min="0" step="1">`;
      updateModalTotals(students * ITCOMPOT_RATE);
    } else {
      priceZone.innerHTML = `<label>Стоимость урока (₽):</label><input type="number" id="lm-input-price" value="${price}" min="0" step="10">`;
      updateModalTotals(price);
    }
    document.getElementById('lm-input-price').addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      updateModalTotals(isPerStudent ? val * ITCOMPOT_RATE : val);
    });
  }

  renderPriceInput(currentPrice);
  document.getElementById('lm-notes').value = currentNote;

  // Логика кнопок статуса
  document.querySelectorAll('.status-btn').forEach(btn => {
    if (btn.dataset.status === currentStatus) btn.classList.add('active');
    else btn.classList.remove('active');

    btn.onclick = (e) => {
      document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentStatus = e.target.dataset.status;

      let newPrice = currentPrice;
      if (currentStatus === 'canceled') newPrice = 0;
      else if (currentStatus === 'noshow') {
        if (event.school === 'Zerocoder' && duration === 45) newPrice = 135;
        else if (event.school === 'Zerocoder' && duration === 30) newPrice = 90;
        // Matrius и ITCompot остаются по умолчанию (или то, что ввел юзер)
        else newPrice = isNaN(parseFloat(priceBook[lessonKey])) ? getStandardPrice(event.school, duration) : currentPrice;
      } else {
        newPrice = getStandardPrice(event.school, duration);
      }
      currentPrice = newPrice;
      renderPriceInput(newPrice);
    };
  });

  document.getElementById('lesson-modal').classList.add('active');
}

document.getElementById('btn-lm-save').addEventListener('click', () => {
  if (!currentEditingLesson) return;
  const inputVal = parseFloat(document.getElementById('lm-input-price').value) || 0;
  const finalPrice = currentEditingLesson.isPerStudent ? inputVal * ITCOMPOT_RATE : inputVal;

  const { event, dayName } = currentEditingLesson;
  const lessonKey = `${dayName}_${event.startTime}_${event.title}`;

  // Сохраняем цену, статус и метки
  priceBook[lessonKey] = finalPrice;
  statusBook[lessonKey] = document.querySelector('.status-btn.active').dataset.status;
  notesBook[lessonKey] = document.getElementById('lm-notes').value.trim();

  localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));
  localStorage.setItem('lessonStatuses', JSON.stringify(statusBook));
  localStorage.setItem('lessonNotes', JSON.stringify(notesBook));

  calcSalary();
  initCalendar();
  document.getElementById('lesson-modal').classList.remove('active');
});

// ==========================================
// ОТРИСОВКА КАЛЕНДАРЯ
// ==========================================
function initCalendar() {
  const header = document.getElementById('calendar-header');
  const timeLabels = document.getElementById('time-labels');
  const daysGrid = document.getElementById('days-grid');
  const rangeDisplay = document.getElementById('week-range-display');

  header.innerHTML = '<div class="time-header-cell"></div>'; timeLabels.innerHTML = ''; daysGrid.innerHTML = '';

  const sundayOfCurrentWeek = addDays(currentWeekMonday, 6);
  const startMonth = monthsRu[currentWeekMonday.getMonth()]; const endMonth = monthsRu[sundayOfCurrentWeek.getMonth()];
  const currentYear = currentWeekMonday.getFullYear();

  if (currentWeekMonday.getMonth() === sundayOfCurrentWeek.getMonth()) rangeDisplay.textContent = `${currentWeekMonday.getDate()} – ${sundayOfCurrentWeek.getDate()} ${startMonth} ${currentYear} г.`;
  else rangeDisplay.textContent = `${currentWeekMonday.getDate()} ${startMonth} – ${sundayOfCurrentWeek.getDate()} ${endMonth} ${currentYear} г.`;

  const realTodayStr = formatDateToString(new Date());
  const currentWeekDates = [];

  for (let i = 0; i < 7; i++) {
    const dateForDay = addDays(currentWeekMonday, i);
    currentWeekDates.push(dateForDay);
    const todayClass = formatDateToString(dateForDay) === realTodayStr ? ' today' : '';
    header.innerHTML += `<div class="day-header${todayClass}">${daysOfWeek[i]} <span>${dateForDay.getDate()}.${dateForDay.getMonth() + 1}</span></div>`;
  }

  for (let i = START_HOUR; i <= END_HOUR; i++) timeLabels.innerHTML += `<div class="time-slot">${i.toString().padStart(2, '0') + ':00'}</div>`;

  daysOfWeek.forEach((dayName, index) => {
    const dayCol = document.createElement('div'); dayCol.className = 'day-column';
    const columnDateStr = formatDateToString(currentWeekDates[index]);
    if (columnDateStr === realTodayStr) dayCol.classList.add('today');
    if (index === 1 || index === 2) dayCol.classList.add('day-off');

    const events = scheduleData.filter(e => e.date === columnDateStr);

    events.forEach(event => {
      const topPx = timeToPixels(event.startTime);
      const heightPx = Math.max(timeToPixels(event.endTime) - topPx, (45 / 60) * HOUR_HEIGHT);
      const eventDiv = document.createElement('div');

      const lessonKey = `${dayName}_${event.startTime}_${event.title}`;
      const status = statusBook[lessonKey] || 'done';

      eventDiv.className = `event-card ${getTheme(event.school, dayName)}`;
      if (status === 'canceled') eventDiv.classList.add('status-canceled');
      if (status === 'noshow') eventDiv.classList.add('status-noshow');

      eventDiv.style.top = `${topPx}px`; eventDiv.style.height = `${heightPx}px`;

      const price = parseFloat(priceBook[lessonKey]) || 0;
      const priceHtml = price > 0 ? `<div class="event-price-tag"><span class="price-rub">${price} ₽</span><span class="price-byn">≈ ${(price * BYN_RATE).toFixed(2)} Br</span></div>` : '';
      const pinHtml = notesBook[lessonKey] ? `<div class="event-note-pin" title="${notesBook[lessonKey]}">📌</div>` : '';

      eventDiv.innerHTML = `
        ${pinHtml}
        <div class="event-time">${event.startTime} - ${event.endTime}</div>
        <div class="event-body"><div class="event-title">${event.title}</div>${priceHtml}</div>
      `;
      eventDiv.addEventListener('click', () => openLessonModal(event, dayName));
      dayCol.appendChild(eventDiv);
    });
    daysGrid.appendChild(dayCol);
  });
}

// ==========================================
// СТАТИСТИКА, ИСТОРИЯ И ЗАРПЛАТА
// ==========================================
const historicalData = [
  { month: 'Март 2026', sum: 56520 },
  { month: 'Апрель 2026', sum: 52800 },
  { month: 'Май 2026', sum: 46880 }
];

document.getElementById('tab-current').onclick = () => {
  document.getElementById('stats-current-view').style.display = 'block';
  document.getElementById('stats-history-view').style.display = 'none';
  document.getElementById('tab-current').className = 'btn-primary';
  document.getElementById('tab-history').className = 'btn-secondary';
};

document.getElementById('tab-history').onclick = () => {
  document.getElementById('stats-current-view').style.display = 'none';
  document.getElementById('stats-history-view').style.display = 'block';
  document.getElementById('tab-history').className = 'btn-primary';
  document.getElementById('tab-current').className = 'btn-secondary';

  let html = '<h4 style="margin: 0 0 15px 0;">Данные из Excel:</h4>';
  historicalData.forEach(d => {
    html += `<div class="history-row"><strong>${d.month}</strong><span>${d.sum} ₽ <span style="font-size:0.8rem; color:var(--text-muted);">(≈ ${(d.sum * BYN_RATE).toFixed(2)} Br)</span></span></div>`;
  });
  document.getElementById('stats-history-view').innerHTML = html;
};

function openStats() {
  const listContainer = document.getElementById('price-settings-list');
  listContainer.innerHTML = '';
  const currentWeekDates = []; for (let i = 0; i < 7; i++) currentWeekDates.push(formatDateToString(addDays(currentWeekMonday, i)));

  currentWeekDates.forEach((dateStr, index) => {
    const dayEvents = scheduleData.filter(e => e.date === dateStr);
    if (dayEvents.length === 0) return;
    const [, month, day] = dateStr.split('-');
    let dayHtml = `<div class="stat-day-header">${daysOfWeek[index]} (${day}.${month})</div>`;

    dayEvents.forEach(ev => {
      const lessonKey = `${daysOfWeek[index]}_${ev.startTime}_${ev.title}`;
      let cPrice = priceBook[lessonKey];
      if (cPrice === undefined) {
        const dur = timeToMins(ev.endTime) - timeToMins(ev.startTime);
        cPrice = getStandardPrice(ev.school, dur) || '';
      }
      dayHtml += `<div class="price-row"><span class="price-title">${ev.startTime} - ${ev.title}</span><input type="number" class="price-input" data-key="${lessonKey}" value="${cPrice}"></div>`;
    });
    listContainer.innerHTML += dayHtml;
  });

  document.querySelectorAll('.price-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      priceBook[e.target.dataset.key] = parseFloat(e.target.value) || 0;
      localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));
      calcSalary(); initCalendar();
    });
  });
  calcSalary();
  document.getElementById('stats-modal').classList.add('active');
}

function calcSalary() {
  let todaySum = 0; let weekSum = 0;
  const realTodayStr = formatDateToString(new Date());
  const currentWeekDates = []; for (let i = 0; i < 7; i++) currentWeekDates.push(formatDateToString(addDays(currentWeekMonday, i)));

  scheduleData.filter(e => currentWeekDates.includes(e.date)).forEach(ev => {
    const lessonKey = `${daysOfWeek[new Date(ev.date).getDay() === 0 ? 6 : new Date(ev.date).getDay() - 1]}_${ev.startTime}_${ev.title}`;
    const price = parseFloat(priceBook[lessonKey]) || 0;
    weekSum += price; if (ev.date === realTodayStr) todaySum += price;
  });

  const monthProjectSum = Math.round(weekSum * 4.33);
  document.getElementById('stat-today').innerHTML = `${todaySum} ₽ <span class="byn-text">(${(todaySum * BYN_RATE).toFixed(2)} Br)</span>`;
  document.getElementById('stat-week').innerHTML = `${weekSum} ₽ <span style="font-size: 0.8rem; color: var(--text-muted);">(${(weekSum * BYN_RATE).toFixed(2)} Br)</span>`;
  document.getElementById('stat-month-project').innerHTML = `${monthProjectSum} ₽ <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">(${(monthProjectSum * BYN_RATE).toFixed(2)} Br)</span>`;
}

// ==========================================
// ПОИСК СВОБОДНЫХ ОКОШЕК (С ФАНТОМНЫМИ УРОКАМИ)
// ==========================================
function findFreeSlots() {
  const duration = parseInt(document.getElementById('input-slot-duration').value) || 45;
  const selectedIndexes = Array.from(document.querySelectorAll('#slot-days-container input:checked')).map(cb => parseInt(cb.value));
  const resultsContainer = document.getElementById('slots-results');

  const baseSearchStartMins = timeToMins(document.getElementById('search-time-start').value || "08:00");
  const baseSearchEndMins = timeToMins(document.getElementById('search-time-end').value || "22:00");
  const globalSearchStartMins = Math.max(START_HOUR * 60, baseSearchStartMins - 30);
  const globalSearchEndMins = Math.min(END_HOUR * 60, baseSearchEndMins + 30);

  if (selectedIndexes.length === 0) { resultsContainer.innerHTML = '<div style="color: #ef4444;">Выберите хотя бы один день!</div>'; return; }

  resultsContainer.innerHTML = '';
  const GAP = 10; let smsLines = []; let allDaysFull = true;

  selectedIndexes.forEach(index => {
    const dayName = daysOfWeek[index];
    if (index === 1 || index === 2) { smsLines.push(`▪️ ${dayName}: выходной`); return; }

    // МАГИЯ ФАНТОМНЫХ УРОКОВ: Ищем уроки за весь месяц, которые выпадают на этот день недели
    const targetDayIndex = index === 6 ? 0 : index + 1; // JS Date.getDay() (Вс=0, Пн=1...)
    const phantomEvents = scheduleData.filter(e => {
      const [y, m, d] = e.date.split('-');
      return new Date(y, m - 1, d).getDay() === targetDayIndex;
    });

    // Сливаем пересекающиеся интервалы в единый монолит
    let merged = phantomEvents.map(ev => ({ start: timeToMins(ev.startTime), end: timeToMins(ev.endTime) })).sort((a, b) => a.start - b.start);
    let consolidated = [];
    if (merged.length > 0) {
      let curr = merged[0];
      for (let i = 1; i < merged.length; i++) {
        if (merged[i].start <= curr.end) curr.end = Math.max(curr.end, merged[i].end);
        else { consolidated.push(curr); curr = merged[i]; }
      }
      consolidated.push(curr);
    }

    let currentMins = START_HOUR * 60;
    const recommendations = [];

    consolidated.forEach((interval, i) => {
      const freeStart = currentMins; const freeEnd = interval.start - GAP;
      const effStart = Math.max(freeStart, globalSearchStartMins); const effEnd = Math.min(freeEnd, globalSearchEndMins);

      if (effEnd - effStart >= duration) {
        let ideal1 = freeStart; let ideal2 = freeEnd - duration; let recs = new Set();
        if (i > 0 || (ideal1 >= baseSearchStartMins - 30)) { if (ideal1 >= globalSearchStartMins && (ideal1 + duration) <= globalSearchEndMins) recs.add(ideal1); }
        if (ideal2 >= globalSearchStartMins && (ideal2 + duration) <= globalSearchEndMins) recs.add(ideal2);
        if (recs.size === 0) { recs.add(effStart); if (effEnd - duration !== effStart) recs.add(effEnd - duration); }
        recs.forEach(start => recommendations.push(start));
      }
      currentMins = interval.end + GAP;
    });

    const effStart = Math.max(currentMins, globalSearchStartMins); const effEnd = Math.min(END_HOUR * 60, globalSearchEndMins);
    if (effEnd - effStart >= duration) {
      if (currentMins >= globalSearchStartMins && (currentMins + duration) <= globalSearchEndMins) recommendations.push(currentMins);
      else recommendations.push(effStart);
    }

    if (recommendations.length > 0) {
      let timeStrings = [...new Set(recommendations)].sort((a, b) => a - b).map(mins => `в ${minsToTime(mins)}`);
      smsLines.push(`▪️ ${dayName}: ${timeStrings.join(' или ')}`); allDaysFull = false;
    } else smsLines.push(`▪️ ${dayName}: нет окошек`);
  });

  let smsText = allDaysFull ? `К сожалению, в предложенное время ничего не могу предложить.` : `Готов взять ученика (${duration} мин).\n\nМои окошки (свободны даже в будущие недели):\n${smsLines.join('\n')}\n\n*С учетом того, что время я могу двигать на 30 мин. Какое бронируем?`;
  resultsContainer.innerHTML = `<textarea id="sms-output" readonly style="width: 100%; height: 160px; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-modal); color: var(--text-main);">${smsText}</textarea><button id="btn-copy-sms" class="btn-primary" style="width: 100%; margin-top: 10px;">📋 Скопировать</button>`;
  document.getElementById('btn-copy-sms').addEventListener('click', function () { document.getElementById('sms-output').select(); document.execCommand('copy'); this.textContent = '✅ Скопировано!'; setTimeout(() => this.textContent = '📋 Скопировать', 2000); });
}

// ==========================================
// СЛУШАТЕЛИ СОБЫТИЙ UI
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  if (scheduleData.length > 0) initCalendar();
  fetchLessons(true);

  document.getElementById('btn-burger').addEventListener('click', () => { document.getElementById('action-controls').classList.toggle('open'); });
  document.getElementById('btn-prev').addEventListener('click', () => { currentWeekMonday = addDays(currentWeekMonday, -7); fetchLessons(); });
  document.getElementById('btn-next').addEventListener('click', () => { currentWeekMonday = addDays(currentWeekMonday, 7); fetchLessons(); });
  document.getElementById('btn-today').addEventListener('click', () => { currentWeekMonday = getMonday(new Date()); fetchLessons(); });
  document.getElementById('btn-refresh').addEventListener('click', () => { fetchLessons(true); });
  document.getElementById('btn-wife').addEventListener('click', () => { window.location.href = 'wife.html'; });

  document.getElementById('btn-stats').addEventListener('click', openStats);
  document.getElementById('btn-stats-close').addEventListener('click', () => { document.getElementById('stats-modal').classList.remove('active'); });

  document.getElementById('btn-find-slots').addEventListener('click', () => {
    document.getElementById('slots-results').innerHTML = ''; document.getElementById('slots-modal').classList.add('active'); document.getElementById('action-controls').classList.remove('open');
  });
  document.getElementById('btn-slots-cancel').addEventListener('click', () => { document.getElementById('slots-modal').classList.remove('active'); });
  document.getElementById('btn-slots-search').addEventListener('click', findFreeSlots);

  document.getElementById('btn-lesson-close').addEventListener('click', () => { document.getElementById('lesson-modal').classList.remove('active'); });
  document.getElementById('btn-lm-crm').addEventListener('click', () => { if (currentEditingLesson?.event?.school) window.open(LINKS[currentEditingLesson.event.school], '_blank'); });

  // Скриншот
  document.getElementById('btn-export').addEventListener('click', async () => {
    document.getElementById('action-controls').classList.remove('open');
    const btnExport = document.getElementById('btn-export');
    const originalText = btnExport.innerHTML; btnExport.innerHTML = '⏳ Создаю...';
    try {
      const canvas = await html2canvas(document.querySelector('.calendar-wrapper'), { scale: 2 });
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `Расписание_${formatDateToString(currentWeekMonday)}.png`, { type: 'image/png' });
        try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); btnExport.innerHTML = '✅ В буфере!'; }
        catch (err) { const link = document.createElement('a'); link.download = file.name; link.href = URL.createObjectURL(blob); link.click(); btnExport.innerHTML = '✅ Скачано!'; }
        setTimeout(() => btnExport.innerHTML = originalText, 2000);
      }, 'image/png');
    } catch (e) { btnExport.innerHTML = originalText; }
  });

  // Автозаполнение СМС
  document.getElementById('manager-text-input').addEventListener('input', function (e) {
    const text = e.target.value.toLowerCase(); if (!text.trim()) return;
    const dayChecks = document.querySelectorAll('#slot-days-container input');
    dayChecks.forEach(cb => cb.checked = false);
    let foundDays = false;
    const patterns = [{ id: 0, r: /пн|понедельник/ }, { id: 1, r: /вт|вторник/ }, { id: 2, r: /ср|сред[ау]/ }, { id: 3, r: /чт|четверг/ }, { id: 4, r: /пт|пятниц[ау]/ }, { id: 5, r: /сб|суббот[ау]/ }, { id: 6, r: /вс|воскресень[ея]|вскр/ }];
    if (text.includes('все дни') || text.includes('любой день')) { dayChecks.forEach(cb => cb.checked = true); foundDays = true; }
    else { patterns.forEach(p => { if (p.r.test(text)) { document.querySelector(`#slot-days-container input[value="${p.id}"]`).checked = true; foundDays = true; } }); }
    if (text.includes('кроме')) { const parts = text.split('кроме'); if (parts.length > 1) { patterns.forEach(p => { if (p.r.test(parts[1])) document.querySelector(`#slot-days-container input[value="${p.id}"]`).checked = false; }); } }
    if (!foundDays) dayChecks.forEach(cb => cb.checked = true);

    let stMins = 8 * 60; let etMins = 22 * 60;
    const times = [...text.matchAll(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/g)].map(m => parseInt(m[1]) * 60 + parseInt(m[2]));
    const matchFrom = text.match(/(?:с|от|начиная с)\s*(\d{1,2})(?:[:.](\d{2}))?/); const matchTo = text.match(/(?:до|по)\s*(\d{1,2})(?:[:.](\d{2}))?/);
    const matchRange = text.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(?:-|–|—)\s*(\d{1,2})(?:[:.](\d{2}))?/);
    if (matchRange) {
      let h1 = parseInt(matchRange[1]); let h2 = parseInt(matchRange[3]);
      if (h1 < 8 && h1 > 0) h1 += 12; if (h2 <= 8 && h2 > 0) h2 += 12;
      stMins = h1 * 60 + parseInt(matchRange[2] || 0); etMins = h2 * 60 + parseInt(matchRange[4] || 0);
    } else {
      if (matchFrom) { let h = parseInt(matchFrom[1]); if (h < 8 && h > 0) h += 12; stMins = h * 60 + parseInt(matchFrom[2] || 0); } else if (times.length > 0) stMins = Math.min(...times) - 60;
      if (matchTo) { let h = parseInt(matchTo[1]); if (h <= 8 && h > 0) h += 12; etMins = h * 60 + parseInt(matchTo[2] || 0); } else if (times.length > 0 && !matchFrom) etMins = Math.max(...times) + 120; else if (times.length > 0 && matchFrom) etMins = 22 * 60;
    }
    stMins = Math.max(8 * 60, Math.min(22 * 60, stMins)); etMins = Math.max(8 * 60, Math.min(22 * 60, etMins));
    document.getElementById('search-time-start').value = minsToTime(stMins); document.getElementById('search-time-end').value = minsToTime(etMins);
  });

  document.getElementById('btn-clear-sms').addEventListener('click', () => {
    document.getElementById('manager-text-input').value = ''; document.getElementById('search-time-start').value = '08:00'; document.getElementById('search-time-end').value = '22:00';
    document.querySelectorAll('#slot-days-container input').forEach(cb => cb.checked = false); document.getElementById('slots-results').innerHTML = '';
  });

  // Кнопки импорта/экспорта цен
  document.getElementById('btn-export-prices').addEventListener('click', function () {
    const input = document.getElementById('sync-data-input');
    input.value = localStorage.getItem('lessonPrices_v2') || '{}';
    input.select(); document.execCommand('copy');
    const orig = this.textContent; this.textContent = '✅ Скопировано!'; setTimeout(() => this.textContent = orig, 2000);
  });
  document.getElementById('btn-import-prices').addEventListener('click', function () {
    try {
      priceBook = JSON.parse(document.getElementById('sync-data-input').value.trim());
      localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));
      calcSalary(); initCalendar();
      document.getElementById('sync-data-input').value = '';
      const orig = this.textContent; this.textContent = '✅ Успешно!'; setTimeout(() => { this.textContent = orig; document.getElementById('stats-modal').classList.remove('active'); }, 1500);
    } catch (e) { alert('Ошибка данных!'); }
  });
});