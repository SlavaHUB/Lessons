// ==========================================
// НАСТРОЙКИ СЕРВЕРА И ТЕМЫ
// ==========================================
const API_URL = 'https://lessons-mqy0.onrender.com/api/schedule';
const DB_API_URL = 'https://lessons-mqy0.onrender.com/api/data';
let currentWeekMonday = getMonday(new Date());

const BYN_RATE = 0.0387;
const ITCOMPOT_RATE = 190;
const HOUR_HEIGHT = 80;
const START_HOUR = 8;
const END_HOUR = 23;
const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const monthsRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const monthsNominative = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const LINKS = {
  ITCompot: 'https://it-school.t8s.ru/Interactive/12445?TeacherId=12445&TrialLessonsOnly=False&StudyRequestsMode=False&ClassroomsColumnsMode=True&DefaultView=agendaWeek&ExpandableFormClosed=False&Submitted=False',
  Zerocoder: 'https://crm.genius-school.online/#/lessons'
};

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И ИНДЕКСАЦИЯ
// ==========================================
function cleanTrashCodes(str) {
  if (!str) return str;
  let cleaned = str.replace(/\s*-\s*N[TK][a-zA-Z]\d{2,}\b/ig, '');
  cleaned = cleaned.replace(/\s*-\s*-\s*/g, ' - ');
  return cleaned;
}

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
function getCustomDayIndex(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const jsDay = new Date(y, m - 1, d).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}
function getTheme(school, dayName) {
  if (dayName === 'Вт' || dayName === 'Ср') return 'theme-red';
  switch (school) {
    case 'RTS': return 'theme-blue';
    case 'ITCompot': return 'theme-green';
    case 'Zerocoder': return 'theme-purple';
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
  return 0;
}

// ==========================================
// БАЗА ДАННЫХ И СИНХРОНИЗАЦИЯ С ОБЛАКОМ
// ==========================================
let priceBook = {};
let statusBook = {};
let notesBook = {};
let overridePriceBook = {};
let customLessons = []; // Сюда будут сохраняться уроки из Excel

let scheduleData = JSON.parse(localStorage.getItem('cachedSchedule')) || [];
scheduleData.forEach(e => { e.customDayIndex = getCustomDayIndex(e.date); e.title = cleanTrashCodes(e.title); });

let loadedStartStr = localStorage.getItem('loadedStartStr') || "";
let loadedEndStr = localStorage.getItem('loadedEndStr') || "";
let isFetching = false;
let currentEditingLesson = null;

document.documentElement.setAttribute('data-theme', 'dark');

// Загрузка из MongoDB (с авто-миграцией)
async function loadCloudData() {
  try {
    const res = await fetch(DB_API_URL);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();

    if (data && Object.keys(data.priceBook || {}).length > 0) {
      priceBook = data.priceBook || {};
      statusBook = data.statusBook || {};
      notesBook = data.notesBook || {};
      overridePriceBook = data.overridePriceBook || {};
      customLessons = data.customLessons || []; // Загружаем из базы

      localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));
      localStorage.setItem('lessonStatuses', JSON.stringify(statusBook));
      localStorage.setItem('lessonNotes', JSON.stringify(notesBook));
      localStorage.setItem('lessonOverrides', JSON.stringify(overridePriceBook));
      localStorage.setItem('customLessons', JSON.stringify(customLessons));
    } else {
      console.log('☁️ Облако пустое. Запускаю авто-миграцию...');
      const localPrices = JSON.parse(localStorage.getItem('lessonPrices_v2')) || {};
      if (Object.keys(localPrices).length > 0) {
        priceBook = localPrices;
        statusBook = JSON.parse(localStorage.getItem('lessonStatuses')) || {};
        notesBook = JSON.parse(localStorage.getItem('lessonNotes')) || {};
        overridePriceBook = JSON.parse(localStorage.getItem('lessonOverrides')) || {};
        customLessons = JSON.parse(localStorage.getItem('customLessons')) || [];
        await saveToCloud();
      }
    }
  } catch (e) {
    console.warn('⚠️ Оффлайн режим. Загружаю локальные данные.', e);
    priceBook = JSON.parse(localStorage.getItem('lessonPrices_v2')) || {};
    statusBook = JSON.parse(localStorage.getItem('lessonStatuses')) || {};
    notesBook = JSON.parse(localStorage.getItem('lessonNotes')) || {};
    overridePriceBook = JSON.parse(localStorage.getItem('lessonOverrides')) || {};
    customLessons = JSON.parse(localStorage.getItem('customLessons')) || [];
  }
}

// Отправка данных в MongoDB
async function saveToCloud() {
  try {
    fetch(DB_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceBook, statusBook, notesBook, overridePriceBook, customLessons }) // Добавили отправку
    });
  } catch (e) { console.error('Ошибка записи в облако', e); }
}

function getEffectivePrice(event, dayName) {
  if (event.isExcelCustom && event.excelPrice !== undefined) {
    const dateKey = `${event.date}_${event.startTime}_${event.title}`;
    const status = statusBook[dateKey] || event.excelStatus;
    if (status === 'canceled') return 0;
    return event.excelPrice;
  }

  const dateKey = `${event.date}_${event.startTime}_${event.title}`;
  const lessonKey = `${dayName}_${event.startTime}_${event.title}`;
  const status = statusBook[dateKey] || 'done';

  if (status === 'canceled') return 0;
  if (overridePriceBook[dateKey] !== undefined) return overridePriceBook[dateKey];

  let basePrice = parseFloat(priceBook[lessonKey]);
  const duration = timeToMins(event.endTime) - timeToMins(event.startTime);
  if (isNaN(basePrice)) basePrice = getStandardPrice(event.school, duration);

  if (status === 'noshow') {
    if (event.school === 'Zerocoder' && duration === 45) return 135;
    if (event.school === 'Zerocoder' && duration === 30) return 90;
  }
  return basePrice;
}

