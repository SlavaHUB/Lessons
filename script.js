// ==========================================
// НАСТРОЙКИ СЕРВЕРА И ТЕМЫ
// ==========================================

const API_URL = 'https://lessons-mqy0.onrender.com/api/schedule';

let scheduleData = [];
let currentWeekMonday = getMonday(new Date());

const HOUR_HEIGHT = 60;
const START_HOUR = 8;
const END_HOUR = 23;
const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const monthsRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

// Ссылки на CRM
const LINKS = {
  ITCompot: 'https://it-school.t8s.ru/Interactive/12445?TeacherId=12445&TrialLessonsOnly=False&StudyRequestsMode=False&ClassroomsColumnsMode=True&DefaultView=agendaWeek&ExpandableFormClosed=False&Submitted=False',
  Zerocoder: 'https://crm.genius-school.online/#/lessons',
  Matrius: 'https://crm.genius-school.online/#/lessons'
};

// База цен в LocalStorage
let priceBook = JSON.parse(localStorage.getItem('lessonPrices')) || {};

// Инициализация темы из LocalStorage
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeButton(savedTheme);

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

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

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

function timeToMins(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minsToTime(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function timeToPixels(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return ((hours - START_HOUR) + minutes / 60) * HOUR_HEIGHT;
}

function updateThemeButton(theme) {
  const btn = document.getElementById('btn-theme');
  if (btn) btn.textContent = theme === 'dark' ? '☀️ Светлая' : '🌙 Тёмная';
}

// ==========================================
// СЕТЕВАЯ ЛОГИКА
// ==========================================
async function fetchLessons() {
  try {
    const startStr = formatDateToString(currentWeekMonday);
    const endStr = formatDateToString(addDays(currentWeekMonday, 6));

    const response = await fetch(`${API_URL}?start=${startStr}&end=${endStr}`);
    if (response.ok) {
      const rawData = await response.json();
      const validEvents = [];
      const expiredSchools = new Set();

      rawData.forEach(item => {
        if (item.isError) expiredSchools.add(item.school);
        else validEvents.push(item);
      });

      scheduleData = validEvents;
      
      const alertBox = document.getElementById('cookie-alert');
      if (expiredSchools.size > 0) {
        document.getElementById('expired-schools').textContent = Array.from(expiredSchools).join(', ');
        alertBox.style.display = 'block';
      } else {
        alertBox.style.display = 'none';
      }

      initCalendar();
    }
  } catch (error) { console.error('Ошибка загрузки данных:', error); }
}

// ==========================================
// ОТРИСОВКА КАЛЕНДАРЯ
// ==========================================
function initCalendar() {
  const header = document.getElementById('calendar-header');
  const timeLabels = document.getElementById('time-labels');
  const daysGrid = document.getElementById('days-grid');
  const rangeDisplay = document.getElementById('week-range-display');

  header.innerHTML = '<div class="time-header-cell"></div>';
  timeLabels.innerHTML = '';
  daysGrid.innerHTML = '';

  const sundayOfCurrentWeek = addDays(currentWeekMonday, 6);
  const startDay = currentWeekMonday.getDate();
  const endDay = sundayOfCurrentWeek.getDate();
  const startMonth = monthsRu[currentWeekMonday.getMonth()];
  const endMonth = monthsRu[sundayOfCurrentWeek.getMonth()];
  const currentYear = currentWeekMonday.getFullYear();

  if (currentWeekMonday.getMonth() === sundayOfCurrentWeek.getMonth()) {
    rangeDisplay.textContent = `${startDay} – ${endDay} ${startMonth} ${currentYear} г.`;
  } else {
    rangeDisplay.textContent = `${startDay} ${startMonth} – ${endDay} ${endMonth} ${currentYear} г.`;
  }

  const realTodayStr = formatDateToString(new Date());
  const currentWeekDates = [];

  for (let i = 0; i < 7; i++) {
    const dateForDay = addDays(currentWeekMonday, i);
    currentWeekDates.push(dateForDay);
    const formattedDayDate = `${dateForDay.getDate()}.${dateForDay.getMonth() + 1}`;

    const isToday = formatDateToString(dateForDay) === realTodayStr;
    const todayClass = isToday ? ' today' : '';

    header.innerHTML += `<div class="day-header${todayClass}">${daysOfWeek[i]} <span>${formattedDayDate}</span></div>`;
  }

  for (let i = START_HOUR; i <= END_HOUR; i++) {
    const timeString = i.toString().padStart(2, '0') + ':00';
    timeLabels.innerHTML += `<div class="time-slot">${timeString}</div>`;
  }

  daysOfWeek.forEach((dayName, index) => {
    const dayCol = document.createElement('div');
    dayCol.className = 'day-column';

    const columnDateStr = formatDateToString(currentWeekDates[index]);

    if (columnDateStr === realTodayStr) dayCol.classList.add('today');
    if (index === 1 || index === 2) dayCol.classList.add('day-off');

    const events = scheduleData.filter(e => e.date === columnDateStr);

    events.forEach(event => {
      const topPx = timeToPixels(event.startTime);
      const bottomPx = timeToPixels(event.endTime);
      
      // Минимум 45 пикселей (для уроков в 30 мин)
      let heightPx = bottomPx - topPx;
      heightPx = Math.max(heightPx, (45 / 60) * HOUR_HEIGHT);

      const eventDiv = document.createElement('div');
      const theme = getTheme(event.school, dayName);

      eventDiv.className = `event-card ${theme}`;
      eventDiv.style.top = `${topPx}px`;
      eventDiv.style.height = `${heightPx}px`;

      const schoolBadge = event.school ? `[${event.school}] ` : '';
      
      // Ищем цену для вывода на карточке
      const price = priceBook[event.title] || 0;
      const priceBadge = price > 0 ? `<div class="event-price">${price} ₽</div>` : '';

      eventDiv.innerHTML = `
        <div class="event-time">${event.startTime} - ${event.endTime}</div>
        <div class="event-title">${schoolBadge}${event.title}</div>
        ${priceBadge}
      `;

      eventDiv.addEventListener('click', () => {
        const link = LINKS[event.school];
        if(link) window.open(link, '_blank');
      });

      dayCol.appendChild(eventDiv);
    });
    daysGrid.appendChild(dayCol);
  });
}

// ==========================================
// СТАТИСТИКА И ЗАРПЛАТА
// ==========================================
function openStats() {
  const modal = document.getElementById('stats-modal');
  const listContainer = document.getElementById('price-settings-list');

  listContainer.innerHTML = '';
  let hasEvents = false;

  // Формируем список дат для текущей загруженной недели
  const currentWeekDates = [];
  for (let i = 0; i < 7; i++) {
    currentWeekDates.push(formatDateToString(addDays(currentWeekMonday, i)));
  }

  // Генерируем блоки по дням
  currentWeekDates.forEach((dateStr, index) => {
    // Уроки конкретного дня
    const dayEvents = scheduleData.filter(e => e.date === dateStr);
    if (dayEvents.length === 0) return;
    
    hasEvents = true;
    const dayName = daysOfWeek[index];
    const [, month, day] = dateStr.split('-');
    const displayDate = `${day}.${month}`;

    // Заголовок дня
    let dayHtml = `<div class="stat-day-header">${dayName} (${displayDate})</div>`;
    
    // Уникальные уроки в этот день
    const uniqueDayTitles = [...new Set(dayEvents.map(e => e.title))].sort();
    
    uniqueDayTitles.forEach(title => {
      const currentPrice = priceBook[title] || ''; // Пустое поле, если 0
      dayHtml += `
        <div class="price-row">
          <span class="price-title" title="${title}">${title}</span>
          <input type="number" class="price-input" data-title="${title}" value="${currentPrice}" placeholder="0" min="0" step="10">
        </div>
      `;
    });
    
    listContainer.innerHTML += dayHtml;
  });

  if (!hasEvents) {
    listContainer.innerHTML = '<div style="color: var(--text-muted); font-size:0.9rem; text-align: center; margin-top: 20px;">На этой неделе нет уроков.</div>';
  }

  // Слушатели для синхронного сохранения цен
  document.querySelectorAll('.price-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const title = e.target.dataset.title;
      const val = parseFloat(e.target.value) || 0;
      
      // Сохраняем в память
      priceBook[title] = val;
      localStorage.setItem('lessonPrices', JSON.stringify(priceBook));
      
      // Обновляем общую сумму
      calcSalary();
      
      // Если этот же урок есть в другие дни (например, во вторник и четверг) - синхронизируем цифру
      document.querySelectorAll(`.price-input[data-title="${title}"]`).forEach(inp => {
        if (inp !== e.target) inp.value = val || '';
      });

      // Сразу перерисовываем календарь, чтобы бейдж появился на фоне
      initCalendar();
    });
  });

  calcSalary();
  modal.classList.add('active');
  document.getElementById('action-controls').classList.remove('open');
}

