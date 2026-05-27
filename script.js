// ==========================================
// НАСТРОЙКИ СЕРВЕРА И ТЕМЫ
// ==========================================

const API_URL = 'https://lessons-mqy0.onrender.com/api/schedule';

let scheduleData = [];
let currentWeekMonday = getMonday(new Date());

const BYN_RATE = 0.0387; // Укажи здесь актуальный курс RUB к BYN
const HOUR_HEIGHT = 80;
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
let oldPriceBook = JSON.parse(localStorage.getItem('lessonPrices')) || {};
let newPriceBook = JSON.parse(localStorage.getItem('lessonPrices_v2')) || {};

if (Object.keys(newPriceBook).length === 0 && Object.keys(oldPriceBook).length > 0) {
  scheduleData.forEach(ev => {
    const oldKey = ev.title;
    const newKey = `${daysOfWeek[new Date(ev.date).getDay() === 0 ? 6 : new Date(ev.date).getDay() - 1]}_${ev.startTime}_${ev.title}`;
    if (oldPriceBook[oldKey]) {
      newPriceBook[newKey] = oldPriceBook[oldKey];
    }
  });
  priceBook = newPriceBook;
  localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));
} else {
  priceBook = newPriceBook;
}

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

      let heightPx = bottomPx - topPx;
      heightPx = Math.max(heightPx, (45 / 60) * HOUR_HEIGHT);

      const eventDiv = document.createElement('div');
      const theme = getTheme(event.school, dayName);

      eventDiv.className = `event-card ${theme}`;
      eventDiv.style.top = `${topPx}px`;
      eventDiv.style.height = `${heightPx}px`;

      const lessonKey = `${dayName}_${event.startTime}_${event.title}`;
      const price = parseFloat(priceBook[lessonKey]) || 0;

      const priceHtml = price > 0 ? `
        <div class="event-price-tag">
          <span class="price-rub">${price} ₽</span>
          <span class="price-byn">≈ ${(price * BYN_RATE).toFixed(2)} Br</span>
        </div>` : '';

      // На мобилках названия школ скрываются через отсутствие schoolBadge
      eventDiv.innerHTML = `
        <div class="event-time">${event.startTime} - ${event.endTime}</div>
        <div class="event-body">
            <div class="event-title">${event.title}</div>
            ${priceHtml}
        </div>
      `;

      eventDiv.addEventListener('click', () => {
        const link = LINKS[event.school];
        if (link) window.open(link, '_blank');
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

  const currentWeekDates = [];
  for (let i = 0; i < 7; i++) {
    currentWeekDates.push(formatDateToString(addDays(currentWeekMonday, i)));
  }

  currentWeekDates.forEach((dateStr, index) => {
    const dayEvents = scheduleData.filter(e => e.date === dateStr);
    if (dayEvents.length === 0) return;

    hasEvents = true;
    const dayName = daysOfWeek[index];
    const [, month, day] = dateStr.split('-');
    const displayDate = `${day}.${month}`;

    let dayHtml = `<div class="stat-day-header">${dayName} (${displayDate})</div>`;

    dayEvents.forEach(ev => {
      const lessonKey = `${dayName}_${ev.startTime}_${ev.title}`;
      const currentPrice = priceBook[lessonKey] || '';

      const displayTitle = `${ev.startTime} - ${ev.title}`;

      dayHtml += `
        <div class="price-row">
          <span class="price-title" title="${displayTitle}">${displayTitle}</span>
          <input type="number" class="price-input" data-key="${lessonKey}" value="${currentPrice}" placeholder="0" min="0" step="10">
        </div>
      `;
    });

    listContainer.innerHTML += dayHtml;
  });

  if (!hasEvents) {
    listContainer.innerHTML = '<div style="color: var(--text-muted); font-size:0.9rem; text-align: center; margin-top: 20px;">На этой неделе нет уроков.</div>';
  }

  document.querySelectorAll('.price-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const key = e.target.dataset.key;
      const val = parseFloat(e.target.value) || 0;

      priceBook[key] = val;
      localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));

      calcSalary();
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
    const lessonKey = `${daysOfWeek[new Date(ev.date).getDay() === 0 ? 6 : new Date(ev.date).getDay() - 1]}_${ev.startTime}_${ev.title}`;
    const price = parseFloat(priceBook[lessonKey]) || 0;

    weekSum += price;
    if (ev.date === realTodayStr) todaySum += price;
  });

  const todayByn = (todaySum * BYN_RATE).toFixed(2);
  const weekByn = (weekSum * BYN_RATE).toFixed(2);
  const bynSymbol = 'Br';

  document.getElementById('stat-today').innerHTML =
    `${todaySum} ₽ <span class="byn-text">(${todayByn} ${bynSymbol})</span>`;

  document.getElementById('stat-week').innerHTML =
    `${weekSum} ₽ <span style="font-size: 0.8rem; color: var(--text-muted);">(${weekByn} ${bynSymbol})</span>`;
}

