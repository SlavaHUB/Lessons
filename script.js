// ==========================================
// НАСТРОЙКИ СЕРВЕРА И БЕЗОПАСНОСТИ
// ==========================================
const API_URL = 'https://6a113ca53e35d0f37ee3157f.mockapi.io/lessons';
const ADMIN_HASH = 'c2Ftc3VuZzE5NzY=';

let scheduleData = [];
let editingLessonId = null;
let currentWeekMonday = getMonday(new Date());

const HOUR_HEIGHT = 60;
const START_HOUR = 8;
const END_HOUR = 23;
const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const monthsRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

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

function checkCollision(date, start, end, excludeId = null) {
  return scheduleData.some(event => {
    if (event.status === 'Отменен') return false;
    if (excludeId && event.id === excludeId) return false;
    if (event.date !== date) return false;

    return (start < event.endTime && end > event.startTime);
  });
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

// ==========================================
// ПРОВЕРКА ПАРОЛЯ
// ==========================================
function requestPassword(actionTitle) {
  return new Promise((resolve) => {
    if (localStorage.getItem('adminAccess') === 'granted') {
      return resolve(true);
    }

    const passModal = document.getElementById('password-modal');
    const passInput = document.getElementById('input-password');
    const passError = document.getElementById('password-error');
    const btnSubmit = document.getElementById('btn-pass-submit');
    const btnCancel = document.getElementById('btn-pass-cancel');

    document.getElementById('password-title').textContent = actionTitle;
    passInput.value = '';
    passError.style.display = 'none';

    passModal.classList.add('active');
    setTimeout(() => passInput.focus(), 100);

    const cleanup = () => {
      passModal.classList.remove('active');
      btnSubmit.onclick = null;
      btnCancel.onclick = null;
      passInput.onkeydown = null;
    };

    const checkSubmit = () => {
      const pass = passInput.value;
      try {
        if (btoa(pass) === ADMIN_HASH) {
          localStorage.setItem('adminAccess', 'granted');
          cleanup();
          resolve(true);
        } else {
          passError.textContent = 'Неверный пароль!';
          passError.style.display = 'block';
          passInput.value = '';
          passInput.focus();
        }
      } catch (err) {
        passError.textContent = 'Переключитесь на английский!';
        passError.style.display = 'block';
        passInput.value = '';
        passInput.focus();
      }
    };

    btnSubmit.onclick = checkSubmit;
    passInput.onkeydown = (e) => { if (e.key === 'Enter') checkSubmit(); };
    btnCancel.onclick = () => { cleanup(); resolve(false); };
  });
}

function timeToPixels(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return ((hours - START_HOUR) + minutes / 60) * HOUR_HEIGHT;
}

// ==========================================
// СЕТЕВАЯ ЛОГИКА
// ==========================================
async function fetchLessons() {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      scheduleData = await response.json();
      initCalendar();
    }
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
}

async function updateLessonInAPI(id, updatedEvent) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent)
    });
    if (response.ok) {
      const savedEvent = await response.json();
      scheduleData = scheduleData.map(event => event.id === id ? savedEvent : event);
      initCalendar();
    }
  } catch (error) {
    alert('Не удалось обновить урок.');
  }
}