// ==========================================
// СЕТЕВАЯ ЛОГИКА CRM
// ==========================================
async function fetchLessons(forceSync = false) {
  const viewStart = currentWeekMonday;
  const requiredEndForPhantoms = addDays(currentWeekMonday, 42);

  let hasCacheForThisWeek = false;
  if (loadedStartStr && loadedEndStr) {
    const vsTime = viewStart.getTime();
    const reqEndTime = requiredEndForPhantoms.getTime();
    const lsTime = new Date(loadedStartStr).getTime();
    const leTime = new Date(loadedEndStr).getTime();
    if (vsTime >= lsTime && reqEndTime <= leTime) hasCacheForThisWeek = true;
  }

  if (hasCacheForThisWeek && !forceSync) { initCalendar(); return; }
  if (isFetching) return;
  isFetching = true;

  const btnRefresh = document.getElementById('btn-refresh');
  const calendarWrap = document.querySelector('.calendar-wrapper');

  if (btnRefresh && forceSync) btnRefresh.innerHTML = '⏳';
  if (calendarWrap && (!hasCacheForThisWeek || forceSync)) calendarWrap.classList.add('loading');

  try {
    const reqStart = addDays(currentWeekMonday, -30);
    const reqEnd = addDays(currentWeekMonday, 90);
    const startStr = formatDateToString(reqStart);
    const endStr = formatDateToString(reqEnd);

    const response = await fetch(`${API_URL}?start=${startStr}&end=${endStr}`);
    if (response.ok) {
      const rawData = await response.json();
      const validEvents = [];
      const brokenCookies = new Set();

      rawData.forEach(item => {
        if (item.isError) {
          brokenCookies.add(item.school);
        } else {
          item.customDayIndex = getCustomDayIndex(item.date);
          item.title = cleanTrashCodes(item.title);
          validEvents.push(item);
        }
      });

      const cookieAlert = document.getElementById('cookie-alert');
      if (cookieAlert) {
        if (brokenCookies.size > 0) {
          document.getElementById('expired-schools').textContent = Array.from(brokenCookies).join(', ');
          cookieAlert.style.display = 'block';
        } else {
          cookieAlert.style.display = 'none';
        }
      }

      // Склеиваем уроки из CRM и уникальные уроки из Excel
      const loadedCustom = JSON.parse(localStorage.getItem('customLessons')) || [];
      scheduleData = [...validEvents, ...loadedCustom];
      
      localStorage.setItem('cachedSchedule', JSON.stringify(scheduleData));
      localStorage.setItem('loadedStartStr', startStr);
      localStorage.setItem('loadedEndStr', endStr);
      localStorage.setItem('lastSyncTime', Date.now().toString());
      loadedStartStr = startStr; loadedEndStr = endStr;
      initCalendar();
    }
  } catch (error) {
    const loadedCustom = JSON.parse(localStorage.getItem('customLessons')) || [];
    if (scheduleData.length > 0 || loadedCustom.length > 0) initCalendar();
  } finally {
    isFetching = false;
    if (btnRefresh) btnRefresh.innerHTML = '🔄';
    if (calendarWrap) calendarWrap.classList.remove('loading');
  }
}