// ==========================================
// ПОИСК СВОБОДНЫХ ОКОШЕК
// ==========================================
// ==========================================
// ПОИСК СВОБОДНЫХ ОКОШЕК (УМНОЕ УПЛОТНЕНИЕ)
// ==========================================
// ==========================================
// ПОИСК СВОБОДНЫХ ОКОШЕК (УМНОЕ УПЛОТНЕНИЕ + ГРАНИЦЫ)
// ==========================================
function findFreeSlots() {
  const duration = parseInt(document.getElementById('input-slot-duration').value) || 45;
  const checkboxes = document.querySelectorAll('#slot-days-container input:checked');
  const selectedIndexes = Array.from(checkboxes).map(cb => parseInt(cb.value));
  const resultsContainer = document.getElementById('slots-results');

  // Получаем рамки, которые установил менеджер (или наш парсер)
  const searchStartStr = document.getElementById('search-time-start').value || "08:00";
  const searchEndStr = document.getElementById('search-time-end').value || "22:00";
  const globalSearchStartMins = timeToMins(searchStartStr);
  const globalSearchEndMins = timeToMins(searchEndStr);

  if (selectedIndexes.length === 0) {
    resultsContainer.innerHTML = '<div style="color: #ef4444; font-weight: bold;">Выберите хотя бы один день!</div>';
    return;
  }

  resultsContainer.innerHTML = '';
  const GAP = 10;
  let smsLines = [];
  let allDaysFull = true;

  selectedIndexes.forEach(index => {
    const dateObj = addDays(currentWeekMonday, index);
    const dateStr = formatDateToString(dateObj);
    const dayName = daysOfWeek[index];

    if (index === 1 || index === 2) {
      smsLines.push(`▪️ ${dayName}: выходной`);
      return;
    }

    const dayEvents = scheduleData
      .filter(e => e.date === dateStr)
      .sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime));

    let currentMins = START_HOUR * 60; // Всегда начинаем день с 08:00
    const recommendations = [];

    dayEvents.forEach(event => {
      const evStart = timeToMins(event.startTime);
      const evEnd = timeToMins(event.endTime);

      const freeStart = currentMins;
      const freeEnd = evStart - GAP;

      // Ограничиваем свободное окно рамками менеджера
      const effStart = Math.max(freeStart, globalSearchStartMins);
      const effEnd = Math.min(freeEnd, globalSearchEndMins);

      // Если в окне есть место
      if (effEnd - effStart >= duration) {
        let ideal1 = freeStart; // Прижаться к предыдущему
        let ideal2 = freeEnd - duration; // Прижаться к следующему

        let recs = new Set();

        // Проверяем, влезают ли идеальные (плотные) варианты в рамки менеджера
        if (ideal1 >= globalSearchStartMins && (ideal1 + duration) <= globalSearchEndMins) recs.add(ideal1);
        if (ideal2 >= globalSearchStartMins && (ideal2 + duration) <= globalSearchEndMins) recs.add(ideal2);

        // Если идеальные варианты выпадают за рамки менеджера, но место всё же есть — 
        // прижимаем урок максимально близко к рамкам (например, просили с 13:00, ставим в 13:00)
        if (recs.size === 0) {
          recs.add(effStart);
          if (effEnd - duration !== effStart) recs.add(effEnd - duration);
        }

        recs.forEach(start => recommendations.push(start));
      }
      currentMins = evEnd + GAP;
    });

    // Проверка времени после последнего урока
    const freeStart = currentMins;
    const freeEnd = END_HOUR * 60;
    const effStart = Math.max(freeStart, globalSearchStartMins);
    const effEnd = Math.min(freeEnd, globalSearchEndMins);

    if (effEnd - effStart >= duration) {
      let ideal = freeStart;
      if (ideal >= globalSearchStartMins && (ideal + duration) <= globalSearchEndMins) {
        recommendations.push(ideal);
      } else {
        recommendations.push(effStart);
      }
    }

    if (recommendations.length > 0) {
      let uniqueRecs = [...new Set(recommendations)].sort((a,b) => a-b);
      let timeStrings = uniqueRecs.map(mins => `в ${minsToTime(mins)}`);
      smsLines.push(`▪️ ${dayName}: ${timeStrings.join(' или ')}`);
      allDaysFull = false; // Нашли хотя бы одно окно за все дни
    } else {
      smsLines.push(`▪️ ${dayName}: нет окошек в это время`);
    }
  });

  // ФИНАЛЬНЫЙ ВЫВОД
  let smsText = '';
  if (allDaysFull) {
    smsText = `К сожалению, в предложенное время предложить ничего не могу.`;
  } else {
    smsText = `Готов взять ученика (${duration} мин).\n\nМои окошки в рамках вашего запроса:\n${smsLines.join('\n')}\n\n*При необходимости могу сдвинуть время на +-30 минут. Какое бронируем?`;
  }

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