async function deleteLessonFromAPI(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      scheduleData = scheduleData.filter(event => event.id !== id);
      initCalendar();
    }
  } catch (error) {
    alert('Не удалось удалить урок.');
  }
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

  const currentWeekDates = [];
  for (let i = 0; i < 7; i++) {
    const dateForDay = addDays(currentWeekMonday, i);
    currentWeekDates.push(dateForDay);
    const formattedDayDate = `${dateForDay.getDate()}.${dateForDay.getMonth() + 1}`;
    header.innerHTML += `<div class="day-header">${daysOfWeek[i]} <span>${formattedDayDate}</span></div>`;
  }

  for (let i = START_HOUR; i <= END_HOUR; i++) {
    const timeString = i.toString().padStart(2, '0') + ':00';
    timeLabels.innerHTML += `<div class="time-slot">${timeString}</div>`;
  }

  daysOfWeek.forEach((dayName, index) => {
    const dayCol = document.createElement('div');
    dayCol.className = 'day-column';

    const columnDateStr = formatDateToString(currentWeekDates[index]);
    const events = scheduleData.filter(e => e.date === columnDateStr);

    events.forEach(event => {
      const topPx = timeToPixels(event.startTime);
      const bottomPx = timeToPixels(event.endTime);
      const heightPx = bottomPx - topPx;

      const eventDiv = document.createElement('div');
      const theme = getTheme(event.school, dayName);

      const statusClass = event.status === 'Отменен' ? 'status-canceled' : '';
      eventDiv.className = `event-card ${theme} ${statusClass}`;

      eventDiv.style.top = `${topPx}px`;
      eventDiv.style.height = `${heightPx}px`;

      const schoolBadge = event.school ? `[${event.school}] ` : '';
      const cancelLabel = event.status === 'Отменен' ? ' (ОТМЕНЕН)' : '';

      eventDiv.innerHTML = `
        <button class="delete-btn" onclick="deleteEvent('${event.id}', event)">&times;</button>
        <div class="event-time">${event.startTime} - ${event.endTime}</div>
        <div class="event-title">${schoolBadge}${event.title}${cancelLabel}</div>
        ${event.desc ? `<div class="event-desc">${event.desc}</div>` : ''}
      `;

      eventDiv.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) return;

        const hasAccess = await requestPassword('Редактировать урок');
        if (hasAccess) {
          editingLessonId = event.id;
          document.getElementById('modal-title').textContent = 'Редактировать урок';

          document.getElementById('input-date').value = event.date;
          document.getElementById('input-school').value = event.school || 'RTS';
          document.getElementById('input-title').value = event.title;
          document.getElementById('input-start').value = event.startTime;
          document.getElementById('input-end').value = event.endTime;
          document.getElementById('input-desc').value = event.desc || '';
          document.getElementById('input-price').value = event.price || '';
          document.getElementById('input-status').value = event.status || 'Проведен';
          document.getElementById('input-comp').value = event.compensation || '';

          // Прячем блок повторений при редактировании
          document.getElementById('repeat-block').style.display = 'none';

          modal.classList.add('active');
        }
      });

      dayCol.appendChild(eventDiv);
    });

    daysGrid.appendChild(dayCol);
  });
}