// ==========================================
// ЛОГИКА МОДАЛКИ ДЕТАЛЕЙ УРОКА
// ==========================================
function openLessonModal(event, dayName) {
  currentEditingLesson = { event, dayName };
  document.getElementById('lm-school').textContent = event.school || 'Неизвестно';
  const [, month, day] = event.date.split('-');
  document.getElementById('lm-time').textContent = `${day}.${month} | ${event.startTime} - ${event.endTime}`;
  document.getElementById('lm-name').textContent = event.title;

  document.getElementById('btn-lm-enter-class').onclick = () => {
    if (event.school === 'ITCompot') window.open('https://us02web.zoom.us/j/9514811985', '_blank');
    else window.open('https://matrius.ktalk.ru/hpb5rfegc1tl', '_blank');
  };

  const dateKey = `${event.date}_${event.startTime}_${event.title}`;
  const lessonKey = `${dayName}_${event.startTime}_${event.title}`;

  let currentStatus = statusBook[dateKey] || (event.isExcelCustom ? event.excelStatus : 'done');
  let currentNote = notesBook[lessonKey];
  if (!currentNote) currentNote = `${event.title}\nАлсу @Alsushenka1985 - Елена @ElenaLCastellano\n\nНе на уроке.`;

  const duration = timeToMins(event.endTime) - timeToMins(event.startTime);
  const isPerStudent = (event.school === 'ITCompot' && duration >= 90 && !event.isExcelCustom);
  currentEditingLesson.isPerStudent = isPerStudent;

  const computePrice = (status) => {
    if (status === 'canceled') return 0;
    if (overridePriceBook[dateKey] !== undefined && status === currentStatus) return overridePriceBook[dateKey];
    
    if (event.isExcelCustom) return event.excelPrice;

    let base = parseFloat(priceBook[lessonKey]);
    if (isNaN(base)) base = getStandardPrice(event.school, duration);
    if (status === 'noshow') {
      if (event.school === 'Zerocoder' && duration === 45) return 135;
      if (event.school === 'Zerocoder' && duration === 30) return 90;
    }
    return base;
  };

  let currentPrice = computePrice(currentStatus);
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

  document.querySelectorAll('.status-btn').forEach(btn => {
    if (btn.dataset.status === currentStatus) btn.classList.add('active');
    else btn.classList.remove('active');

    btn.onclick = (e) => {
      document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentStatus = e.target.dataset.status;
      currentPrice = computePrice(currentStatus);
      renderPriceInput(currentPrice);
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
  const dateKey = `${event.date}_${event.startTime}_${event.title}`;
  const newStatus = document.querySelector('.status-btn.active').dataset.status;

  statusBook[dateKey] = newStatus;
  notesBook[lessonKey] = document.getElementById('lm-notes').value;

  if (newStatus === 'done' || event.isExcelCustom) {
    priceBook[lessonKey] = finalPrice;
    delete overridePriceBook[dateKey];
  } else {
    overridePriceBook[dateKey] = finalPrice;
  }

  localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));
  localStorage.setItem('lessonStatuses', JSON.stringify(statusBook));
  localStorage.setItem('lessonNotes', JSON.stringify(notesBook));
  localStorage.setItem('lessonOverrides', JSON.stringify(overridePriceBook));

  saveToCloud(); // Фоновое сохранение

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
    const hideClass = (i === 1 || i === 2) ? ' mobile-hide' : '';
    header.innerHTML += `<div class="day-header${todayClass}${hideClass}">${daysOfWeek[i]} <span>${dateForDay.getDate()}.${dateForDay.getMonth() + 1}</span></div>`;
  }

  for (let i = START_HOUR; i <= END_HOUR; i++) timeLabels.innerHTML += `<div class="time-slot">${i.toString().padStart(2, '0') + ':00'}</div>`;

  daysOfWeek.forEach((dayName, index) => {
    const dayCol = document.createElement('div'); dayCol.className = 'day-column';
    if (index === 1 || index === 2) dayCol.classList.add('mobile-hide');

    const columnDateStr = formatDateToString(currentWeekDates[index]);
    if (columnDateStr === realTodayStr) dayCol.classList.add('today');
    if (index === 1 || index === 2) dayCol.classList.add('day-off');

    const realEvents = scheduleData.filter(e => e.date === columnDateStr).map(e => ({ ...e, isPhantom: false }));
    const allFutureEvents = scheduleData.filter(e => e.customDayIndex === index && e.date > columnDateStr && !e.isExcelCustom);

    const phantomMap = new Map();
    allFutureEvents.forEach(fe => {
      const dateKey = `${fe.date}_${fe.startTime}_${fe.title}`;
      if (statusBook[dateKey] === 'canceled') return;
      const isSameRecurring = realEvents.some(ce => ce.startTime === fe.startTime && ce.title === fe.title);
      if (!isSameRecurring) {
        const key = `${fe.startTime}_${fe.title}`;
        if (!phantomMap.has(key)) phantomMap.set(key, { ...fe, isPhantom: true });
      }
    });

    const allEventsToDraw = [...realEvents, ...Array.from(phantomMap.values())];

    allEventsToDraw.forEach(event => {
      const topPx = timeToPixels(event.startTime);
      const heightPx = Math.max(timeToPixels(event.endTime) - topPx, (45 / 60) * HOUR_HEIGHT);
      const eventDiv = document.createElement('div');

      const dateKey = `${event.date}_${event.startTime}_${event.title}`;
      const lessonKey = `${dayName}_${event.startTime}_${event.title}`;
      eventDiv.className = `event-card ${getTheme(event.school, dayName)}`;

      let priceHtml = ''; let pinHtml = ''; let titlePrefix = '';

      if (event.isPhantom) {
        eventDiv.classList.add('phantom-event');
        const [, m, d] = event.date.split('-');
        pinHtml = `<div class="event-note-pin" title="Будущий урок (${d}.${m})">👻</div>`;
        titlePrefix = `[${d}.${m}] `;
        eventDiv.addEventListener('click', () => alert(`👻 Это фантомный урок!\n\nШкола: ${event.school}\nУченик: ${event.title}\nОн запланирован на ${d}.${m}`));
      } else {
        const status = statusBook[dateKey] || (event.isExcelCustom ? event.excelStatus : 'done');
        if (status === 'canceled') eventDiv.classList.add('status-canceled');
        if (status === 'noshow') eventDiv.classList.add('status-noshow');

        const price = getEffectivePrice(event, dayName);
        priceHtml = price > 0 ? `<div class="event-price-tag"><span class="price-rub">${price} ₽</span><span class="price-byn">≈ ${(price * BYN_RATE).toFixed(2)} Br</span></div>` : '';
        pinHtml = notesBook[lessonKey] ? `<div class="event-note-pin" title="${notesBook[lessonKey]}">📌</div>` : '';
        eventDiv.addEventListener('click', () => openLessonModal(event, dayName));
      }

      eventDiv.style.top = `${topPx}px`; eventDiv.style.height = `${heightPx}px`;
      eventDiv.innerHTML = `${pinHtml}<div class="event-time">${event.startTime} - ${event.endTime}</div><div class="event-body"><div class="event-title">${titlePrefix}${event.title}</div>${priceHtml}</div>`;
      dayCol.appendChild(eventDiv);
    });
    daysGrid.appendChild(dayCol);
  });
}

// ==========================================
// СТАТИСТИКА И РАСЧЕТ ЗАРПЛАТЫ
// ==========================================
const historicalData = [
  { month: 'Март 2026', itcBase: 56520, premium: 11304, itcTotal: 67824, zeroTotal: 2310, grandTotal: 70134, byn: 2594.96 },
  { month: 'Апрель 2026', itcBase: 52800, premium: 10560, itcTotal: 63360, zeroTotal: 3810, grandTotal: 67170, byn: 2525.59 },
  { month: 'Май 2026', itcBase: 46880, premium: 9376, itcTotal: 56256, zeroTotal: 18285, grandTotal: 74541, byn: 2802.74 }
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

  let html = '';
  historicalData.forEach(d => {
    html += `
      <div style="background: var(--bg-main); padding: 12px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--border-color); font-family: monospace; font-size: 0.85rem;">
        <div style="font-size: 0.95rem; font-weight: bold; color: #f59e0b; margin-bottom: 6px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">${d.month}</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>Чисто за Компот:</span><span>${d.itcBase} ₽</span></div>
        <div style="display: flex; justify-content: space-between; color: #a855f7; margin-bottom: 4px;"><span>Премия (20%):</span><span>+ ${d.premium} ₽</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; color: #10b981; margin-bottom: 4px; padding-bottom: 4px; border-bottom: 1px dashed var(--border-color);"><span>Сложение двух:</span><span>${d.itcTotal} ₽</span></div>
        <div style="display: flex; justify-content: space-between; color: #3b82f6; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dashed var(--border-color);"><span>Итог вторая школа:</span><span>${d.zeroTotal} ₽</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: bold; color: #f59e0b;">
          <span>Итог премиальный:</span>
          <div style="text-align: right; display: flex; flex-direction: column;">
            <span>${d.grandTotal} ₽</span>
            <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal; margin-top: 1px;">≈ ${d.byn} Br</span>
          </div>
        </div>
      </div>
    `;
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
        if (ev.isExcelCustom) {
           cPrice = ev.excelPrice;
        } else {
           const dur = timeToMins(ev.endTime) - timeToMins(ev.startTime);
           cPrice = getStandardPrice(ev.school, dur) || '';
        }
      }
      dayHtml += `<div class="price-row"><span class="price-title">${ev.startTime} - ${ev.title}</span><input type="number" class="price-input" data-key="${lessonKey}" value="${cPrice}"></div>`;
    });
    listContainer.innerHTML += dayHtml;
  });

  document.querySelectorAll('.price-input').forEach(inp => {
    inp.addEventListener('change', async (e) => {
      priceBook[e.target.dataset.key] = parseFloat(e.target.value) || 0;
      localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));

      await saveToCloud();
      calcSalary();
      initCalendar();
    });
  });

  calcSalary();
  document.getElementById('stats-modal').classList.add('active');
}