// ==========================================
// СИНХРОНИЗАЦИЯ ЦЕН (ИМПОРТ/ЭКСПОРТ)
// ==========================================
document.getElementById('btn-export-prices').addEventListener('click', function () {
  const data = localStorage.getItem('lessonPrices_v2') || '{}';
  const input = document.getElementById('sync-data-input');
  input.value = data;
  input.select();
  document.execCommand('copy');

  const originalText = this.textContent;
  this.textContent = '✅ Скопировано!';
  setTimeout(() => this.textContent = originalText, 2000);
});

document.getElementById('btn-import-prices').addEventListener('click', function () {
  const inputData = document.getElementById('sync-data-input').value.trim();

  if (!inputData) {
    alert('Поле пустое! Вставь код с ценами.');
    return;
  }

  try {
    const parsedData = JSON.parse(inputData);

    priceBook = parsedData;
    localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));

    calcSalary();
    initCalendar();

    document.getElementById('sync-data-input').value = '';
    const originalText = this.textContent;
    this.textContent = '✅ Успешно!';
    setTimeout(() => {
      this.textContent = originalText;
      document.getElementById('stats-modal').classList.remove('active');
    }, 1500);

  } catch (e) {
    alert('Ошибка! Похоже, код скопирован не полностью или с ошибкой.');
  }
});

// ==========================================
// АНАЛИЗАТОР ТЕКСТА МЕНЕДЖЕРА (АВТОЗАПОЛНЕНИЕ)
// ==========================================
// ==========================================
// ПОИСК СВОБОДНЫХ ОКОШЕК (УМНОЕ УПЛОТНЕНИЕ + ГРАНИЦЫ)
// ==========================================