function calcSalary() {
  let todaySum = 0;
  let weekSum = 0;
  const realTodayStr = formatDateToString(new Date());

  scheduleData.forEach(ev => {
    const price = priceBook[ev.title] || 0;
    weekSum += price;
    if (ev.date === realTodayStr) todaySum += price;
  });

  document.getElementById('stat-today').textContent = `${todaySum} ₽`;
  document.getElementById('stat-week').textContent = `${weekSum} ₽`;
}


// ==========================================
// ПОИСК СВОБОДНЫХ ОКОШЕК
// ==========================================
function findFreeSlots() {
  const duration = parseInt(document.getElementById('input-slot-duration').value) || 45;
  const checkboxes = document.querySelectorAll('#slot-days-container input:checked');
  const selectedIndexes = Array.from(checkboxes).map(cb => parseInt(cb.value));
  const resultsContainer = document.getElementById('slots-results');

  if (selectedIndexes.length === 0) {
    resultsContainer.innerHTML = '<div style="color: #ef4444; font-weight: bold;">Выберите хотя бы один день!</div>';
    return;
  }

  resultsContainer.innerHTML = '';
  const GAP = 10;
  const dayStartMins = START_HOUR * 60; 
  const dayEndMins = 22 * 60; 

  let smsLines = [];
  let allDaysFull = true;

  selectedIndexes.forEach(index => {
    const dateObj = addDays(currentWeekMonday, index);
    const dateStr = formatDateToString(dateObj);
    const dayName = daysOfWeek[index];

    if (index === 1 || index === 2) {
      smsLines.push(`▪️ ${dayName}: выходной`);
      allDaysFull = false;
      return;
    }

    const dayEvents = scheduleData
      .filter(e => e.date === dateStr)
      .sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime));

    let currentMins = dayStartMins;
    const availableBlocks = [];

    dayEvents.forEach(event => {
      const evStart = timeToMins(event.startTime);
      const evEnd = timeToMins(event.endTime);

      const freeStart = currentMins;
      const freeEnd = evStart - GAP;

      if (freeEnd - freeStart >= duration) {
        const latestStart = freeEnd - duration;
        if (latestStart === freeStart) availableBlocks.push(`в ${minsToTime(freeStart)}`);
        else availableBlocks.push(`с ${minsToTime(freeStart)} до ${minsToTime(latestStart)}`);
      }
      currentMins = evEnd + GAP;
    });

    const freeStart = currentMins;
    const freeEnd = dayEndMins;

    if (freeEnd - freeStart >= duration && freeStart <= dayEndMins - duration) {
      const latestStart = freeEnd - duration;
      if (latestStart === freeStart) availableBlocks.push(`в ${minsToTime(freeStart)}`);
      else availableBlocks.push(`с ${minsToTime(freeStart)} до ${minsToTime(latestStart)}`);
    }

    if (dayEvents.length === 0) {
      smsLines.push(`▪️ ${dayName}: любое время с 08:00 до ${minsToTime(dayEndMins - duration)}`);
      allDaysFull = false;
    } else if (availableBlocks.length > 0) {
      smsLines.push(`▪️ ${dayName}: ${availableBlocks.join(' или ')}`);
      allDaysFull = false;
    }
  });

  if (allDaysFull) {
    resultsContainer.innerHTML = '<div style="color: #ef4444; font-weight: 500;">❌ В выбранные дни нет окошек для такого урока до 22:00.</div>';
  } else {
    const smsText = `Готов взять урок (${duration} мин).\n\nМои свободные окошки для старта:\n${smsLines.join('\n')}\n\nКакое время выберем?`;
    resultsContainer.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 10px; color: var(--text-main); font-size: 0.85rem;">Шаблон ответа менеджеру:</div>
      <textarea id="sms-output" readonly style="width: 100%; height: 160px; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); font-family: inherit; font-size: 0.85rem; resize: none; background: var(--bg-modal); color: var(--text-main); line-height: 1.5; outline: none;">${smsText}</textarea>
      <button id="btn-copy-sms" class="btn-primary" style="width: 100%; margin-top: 10px; background: #10b981;">📋 Скопировать текст</button>
    `;

    document.getElementById('btn-copy-sms').addEventListener('click', function () {
      const copyText = document.getElementById('sms-output');
      copyText.select();
      document.execCommand('copy');
      const originalText = this.textContent;
      this.textContent = '✅ Скопировано в буфер!';
      this.style.background = '#059669';
      setTimeout(() => {
        this.textContent = originalText;
        this.style.background = '#10b981';
      }, 2000);
    });
  }
}

// ==========================================
// СЛУШАТЕЛИ СОБЫТИЙ UI
// ==========================================
document.getElementById('btn-burger').addEventListener('click', () => { document.getElementById('action-controls').classList.toggle('open'); });
document.getElementById('btn-prev').addEventListener('click', () => { currentWeekMonday = addDays(currentWeekMonday, -7); fetchLessons(); });
document.getElementById('btn-next').addEventListener('click', () => { currentWeekMonday = addDays(currentWeekMonday, 7); fetchLessons(); });
document.getElementById('btn-today').addEventListener('click', () => { currentWeekMonday = getMonday(new Date()); fetchLessons(); });

document.getElementById('btn-stats').addEventListener('click', openStats);
document.getElementById('btn-stats-close').addEventListener('click', () => { document.getElementById('stats-modal').classList.remove('active'); });

document.getElementById('btn-theme').addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButton(newTheme);
});

document.getElementById('btn-find-slots').addEventListener('click', () => {
  document.getElementById('slots-results').innerHTML = '';
  document.getElementById('slots-modal').classList.add('active');
  document.getElementById('action-controls').classList.remove('open');
});
document.getElementById('btn-slots-cancel').addEventListener('click', () => { document.getElementById('slots-modal').classList.remove('active'); });
document.getElementById('btn-slots-search').addEventListener('click', findFreeSlots);

document.getElementById('btn-export').addEventListener('click', async () => {
  document.getElementById('action-controls').classList.remove('open');
  const btnExport = document.getElementById('btn-export');
  const originalText = btnExport.innerHTML;
  btnExport.innerHTML = '⏳ Создаю...';
  const calendar = document.querySelector('.calendar-wrapper');

  try {
    const canvas = await html2canvas(calendar, { scale: 2 });
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `Расписание_${formatDateToString(currentWeekMonday)}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Моё расписание' });
          btnExport.innerHTML = '✅ Отправлено!';
        } catch (err) { btnExport.innerHTML = originalText; }
      } else {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          btnExport.innerHTML = '✅ В буфере!';
          btnExport.style.background = '#059669';
          btnExport.style.color = 'white';
        } catch (err) {
          const link = document.createElement('a');
          link.download = file.name;
          link.href = URL.createObjectURL(blob);
          link.click();
          btnExport.innerHTML = '✅ Скачано!';
        }
      }
      setTimeout(() => {
        btnExport.innerHTML = originalText;
        btnExport.style.background = '';
        btnExport.style.color = '';
      }, 2000);
    }, 'image/png');
  } catch (error) {
    alert('Не удалось создать скриншот!');
    btnExport.innerHTML = originalText;
  }
});

// ЗАПУСК ПРИ ОТКРЫТИИ
document.addEventListener('DOMContentLoaded', fetchLessons);