function showStats() {
  const statsModal = document.getElementById('stats-modal');
  const statsContainer = document.getElementById('stats-container');

  const totals = { 'RTS': 0, 'ITCompot': 0, 'Zerocoder': 0, 'Matrius': 0 };
  let grandTotal = 0;

  const startStr = formatDateToString(currentWeekMonday);
  const endStr = formatDateToString(addDays(currentWeekMonday, 6));

  scheduleData.forEach(event => {
    if (event.date >= startStr && event.date <= endStr) {
      const school = event.school;
      let finalPrice = event.status === 'Отменен' ? (Number(event.compensation) || 0) : (Number(event.price) || 0);

      if (totals[school] !== undefined) {
        totals[school] += finalPrice;
        grandTotal += finalPrice;
      }
    }
  });

  statsContainer.innerHTML = `
    <div class="stat-row"><span class="stat-school">RTS:</span> <span>${totals['RTS']} ₽</span></div>
    <div class="stat-row"><span class="stat-school">ITCompot:</span> <span>${totals['ITCompot']} ₽</span></div>
    <div class="stat-row"><span class="stat-school">Zerocoder:</span> <span>${totals['Zerocoder']} ₽</span></div>
    <div class="stat-row"><span class="stat-school">Matrius:</span> <span>${totals['Matrius']} ₽</span></div>
    <div class="stat-total">Итого за неделю: ${grandTotal} ₽</div>
  `;
  statsModal.classList.add('active');
}

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
  const dayStartMins = START_HOUR * 60; // 08:00
  const dayEndMins = 22 * 60; // 22:00

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
      .filter(e => e.date === dateStr && e.status !== 'Отменен')
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
        if (latestStart === freeStart) {
          availableBlocks.push(`в ${minsToTime(freeStart)}`);
        } else {
          availableBlocks.push(`с ${minsToTime(freeStart)} до ${minsToTime(latestStart)}`);
        }
      }
      currentMins = evEnd + GAP;
    });

    const freeStart = currentMins;
    const freeEnd = dayEndMins;

    if (freeEnd - freeStart >= duration && freeStart <= dayEndMins - duration) {
      const latestStart = freeEnd - duration;
      if (latestStart === freeStart) {
        availableBlocks.push(`в ${minsToTime(freeStart)}`);
      } else {
        availableBlocks.push(`с ${minsToTime(freeStart)} до ${minsToTime(latestStart)}`);
      }
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
      <div style="font-weight: 600; margin-bottom: 10px; color: #374151; font-size: 0.85rem;">Шаблон ответа менеджеру:</div>
      <textarea id="sms-output" readonly style="width: 100%; height: 160px; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-family: inherit; font-size: 0.85rem; resize: none; background: #f8fafc; color: #334155; line-height: 1.5; outline: none;">${smsText}</textarea>
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
// УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ И ОТПРАВКОЙ НА СЕРВЕР
// ==========================================
const modal = document.getElementById('modal');
const btnAdd = document.getElementById('btn-add');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('btn-save');
const btnStats = document.getElementById('btn-stats');
const btnStatsClose = document.getElementById('btn-stats-close');
const btnCopyWeek = document.getElementById('btn-copy-week');
const btnFindSlots = document.getElementById('btn-find-slots');
const slotsModal = document.getElementById('slots-modal');
const btnSlotsCancel = document.getElementById('btn-slots-cancel');
const btnSlotsSearch = document.getElementById('btn-slots-search');
const btnBurger = document.getElementById('btn-burger');
const actionControls = document.getElementById('action-controls');

// БУРГЕР МЕНЮ
btnBurger.addEventListener('click', () => {
  actionControls.classList.toggle('open');
});

// НАВИГАЦИЯ
document.getElementById('btn-prev').addEventListener('click', () => { currentWeekMonday = addDays(currentWeekMonday, -7); initCalendar(); });
document.getElementById('btn-next').addEventListener('click', () => { currentWeekMonday = addDays(currentWeekMonday, 7); initCalendar(); });
document.getElementById('btn-today').addEventListener('click', () => { currentWeekMonday = getMonday(new Date()); initCalendar(); });

// СТАТИСТИКА
btnStats.addEventListener('click', showStats);
btnStatsClose.addEventListener('click', () => { document.getElementById('stats-modal').classList.remove('active'); });

// ПОИСК ОКОШЕК
btnFindSlots.addEventListener('click', () => {
  document.getElementById('slots-results').innerHTML = '';
  slotsModal.classList.add('active');
  actionControls.classList.remove('open'); // Закрываем меню на мобилке
});
btnSlotsCancel.addEventListener('click', () => { slotsModal.classList.remove('active'); });
btnSlotsSearch.addEventListener('click', findFreeSlots);

// ЭКСПОРТ В PNG (СКРИНШОТ С ПОДДЕРЖКОЙ МОБИЛЬНОГО "ПОДЕЛИТЬСЯ")
document.getElementById('btn-export').addEventListener('click', async () => {
  actionControls.classList.remove('open'); 
  
  const btnExport = document.getElementById('btn-export');
  const originalText = btnExport.innerHTML;
  btnExport.innerHTML = '⏳ Создаю...';
  
  const calendar = document.querySelector('.calendar-wrapper');
  
  try {
    const canvas = await html2canvas(calendar, { scale: 2 });
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `Расписание_${formatDateToString(currentWeekMonday)}.png`, { type: 'image/png' });
      
      // 1. Проверяем, поддерживает ли телефон меню "Поделиться" (Telegram, WhatsApp и т.д.)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Моё расписание',
          });
          btnExport.innerHTML = '✅ Отправлено!';
        } catch (err) {
          btnExport.innerHTML = originalText; // Если пользователь закрыл меню Share
        }
      } 
      // 2. Если это ПК (нет меню Share) — кидаем в буфер обмена
      else {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          btnExport.innerHTML = '✅ В буфере!';
          btnExport.style.background = '#059669'; 
          btnExport.style.color = 'white';
        } 
        // 3. Страховка: если совсем ничего не сработало — просто качаем файл
        catch (err) {
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

// ЛОГИКА ГАЛОЧКИ ПОВТОРЕНИЯ УРОКА
document.getElementById('input-repeat').addEventListener('change', function () {
  document.getElementById('repeat-count-group').style.display = this.checked ? 'flex' : 'none';
});

// КОПИРОВАНИЕ ПРОШЛОЙ НЕДЕЛИ 
if (btnCopyWeek) {
  btnCopyWeek.addEventListener('click', async () => {
    actionControls.classList.remove('open'); // Закрываем меню
    const hasAccess = await requestPassword('Скопировать прошлую неделю');
    if (!hasAccess) return;

    const prevWeekMonday = addDays(currentWeekMonday, -7);
    const prevWeekSunday = addDays(currentWeekMonday, -1);
    const startStr = formatDateToString(prevWeekMonday);
    const endStr = formatDateToString(prevWeekSunday);

    const prevLessons = scheduleData.filter(e => e.date >= startStr && e.date <= endStr);

    if (prevLessons.length === 0) {
      alert('На прошлой неделе уроков не найдено!');
      return;
    }

    if (confirm(`Найдено уроков: ${prevLessons.length}. Скопировать на текущую неделю?`)) {
      btnCopyWeek.disabled = true;
      btnCopyWeek.textContent = 'Копирование...';

      try {
        for (const lesson of prevLessons) {
          const oldDate = new Date(lesson.date);
          const newDate = addDays(oldDate, 7);

          const clonedLesson = {
            date: formatDateToString(newDate),
            school: lesson.school,
            title: lesson.title,
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            desc: lesson.desc,
            price: lesson.price,
            status: lesson.status || 'Проведен',
            compensation: lesson.compensation || 0
          };

          await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clonedLesson)
          });
        }
        alert('✅ Расписание продублировано!');
        await fetchLessons();
      } catch (error) {
        alert('Произошла ошибка при копировании.');
      } finally {
        btnCopyWeek.disabled = false;
        btnCopyWeek.textContent = '📋 Скопировать прошлую неделю';
      }
    }
  });
}