// Анализатор текста менеджера
document.getElementById('manager-text-input').addEventListener('input', function(e) {
  const text = e.target.value.toLowerCase();
  if (!text.trim()) return;

  const dayChecks = document.querySelectorAll('#slot-days-container input');
  dayChecks.forEach(cb => cb.checked = false);

  let foundDays = false;
  const patterns = [
    { id: 0, r: /пн|понедельник/ },
    { id: 1, r: /вт|вторник/ },
    { id: 2, r: /ср|сред[ау]/ },
    { id: 3, r: /чт|четверг/ },
    { id: 4, r: /пт|пятниц[ау]/ },
    { id: 5, r: /сб|суббот[ау]/ },
    { id: 6, r: /вс|воскресень[ея]|вскр/ }
  ];

  if (text.includes('все дни') || text.includes('любой день') || text.includes('каждый день')) {
    dayChecks.forEach(cb => cb.checked = true);
    foundDays = true;
  } else {
    patterns.forEach(p => {
      if (p.r.test(text)) {
        document.querySelector(`#slot-days-container input[value="${p.id}"]`).checked = true;
        foundDays = true;
      }
    });
  }

  if (text.includes('кроме')) {
    const parts = text.split('кроме');
    if (parts.length > 1) {
      patterns.forEach(p => {
        if (p.r.test(parts[1])) document.querySelector(`#slot-days-container input[value="${p.id}"]`).checked = false;
      });
    }
  }

  if (!foundDays) dayChecks.forEach(cb => cb.checked = true);

  let st = "08:00";
  let et = "22:00";

  // Улучшенный поиск времени: ловит диапазоны типа 18:00-20:00 или 18-20
  const matchRange = text.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(?:-|–|—)\s*(\d{1,2})(?:[:.](\d{2}))?/);
  if (matchRange) {
    let h1 = parseInt(matchRange[1]);
    let m1 = matchRange[2] || "00";
    let h2 = parseInt(matchRange[3]);
    let m2 = matchRange[4] || "00";
    if (h1 < 8 && h1 > 0) h1 += 12;
    if (h2 <= 8 && h2 > 0) h2 += 12;
    st = `${h1.toString().padStart(2, '0')}:${m1}`;
    et = `${h2.toString().padStart(2, '0')}:${m2}`;
  } else {
    const matchFrom = text.match(/(?:с|от)\s*(\d{1,2})(?:[:.](\d{2}))?/);
    if (matchFrom) {
      let h = parseInt(matchFrom[1]);
      let m = matchFrom[2] || "00";
      if (h < 8 && h > 0) h += 12;
      st = `${h.toString().padStart(2, '0')}:${m}`;
    }
    const matchTo = text.match(/(?:до|по)\s*(\d{1,2})(?:[:.](\d{2}))?/);
    if (matchTo) {
      let h = parseInt(matchTo[1]);
      let m = matchTo[2] || "00";
      if (h <= 8 && h > 0) h += 12;
      et = `${h.toString().padStart(2, '0')}:${m}`;
    }
    const matchAt = text.match(/(?:в|на)\s*(\d{1,2})(?:[:.](\d{2}))?/);
    if (matchAt && !matchFrom && !matchTo) {
       let h = parseInt(matchAt[1]);
       let m = matchAt[2] || "00";
       if (h < 8 && h > 0) h += 12;
       let startH = Math.max(8, h - 1);
       let endH = Math.min(22, h + 2);
       st = `${startH.toString().padStart(2, '0')}:${m}`;
       et = `${endH.toString().padStart(2, '0')}:${m}`;
    }
  }

  document.getElementById('search-time-start').value = st;
  document.getElementById('search-time-end').value = et;
});

// Логика кнопки Очистить
document.getElementById('btn-clear-sms').addEventListener('click', () => {
  document.getElementById('manager-text-input').value = '';
  document.getElementById('search-time-start').value = '08:00';
  document.getElementById('search-time-end').value = '22:00';
  document.querySelectorAll('#slot-days-container input').forEach(cb => cb.checked = false);
  document.getElementById('slots-results').innerHTML = '';
});