function calcSalary() {
  let todaySum = 0; let weekSum = 0;
  const realTodayStr = formatDateToString(new Date());
  const curMonthIndex = new Date().getMonth();
  const curYear = new Date().getFullYear();

  const currentWeekDates = [];
  for (let i = 0; i < 7; i++) currentWeekDates.push(formatDateToString(addDays(currentWeekMonday, i)));

  scheduleData.filter(e => currentWeekDates.includes(e.date)).forEach(ev => {
    const dayName = daysOfWeek[ev.customDayIndex];
    const dateKey = `${ev.date}_${ev.startTime}_${ev.title}`;
    if (statusBook[dateKey] === 'canceled') return;

    const price = getEffectivePrice(ev, dayName);
    weekSum += price;
    if (ev.date === realTodayStr) todaySum += price;
  });

  document.getElementById('stat-today').innerHTML = `${todaySum} ₽ <span class="byn-text">(${(todaySum * BYN_RATE).toFixed(2)} Br)</span>`;
  document.getElementById('stat-week').innerHTML = `${weekSum} ₽ <span style="font-size: 0.8rem; color: var(--text-muted);">(${(weekSum * BYN_RATE).toFixed(2)} Br)</span>`;

  let monthItcBase = 0;
  let monthZeroTotal = 0;
  scheduleData.forEach(ev => {
    const [y, m] = ev.date.split('-').map(Number);
    if (y !== curYear || (m - 1) !== curMonthIndex) return;
    const dateKey = `${ev.date}_${ev.startTime}_${ev.title}`;
    if (statusBook[dateKey] === 'canceled') return;

    const dayName = daysOfWeek[ev.customDayIndex];
    const price = getEffectivePrice(ev, dayName);
    if (ev.school === 'ITCompot') monthItcBase += price;
    else if (ev.school === 'Zerocoder') monthZeroTotal += price;
  });

  const grandTotal = monthItcBase + Math.round(monthItcBase * 0.20) + monthZeroTotal;
  document.getElementById('stat-month-project').innerHTML = `${grandTotal} ₽ <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">(${(grandTotal * BYN_RATE).toFixed(2)} Br)</span>`;
}