// КЛИК НА "+ ДОБАВИТЬ УРОК"
btnAdd.addEventListener('click', async () => {
  actionControls.classList.remove('open'); // Закрываем меню
  const hasAccess = await requestPassword('Добавить урок');
  if (hasAccess) {
    editingLessonId = null;
    document.getElementById('modal-title').textContent = 'Новый урок';
    document.getElementById('input-title').value = '';
    document.getElementById('input-desc').value = '';
    document.getElementById('input-price').value = '';
    document.getElementById('input-comp').value = '';
    document.getElementById('input-status').value = 'Проведен';
    document.getElementById('input-start').value = '09:00';
    document.getElementById('input-end').value = '10:00';
    document.getElementById('input-date').value = formatDateToString(currentWeekMonday);

    // Сбрасываем и показываем блок повторений
    document.getElementById('input-repeat').checked = false;
    document.getElementById('repeat-count-group').style.display = 'none';
    document.getElementById('repeat-block').style.display = 'flex';

    modal.classList.add('active');
    setTimeout(() => document.getElementById('input-title').focus(), 100);
  }
});

btnCancel.addEventListener('click', () => { modal.classList.remove('active'); editingLessonId = null; });

// КНОПКА СОХРАНИТЬ (С ПОДДЕРЖКОЙ ГЕНЕРАЦИИ НЕСКОЛЬКИХ УРОКОВ)
btnSave.addEventListener('click', async () => {
  const dateValue = document.getElementById('input-date').value;
  const school = document.getElementById('input-school').value;
  const title = document.getElementById('input-title').value || 'Без названия';
  const startTime = document.getElementById('input-start').value;
  const endTime = document.getElementById('input-end').value;
  const desc = document.getElementById('input-desc').value;
  const price = document.getElementById('input-price').value || 0;
  const status = document.getElementById('input-status').value;
  const compensation = document.getElementById('input-comp').value || 0;

  const isRepeat = document.getElementById('input-repeat').checked;
  // Повторять можно только при создании нового урока
  const repeatCount = (isRepeat && editingLessonId === null) ? parseInt(document.getElementById('input-repeat-count').value) : 1;

  if (!dateValue) { alert('Пожалуйста, выберите дату урока!'); return; }
  if (startTime >= endTime) { alert('Время окончания должно быть позже времени начала!'); return; }

  // Правильный парсинг даты, чтобы избежать смещений часовых поясов
  const [yyyy, mm, dd] = dateValue.split('-');
  const baseDateObj = new Date(yyyy, mm - 1, dd);

  let datesToSave = [];

  // Предварительная проверка на накладки для ВСЕХ недель
  for (let i = 0; i < repeatCount; i++) {
    const curDateObj = addDays(baseDateObj, i * 7);
    const curDateStr = formatDateToString(curDateObj);
    datesToSave.push(curDateStr);

    if (checkCollision(curDateStr, startTime, endTime, editingLessonId)) {
      alert(`❌ Накладка по времени! В день ${curDateStr} уже запланирован другой урок. Отмена сохранения.`);
      return;
    }
  }

  btnSave.disabled = true;
  btnSave.textContent = 'Сохранение...';

  if (editingLessonId !== null) {
    // Обновляем один урок
    const payload = { date: dateValue, school, title, startTime, endTime, desc, price, status, compensation };
    await updateLessonInAPI(editingLessonId, payload);
    btnSave.disabled = false; btnSave.textContent = 'Сохранить'; btnCancel.click();
  } else {
    // Сохраняем один или несколько уроков
    for (const dStr of datesToSave) {
      const payload = { date: dStr, school, title, startTime, endTime, desc, price, status, compensation };
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    await fetchLessons(); // Перезагружаем всю таблицу после цикла
    btnSave.disabled = false; btnSave.textContent = 'Сохранить'; btnCancel.click();
  }
});

window.deleteEvent = async function (id, e) {
  e.stopPropagation();
  const hasAccess = await requestPassword('Удалить урок');
  if (hasAccess) { deleteLessonFromAPI(id); }
};

document.addEventListener('DOMContentLoaded', fetchLessons);