// Алгоритм подбора
function findFreeSlots() {
  const duration = parseInt(document.getElementById('input-slot-duration').value) || 45;
  const checkboxes = document.querySelectorAll('#slot-days-container input:checked');
  const selectedIndexes = Array.from(checkboxes).map(cb => parseInt(cb.value));
  const resultsContainer = document.getElementById('slots-results');

  // Базовые рамки от менеджера
  const baseSearchStartMins = timeToMins(document.getElementById('search-time-start').value || "08:00");
  const baseSearchEndMins = timeToMins(document.getElementById('search-time-end').value || "22:00");

  // ДОПУСК 30 МИНУТ: Расширяем рамки, так как мы можем двигать время менеджера
  const globalSearchStartMins = Math.max(START_HOUR * 60, baseSearchStartMins - 30);
  const globalSearchEndMins = Math.min(END_HOUR * 60, baseSearchEndMins + 30);

  if (selectedIndexes.length === 0) {
    resultsContainer.innerHTML = '<div style="color: #ef4444; font-weight: bold;">Выберите хотя бы один день!</div>';
    return;
  }

  resultsContainer.innerHTML = '';
  const GAP = 10;
  let smsLines = [];
  let allDaysFull = true;

  selectedIndexes.forEach(index => {
    const dateObj = addDays(currentWeekMonday, index);
    const dateStr = formatDateToString(dateObj);
    const dayName = daysOfWeek[index];

    if (index === 1 || index === 2) {
      smsLines.push(`▪️ ${dayName}: выходной`);
      return;
    }

    const dayEvents = scheduleData
      .filter(e => e.date === dateStr)
      .sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime));

    let currentMins = START_HOUR * 60;
    const recommendations = [];

    dayEvents.forEach(event => {
      const evStart = timeToMins(event.startTime);
      const evEnd = timeToMins(event.endTime);

      const freeStart = currentMins;
      const freeEnd = evStart - GAP;

      // Ограничиваем окно рамками (уже с допуском в 30 минут)
      const effStart = Math.max(freeStart, globalSearchStartMins);
      const effEnd = Math.min(freeEnd, globalSearchEndMins);

      if (effEnd - effStart >= duration) {
        let ideal1 = freeStart; 
        let ideal2 = freeEnd - duration; 
        let recs = new Set();

        if (ideal1 >= globalSearchStartMins && (ideal1 + duration) <= globalSearchEndMins) recs.add(ideal1);
        if (ideal2 >= globalSearchStartMins && (ideal2 + duration) <= globalSearchEndMins) recs.add(ideal2);

        if (recs.size === 0) {
          recs.add(effStart);
          if (effEnd - duration !== effStart) recs.add(effEnd - duration);
        }

        recs.forEach(start => recommendations.push(start));
      }
      currentMins = evEnd + GAP;
    });

    const freeStart = currentMins;
    const freeEnd = END_HOUR * 60;
    const effStart = Math.max(freeStart, globalSearchStartMins);
    const effEnd = Math.min(freeEnd, globalSearchEndMins);

    if (effEnd - effStart >= duration) {
      let ideal = freeStart;
      if (ideal >= globalSearchStartMins && (ideal + duration) <= globalSearchEndMins) {
        recommendations.push(ideal);
      } else {
        recommendations.push(effStart);
      }
    }

    if (recommendations.length > 0) {
      let uniqueRecs = [...new Set(recommendations)].sort((a,b) => a-b);
      let timeStrings = uniqueRecs.map(mins => `в ${minsToTime(mins)}`);
      smsLines.push(`▪️ ${dayName}: ${timeStrings.join(' или ')}`);
      allDaysFull = false;
    } else {
      smsLines.push(`▪️ ${dayName}: нет окошек`);
    }
  });

  let smsText = '';
  if (allDaysFull) {
    smsText = `К сожалению, в предложенное время предложить ничего не могу.`;
  } else {
    smsText = `Готов взять ученика (${duration} мин).\n\nМои окошки в рамках вашего запроса:\n${smsLines.join('\n')}\n\n*С учетом того, что предложенное вами время я могу двигать на 30 мин. Какое бронируем?`;
  }

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

// ЗАПУСК ПРИ ОТКРЫТИИ
document.addEventListener('DOMContentLoaded', fetchLessons);