function openDetailedExcel() {
  const realTodayStr = formatDateToString(new Date());
  const curMonthIndex = new Date().getMonth();
  const curYear = new Date().getFullYear();

  document.getElementById('excel-month-name').textContent = `${monthsNominative[curMonthIndex]} ${curYear}`;

  let monthEvents = scheduleData.filter(ev => {
    const [y, m] = ev.date.split('-').map(Number);
    return (y === curYear && (m - 1) === curMonthIndex);
  }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  let earnedItc = 0, earnedZero = 0;
  let expectedItc = 0, expectedZero = 0;
  let todaySum = 0, weekSum = 0;
  let tableRowsHtml = '';

  const currentWeekDates = [];
  for (let i = 0; i < 7; i++) currentWeekDates.push(formatDateToString(addDays(currentWeekMonday, i)));

  monthEvents.forEach(ev => {
    const dateKey = `${ev.date}_${ev.startTime}_${ev.title}`;
    const dayName = daysOfWeek[ev.customDayIndex];
    const status = statusBook[dateKey] || (ev.isExcelCustom ? ev.excelStatus : 'done');
    const price = getEffectivePrice(ev, dayName);

    const isPastOrToday = ev.date <= realTodayStr;
    const isToday = ev.date === realTodayStr;
    const isFuture = ev.date > realTodayStr;
    const isCanceled = status === 'canceled';
    const isNoshow = status === 'noshow';

    if (ev.school === 'ITCompot') {
      expectedItc += price;
      if (isPastOrToday) earnedItc += price;
    } else {
      expectedZero += price;
      if (isPastOrToday) earnedZero += price;
    }

    if (isToday) todaySum += price;
    if (currentWeekDates.includes(ev.date)) weekSum += price;

    let trClass = ''; let statusText = '✅ Проведен';
    if (isCanceled) { trClass = 'row-canceled'; statusText = '❌ Отменен'; }
    else if (isNoshow) { trClass = 'row-noshow'; statusText = '⚠️ Прогул'; }
    else if (isFuture) { trClass = 'row-future'; statusText = '⏳ Ожидается'; }

    const [, mm, dd] = ev.date.split('-');
    tableRowsHtml += `
      <tr class="${trClass}">
        <td>${dd}.${mm}</td>
        <td>${statusText}</td>
        <td>${ev.title}</td>
        <td>${ev.school === 'ITCompot' ? 'ITC' : 'Zero'}</td>
        <td class="num">${price} ₽</td>
      </tr>
    `;
  });

  document.getElementById('detailed-excel-tbody').innerHTML = tableRowsHtml;

  const earnedItcPrem = Math.round(earnedItc * 0.20);
  const earnedItcTotal = earnedItc + earnedItcPrem;
  const earnedGrand = earnedItcTotal + earnedZero;

  const expectedItcPrem = Math.round(expectedItc * 0.20);
  const expectedGrand = expectedItc + expectedItcPrem + expectedZero;

  document.getElementById('ex-today').textContent = `${todaySum} ₽`;
  document.getElementById('ex-earned').textContent = `${earnedGrand} ₽`;
  document.getElementById('ex-earned-itc').textContent = `${earnedItcTotal} ₽`;
  document.getElementById('ex-earned-zero').textContent = `${earnedZero} ₽`;

  document.getElementById('ex-week').textContent = `${weekSum} ₽`;
  document.getElementById('ex-expected').textContent = `${expectedGrand} ₽`;

  document.getElementById('ex-itc-base').textContent = `${expectedItc} ₽`;
  document.getElementById('ex-itc-prem').textContent = `${expectedItcPrem} ₽`;
  document.getElementById('ex-zero').textContent = `${expectedZero} ₽`;

  document.getElementById('detailed-excel-modal').classList.add('active');
}

function findFreeSlots() {
  const duration = parseInt(document.getElementById('input-slot-duration').value) || 45;
  const selectedIndexes = Array.from(document.querySelectorAll('#slot-days-container input:checked')).map(cb => parseInt(cb.value));
  const resultsContainer = document.getElementById('slots-results');

  let baseSearchStartMins = timeToMins(document.getElementById('search-time-start').value);
  if (isNaN(baseSearchStartMins)) baseSearchStartMins = 480;
  let baseSearchEndMins = timeToMins(document.getElementById('search-time-end').value);
  if (isNaN(baseSearchEndMins)) baseSearchEndMins = 1320;

  const globalSearchStartMins = Math.max(START_HOUR * 60, baseSearchStartMins - 30);
  const globalSearchEndMins = Math.min(END_HOUR * 60, baseSearchEndMins + 30);

  if (selectedIndexes.length === 0) { resultsContainer.innerHTML = '<div style="color: #ef4444;">Выберите хотя бы один день!</div>'; return; }

  resultsContainer.innerHTML = '';
  const GAP = 10; let smsLines = []; let allDaysFull = true;

  selectedIndexes.forEach(index => {
    const dayName = daysOfWeek[index];
    if (index === 1 || index === 2) { smsLines.push(`▪️ ${dayName}: выходной`); return; }

    const targetDateStr = formatDateToString(addDays(currentWeekMonday, index));
    const phantomEvents = scheduleData.filter(e => {
      if (e.customDayIndex !== index) return false;
      if (e.date < targetDateStr) return false;
      const exactLessonKey = `${e.date}_${e.startTime}_${e.title}`;
      if (statusBook[exactLessonKey] === 'canceled') return false;
      const startM = timeToMins(e.startTime);
      const endM = timeToMins(e.endTime);
      if (isNaN(startM) || isNaN(endM)) return false;
      if (endM - startM > 300 || endM - startM <= 0) return false;
      return true;
    });

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

  let smsText = allDaysFull ? `К сожалению, в предложенное время ничего не могу предложить.` : smsLines.join('\n');
  resultsContainer.innerHTML = `<textarea id="sms-output" readonly style="width: 100%; height: 160px; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-modal); color: var(--text-main); font-family: inherit; font-size: 0.85rem; resize: none; outline: none; line-height: 1.5;">${smsText}</textarea><button id="btn-copy-sms" class="btn-primary" style="width: 100%; margin-top: 10px; background: #10b981;">📋 Скопировать</button>`;
  document.getElementById('btn-copy-sms').addEventListener('click', function () { document.getElementById('sms-output').select(); document.execCommand('copy'); this.textContent = '✅ Скопировано!'; setTimeout(() => this.textContent = '📋 Скопировать', 2000); });
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    priceBook = JSON.parse(localStorage.getItem('lessonPrices_v2')) || {};
    statusBook = JSON.parse(localStorage.getItem('lessonStatuses')) || {};
    notesBook = JSON.parse(localStorage.getItem('lessonNotes')) || {};
    overridePriceBook = JSON.parse(localStorage.getItem('lessonOverrides')) || {};
    customLessons = JSON.parse(localStorage.getItem('customLessons')) || [];
  } catch (e) {
    priceBook = {}; statusBook = {}; notesBook = {}; overridePriceBook = {}; customLessons = [];
  }

  if (scheduleData.length > 0) {
    initCalendar();
    calcSalary();
  }

  loadCloudData().then(() => {
    console.log("☁️ Свежие данные из MongoDB успешно загружены в фоне");
    if (scheduleData.length > 0) {
      initCalendar();
      calcSalary();
    }
  }).catch(err => console.error("Ошибка фоновой загрузки:", err));

  const lastSync = parseInt(localStorage.getItem('lastSyncTime')) || 0;
  const oneHour = 60 * 60 * 1000;
  if (Date.now() - lastSync > oneHour) {
    fetchLessons(true);
  } else {
    fetchLessons();
  }

  setInterval(() => { fetchLessons(true); }, oneHour);

  document.getElementById('btn-burger').addEventListener('click', () => { document.getElementById('action-controls').classList.toggle('open'); });
  document.getElementById('btn-prev').addEventListener('click', () => { currentWeekMonday = addDays(currentWeekMonday, -7); fetchLessons(); });
  document.getElementById('btn-next').addEventListener('click', () => { currentWeekMonday = addDays(currentWeekMonday, 7); fetchLessons(); });
  document.getElementById('btn-today').addEventListener('click', () => { currentWeekMonday = getMonday(new Date()); fetchLessons(); });
  document.getElementById('btn-refresh').addEventListener('click', () => { fetchLessons(true); });
  document.getElementById('btn-wife').addEventListener('click', () => { window.location.href = 'wife.html'; });

  document.getElementById('btn-stats').addEventListener('click', openStats);
  document.getElementById('btn-stats-close').addEventListener('click', () => { document.getElementById('stats-modal').classList.remove('active'); });

  document.getElementById('btn-open-excel').addEventListener('click', () => {
    document.getElementById('stats-modal').classList.remove('active');
    openDetailedExcel();
  });
  document.getElementById('btn-excel-close').addEventListener('click', () => { document.getElementById('detailed-excel-modal').classList.remove('active'); });

  document.getElementById('btn-export-csv').addEventListener('click', () => {
    let csv = '\uFEFF';
    csv += 'Дата;Статус;Урок/Группа;Школа;Сумма\n';
    const rows = document.querySelectorAll('#detailed-excel-tbody tr');
    rows.forEach(row => {
      const cols = row.querySelectorAll('td');
      const rowData = Array.from(cols).map(c => c.innerText.replace(' ₽', '').trim()).join(';');
      csv += rowData + '\n';
    });
    csv += '\n; ; ;Ожидаемый Итог:;' + document.getElementById('ex-expected').innerText.replace(' ₽', '') + '\n';
    csv += '; ; ;Фактически заработано:;' + document.getElementById('ex-earned').innerText.replace(' ₽', '') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Зарплата_${document.getElementById('excel-month-name').innerText}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  });

  document.getElementById('btn-find-slots').addEventListener('click', () => {
    document.getElementById('slots-results').innerHTML = ''; document.getElementById('slots-modal').classList.add('active'); document.getElementById('action-controls').classList.remove('open');
  });
  document.getElementById('btn-slots-cancel').addEventListener('click', () => { document.getElementById('slots-modal').classList.remove('active'); });
  document.getElementById('btn-slots-search').addEventListener('click', findFreeSlots);

  document.getElementById('btn-lesson-close').addEventListener('click', () => { document.getElementById('lesson-modal').classList.remove('active'); });
  document.getElementById('btn-lm-crm').addEventListener('click', () => { if (currentEditingLesson?.event?.school) window.open(LINKS[currentEditingLesson.event.school], '_blank'); });

  document.getElementById('btn-copy-notes').addEventListener('click', function (e) {
    e.preventDefault(); const textarea = document.getElementById('lm-notes'); textarea.select(); document.execCommand('copy');
    const origText = this.textContent; this.textContent = '✅ Скопировано!'; this.style.background = '#10b981'; this.style.color = '#ffffff';
    setTimeout(() => { this.textContent = origText; this.style.background = ''; this.style.color = ''; }, 2000);
  });

  document.getElementById('btn-export').addEventListener('click', async () => {
    document.getElementById('action-controls').classList.remove('open'); const btnExport = document.getElementById('btn-export');
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

  document.getElementById('manager-text-input').addEventListener('input', function (e) {
    const text = e.target.value.toLowerCase(); if (!text.trim()) return;
    const dayChecks = document.querySelectorAll('#slot-days-container input'); dayChecks.forEach(cb => cb.checked = false); let foundDays = false;
    const patterns = [{ id: 0, r: /пн|понедельник/ }, { id: 1, r: /вт|вторник/ }, { id: 2, r: /ср|сред[ау]/ }, { id: 3, r: /чт|четверг/ }, { id: 4, r: /пт|пятниц[ау]/ }, { id: 5, r: /сб|суббот[ау]/ }, { id: 6, r: /вс|воскресень[ея]|вскр/ }];
    if (text.includes('все дни') || text.includes('любой день')) { dayChecks.forEach(cb => cb.checked = true); foundDays = true; }
    else { patterns.forEach(p => { if (p.r.test(text)) { document.querySelector(`#slot-days-container input[value="${p.id}"]`).checked = true; foundDays = true; } }); }
    if (text.includes('кроме')) { const parts = text.split('кроме'); if (parts.length > 1) { patterns.forEach(p => { if (p.r.test(parts[1])) document.querySelector(`#slot-days-container input[value="${p.id}"]`).checked = false; }); } }
    if (!foundDays) dayChecks.forEach(cb => cb.checked = true);

    let stMins = 8 * 60; let etMins = 22 * 60;
    const times = [...text.matchAll(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/g)].map(m => parseInt(m[1]) * 60 + parseInt(m[2]));
    const matchRange = text.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(?:-|–|—)\s*(\d{1,2})(?:[:.](\d{2}))?/);
    const matchFrom = text.match(/(?:^|[^а-яёa-z])(=?с|от|начиная с|после|не раньше)\s*(\d{1,2})(?:[:.](\d{2}))?/i);
    const matchTo = text.match(/(?:^|[^а-яёa-z])(=?до|по|не позже|раньше)\s*(\d{1,2})(?:[:.](\d{2}))?/i);
    if (matchRange) {
      let h1 = parseInt(matchRange[1]); let h2 = parseInt(matchRange[3]);
      if (h1 < 8 && h1 > 0) h1 += 12; if (h2 <= 8 && h2 > 0) h2 += 12;
      stMins = h1 * 60 + parseInt(matchRange[2] || 0); etMins = h2 * 60 + parseInt(matchRange[4] || 0);
    } else {
      if (matchFrom) { let h = parseInt(matchFrom[2]); if (h < 8 && h > 0) h += 12; stMins = h * 60 + parseInt(matchFrom[3] || 0); }
      else if (matchTo) { stMins = 8 * 60; } else if (times.length > 0) { stMins = Math.min(...times) - 60; }
      if (matchTo) { let h = parseInt(matchTo[2]); if (h <= 8 && h > 0) h += 12; etMins = h * 60 + parseInt(matchTo[3] || 0); }
      else if (matchFrom) { etMins = 22 * 60; } else if (times.length > 0) { etMins = Math.max(...times) + 120; }
    }
    stMins = Math.max(8 * 60, Math.min(22 * 60, stMins)); etMins = Math.max(8 * 60, Math.min(22 * 60, etMins));
    document.getElementById('search-time-start').value = minsToTime(stMins); document.getElementById('search-time-end').value = minsToTime(etMins);
  });

  document.getElementById('btn-clear-sms').addEventListener('click', () => {
    document.getElementById('manager-text-input').value = ''; document.getElementById('search-time-start').value = '08:00'; document.getElementById('search-time-end').value = '22:00';
    document.querySelectorAll('#slot-days-container input').forEach(cb => cb.checked = false); document.getElementById('slots-results').innerHTML = '';
  });

  document.getElementById('btn-export-prices').addEventListener('click', function () {
    const input = document.getElementById('sync-data-input');
    input.value = JSON.stringify(priceBook || {});
    input.select(); document.execCommand('copy');
    const orig = this.textContent; this.textContent = '📋 Скопировано!'; setTimeout(() => this.textContent = orig, 2000);
  });

  document.getElementById('btn-import-prices').addEventListener('click', async function () {
    try {
      const rawData = JSON.parse(document.getElementById('sync-data-input').value.trim());

      // Обновляем локальные данные
      priceBook = rawData;
      localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));

      // Отправляем в облако
      await saveToCloud();

      calcSalary(); initCalendar();
      document.getElementById('sync-data-input').value = '';
      const orig = this.textContent; this.textContent = '📥 Успешно!'; setTimeout(() => { this.textContent = orig; document.getElementById('stats-modal').classList.remove('active'); }, 1500);
    } catch (e) { alert('Ошибка данных!'); }
  });
  

  // ==========================================
  // НОВАЯ ИНТЕРАКТИВНАЯ ЗАГРУЗКА ИЗ EXCEL / CSV
  // ==========================================
  
  // Убираем старую динамическую кнопку, так как теперь она встроена в HTML
  const oldDynamicBtn = document.getElementById('btn-import-excel');
  if (oldDynamicBtn) oldDynamicBtn.remove();
  
  const filePicker = document.getElementById('excel-file-picker');
  const btnChooseFile = document.getElementById('btn-choose-file');
  let parsedExcelLessons = []; // Глобальная переменная для временного хранения распаршенных уроков
  
  if (btnChooseFile && filePicker) {
    btnChooseFile.addEventListener('click', () => {
      filePicker.click();
    });

    filePicker.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Динамическая загрузка библиотеки, если забыл обновить index.html
      if (typeof XLSX === 'undefined') {
        alert('Библиотека Excel не найдена в index.html. Пытаюсь загрузить автоматически...');
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const reader = new FileReader();
      reader.onload = function(evt) {
        try {
          const data = new Uint8Array(evt.target.result);
          // SheetJS читает как .xlsx, так и .csv
          const workbook = XLSX.read(data, {type: 'array'});
          processExcelData(workbook);
        } catch (err) {
          alert('Ошибка чтения файла: ' + err.message);
          console.error(err);
        } finally {
          filePicker.value = ''; // Сбрасываем инпут
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  function processExcelData(workbook) {
    parsedExcelLessons = [];

    workbook.SheetNames.forEach(sheetName => {
      // Пропускаем лист с долгами, так как там нет уроков
      if (sheetName.toLowerCase().includes('долг')) return; 

      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, {header: 1});
      let currentDate = '';

      rows.forEach((cols, index) => {
        if (!cols || cols.length === 0) return;
        
        let col0 = cols[0] ? String(cols[0]).trim() : '';
        let col1 = cols[1] ? String(cols[1]).trim() : '';
        let col2 = cols[2] ? String(cols[2]).trim() : '';
        let col3 = cols[3] ? String(cols[3]).trim() : '';

        // 1. Пытаемся распознать дату
        if (col0 && col0.toLowerCase() !== 'дата') {
          if (!isNaN(col0) && Number(col0) > 40000) {
            try {
              const dateObj = XLSX.SSF.parse_date_code(Number(col0));
              let day = String(dateObj.d).padStart(2, '0');
              let month = String(dateObj.m).padStart(2, '0');
              let year = String(dateObj.y);
              currentDate = `${year}-${month}-${day}`;
            } catch(e){}
          } else {
            const parts = col0.split('.');
            if (parts.length >= 2) {
              let day = parts[0].padStart(2, '0');
              let month = parts[1].padStart(2, '0');
              if (month === '00' || month === '0') month = '06'; 
              let year = parts[2] ? parts[2] : new Date().getFullYear().toString();
              if (year.length === 2) year = '20' + year;
              currentDate = `${year}-${month}-${day}`;
            }
          }
        }

        // 2. Распознаем урок
        if (!col1 || col1.toLowerCase().includes('итог') || col1.toLowerCase().includes('премия') || col1.toLowerCase() === 'урок/группа' || col1.toLowerCase().includes('вторая школа')) {
          return; // Пропускаем системные строки
        }

        let price = parseFloat(col3.replace(',', '.')) || 0;
        let statusText = col2.toLowerCase();
        
        if (currentDate && col1) {
          const schoolType = col1.includes('Группа') || col1.includes('Индив') || col1.includes('Шоу') ? 'ITCompot' : 'Zerocoder';
          
          let initialStatus = 'done';
          if (statusText.includes('комп.') || statusText.includes('прогул')) initialStatus = 'noshow';
          else if (statusText.includes('отменен') || statusText.includes('отмена')) initialStatus = 'canceled';

          parsedExcelLessons.push({
            tempId: `excel_${sheetName}_${index}`,
            date: currentDate,
            title: col1,
            school: schoolType,
            status: initialStatus,
            price: price,
            note: col2 !== 'комп.' && col2 !== '✅ Проведен' && col2 !== '⚠️ Прогул' ? col2 : '' 
          });
        }
      });
    });

    if (parsedExcelLessons.length === 0) {
      alert('Не удалось распознать уроки. Проверьте формат файла.');
      return;
    }

    // Сортируем по дате по убыванию (сначала свежие), чтобы было удобнее проверять последние уроки
    parsedExcelLessons.sort((a, b) => b.date.localeCompare(a.date));

    renderExcelReviewModal(parsedExcelLessons);
  }

  function renderExcelReviewModal(lessons) {
    const tbody = document.getElementById('excel-review-tbody');
    tbody.innerHTML = '';

    lessons.forEach((l, i) => {
      const parts = l.date.split('-');
      const d = parts[2]; const m = parts[1];

      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      
      // Выделяем прогулы и отмены цветом фона для удобства
      if (l.status === 'noshow') tr.style.background = 'rgba(245, 158, 11, 0.1)';
      else if (l.status === 'canceled') tr.style.background = 'rgba(239, 68, 68, 0.1)';

      tr.innerHTML = `
        <td style="padding: 10px; font-weight: bold; color: var(--text-main); white-space: nowrap;">${d}.${m}</td>
        <td style="padding: 10px; color: var(--text-main); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${l.title}">
          <div style="font-weight: bold; margin-bottom: 2px;">${l.title}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${l.school === 'ITCompot' ? 'ITC' : 'Zero'}</div>
        </td>
        <td style="padding: 10px;">
          <select class="review-status" data-index="${i}" style="width: 100%; padding: 6px; border-radius: 6px; background: var(--input-bg); color: var(--input-text); border: 1px solid var(--input-border); outline: none; font-size: 0.85rem;">
            <option value="done" ${l.status === 'done' ? 'selected' : ''}>✅ Проведен</option>
            <option value="noshow" ${l.status === 'noshow' ? 'selected' : ''}>⚠️ Прогул</option>
            <option value="canceled" ${l.status === 'canceled' ? 'selected' : ''}>❌ Отменен</option>
          </select>
        </td>
        <td style="padding: 10px;">
          <input type="number" class="review-price" data-index="${i}" value="${l.price}" style="width: 80px; padding: 6px; border-radius: 6px; background: var(--input-bg); color: var(--input-text); border: 1px solid var(--input-border); outline: none; font-size: 0.85rem;">
        </td>
        <td style="padding: 10px;">
          <input type="text" class="review-note" data-index="${i}" value="${l.note}" placeholder="Комментарий..." style="width: 100%; min-width: 150px; padding: 6px; border-radius: 6px; background: var(--input-bg); color: var(--input-text); border: 1px solid var(--input-border); outline: none; font-size: 0.85rem;">
        </td>
      `;
      tbody.appendChild(tr);

      // Добавляем интерактив: если поменяли статус, можно подсветить строку
      const selectEl = tr.querySelector('.review-status');
      selectEl.addEventListener('change', function() {
        tr.style.background = 'transparent';
        if (this.value === 'noshow') tr.style.background = 'rgba(245, 158, 11, 0.1)';
        else if (this.value === 'canceled') tr.style.background = 'rgba(239, 68, 68, 0.1)';
      });
    });

    document.getElementById('stats-modal').classList.remove('active'); // Закрываем статистику, чтобы не мешала
    document.getElementById('excel-review-modal').classList.add('active'); // Открываем новую модалку
  }

  // Обработчики кнопок модалки проверки
  document.getElementById('btn-review-close').addEventListener('click', () => {
    document.getElementById('excel-review-modal').classList.remove('active');
  });

  document.getElementById('btn-excel-confirm-cancel').addEventListener('click', () => {
    document.getElementById('excel-review-modal').classList.remove('active');
  });

  document.getElementById('btn-excel-confirm-all').addEventListener('click', async () => {
    const btn = document.getElementById('btn-excel-confirm-all');
    const origText = btn.innerHTML;
    btn.innerHTML = '⏳ Сохранение...';
    btn.disabled = true;

    try {
      const statusSelects = document.querySelectorAll('.review-status');
      const priceInputs = document.querySelectorAll('.review-price');
      const noteInputs = document.querySelectorAll('.review-note');
      
      let newCustomLessons = [];
      
      parsedExcelLessons.forEach((l, i) => {
        const finalStatus = statusSelects[i].value;
        const finalPrice = parseFloat(priceInputs[i].value) || 0;
        const finalNote = noteInputs[i].value.trim();
        
        const lessonId = `excel_${l.date}_${i}_${l.title.substring(0,5)}`;
        
        const cl = {
          id: lessonId,
          date: l.date,
          startTime: "08:00",
          endTime: "08:45",
          title: l.title,
          school: l.school,
          customDayIndex: getCustomDayIndex(l.date),
          isExcelCustom: true,
          excelPrice: finalPrice,
          excelStatus: finalStatus
        };
        
        newCustomLessons.push(cl);
        
        // Записываем финальные решения в общие справочники
        const lessonKey = `${daysOfWeek[cl.customDayIndex]}_${cl.startTime}_${cl.title}`;
        const dateKey = `${cl.date}_${cl.startTime}_${cl.title}`;
        
        statusBook[dateKey] = finalStatus;
        if (finalNote) {
          notesBook[lessonKey] = finalNote;
        }
        
        if (finalStatus === 'done') {
          priceBook[lessonKey] = finalPrice;
          delete overridePriceBook[dateKey];
        } else {
          overridePriceBook[dateKey] = finalPrice;
        }
      });
      
      customLessons = newCustomLessons;
      localStorage.setItem('customLessons', JSON.stringify(customLessons));
      localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));
      localStorage.setItem('lessonStatuses', JSON.stringify(statusBook));
      localStorage.setItem('lessonNotes', JSON.stringify(notesBook));
      localStorage.setItem('lessonOverrides', JSON.stringify(overridePriceBook));
      
      await saveToCloud();
      
      btn.innerHTML = '✅ Успешно!';
      setTimeout(() => {
        document.getElementById('excel-review-modal').classList.remove('active');
        location.reload(); // Обновляем страницу для отрисовки новых данных в календаре
      }, 1000);

    } catch (e) {
      alert('Ошибка сохранения: ' + e.message);
      btn.innerHTML = origText;
      btn.disabled = false;
    }
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});
