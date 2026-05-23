// ==========================================
// НАСТРОЙКИ СЕРВЕРА И БЕЗОПАСНОСТИ
// ==========================================
const API_URL = 'https://6a113ca53e35d0f37ee3157f.mockapi.io/lessons'; 
const ADMIN_HASH = 'c2Ftc3VuZzE5NzY='; // Пароль: samsung1976

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
  monday.setHours(0,0,0,0);
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

// ==========================================
// ПРОВЕРКА ПАРОЛЯ
// ==========================================
function requestPassword(actionTitle) {
  return new Promise((resolve) => {
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

async function addLessonToAPI(newEvent) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent)
    });
    if (response.ok) {
      const savedEvent = await response.json();
      scheduleData.push(savedEvent); 
      initCalendar();
    }
  } catch (error) {
    alert('Не удалось сохранить урок.');
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
      eventDiv.className = `event-card ${theme}`;
      eventDiv.style.top = `${topPx}px`;
      eventDiv.style.height = `${heightPx}px`;

      const schoolBadge = event.school ? `[${event.school}] ` : '';

      eventDiv.innerHTML = `
        <button class="delete-btn" onclick="deleteEvent('${event.id}', event)">&times;</button>
        <div class="event-time">${event.startTime} - ${event.endTime}</div>
        <div class="event-title">${schoolBadge}${event.title}</div>
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
          
          modal.classList.add('active');
        }
      });

      dayCol.appendChild(eventDiv);
    });

    daysGrid.appendChild(dayCol);
  });
}

// ==========================================
// СТАТИСТИКА
// ==========================================
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
      const price = Number(event.price) || 0;
      if (totals[school] !== undefined) {
        totals[school] += price;
        grandTotal += price;
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

// ==========================================
// УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ И КОПИРОВАНИЕМ НЕДЕЛЬ
// ==========================================
const modal = document.getElementById('modal');
const btnAdd = document.getElementById('btn-add');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('btn-save');
const btnStats = document.getElementById('btn-stats');
const btnStatsClose = document.getElementById('btn-stats-close');
const btnCopyWeek = document.getElementById('btn-copy-week');

// НАВИГАЦИЯ
document.getElementById('btn-prev').addEventListener('click', () => { currentWeekMonday = addDays(currentWeekMonday, -7); initCalendar(); });
document.getElementById('btn-next').addEventListener('click', () => { currentWeekMonday = addDays(currentWeekMonday, 7); initCalendar(); });
document.getElementById('btn-today').addEventListener('click', () => { currentWeekMonday = getMonday(new Date()); initCalendar(); });

btnStats.addEventListener('click', showStats);
btnStatsClose.addEventListener('click', () => { document.getElementById('stats-modal').classList.remove('active'); });

// ЛОГИКА КОПИРОВАНИЯ ПРОШЛОЙ НЕДЕЛИ НА ТЕКУЩУЮ
if (btnCopyWeek) {
  btnCopyWeek.addEventListener('click', async () => {
    const hasAccess = await requestPassword('Скопировать прошлую неделю');
    if (!hasAccess) return;

    // Считаем границы прошлой недели
    const prevWeekMonday = addDays(currentWeekMonday, -7);
    const prevWeekSunday = addDays(currentWeekMonday, -1);
    const startStr = formatDateToString(prevWeekMonday);
    const endStr = formatDateToString(prevWeekSunday);

    // Фильтруем уроки прошлой недели
    const prevLessons = scheduleData.filter(e => e.date >= startStr && e.date <= endStr);

    if (prevLessons.length === 0) {
      alert('На прошлой неделе уроков не найдено! Нечего копировать.');
      return;
    }

    if (confirm(`Найдено уроков: ${prevLessons.length}. Скопировать их как шаблон на текущую неделю?`)) {
      btnCopyWeek.disabled = true;
      btnCopyWeek.textContent = 'Копирование...';

      try {
        // Отправляем каждый урок пачкой через цикл POST-запросов
        for (const lesson of prevLessons) {
          const oldDate = new Date(lesson.date);
          const newDate = addDays(oldDate, 7); // Сдвигаем ровно на 7 дней вперед
          
          const clonedLesson = {
            date: formatDateToString(newDate),
            school: lesson.school,
            title: lesson.title,
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            desc: lesson.desc,
            price: lesson.price
          };

          await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clonedLesson)
          });
        }
        
        alert('✅ Расписание успешно продублировано! Творите правки.');
        await fetchLessons(); // Полностью перегружаем базу и перерисовываем
      } catch (error) {
        console.error(error);
        alert('Произошла ошибка при копировании данных.');
      } finally {
        btnCopyWeek.disabled = false;
        btnCopyWeek.textContent = '📋 Скопировать прошлую неделю';
      }
    }
  });
}

// ДОБАВЛЕНИЕ УРОКА
btnAdd.addEventListener('click', async () => {
  const hasAccess = await requestPassword('Добавить урок');
  if (hasAccess) {
    editingLessonId = null; 
    document.getElementById('modal-title').textContent = 'Новый урок';
    document.getElementById('input-title').value = '';
    document.getElementById('input-desc').value = '';
    document.getElementById('input-price').value = '';
    document.getElementById('input-start').value = '09:00';
    document.getElementById('input-end').value = '10:00';
    document.getElementById('input-date').value = formatDateToString(currentWeekMonday);

    modal.classList.add('active');
    setTimeout(() => document.getElementById('input-title').focus(), 100);
  }
});

btnCancel.addEventListener('click', () => { modal.classList.remove('active'); editingLessonId = null; });

btnSave.addEventListener('click', () => {
  const dateValue = document.getElementById('input-date').value;
  const school = document.getElementById('input-school').value;
  const title = document.getElementById('input-title').value || 'Без названия';
  const startTime = document.getElementById('input-start').value;
  const endTime = document.getElementById('input-end').value;
  const desc = document.getElementById('input-desc').value;
  const price = document.getElementById('input-price').value || 0;

  if (!dateValue) { alert('Пожалуйста, выберите дату урока!'); return; }
  if (startTime >= endTime) { alert('Время окончания должно быть позже времени начала!'); return; }

  btnSave.disabled = true;
  btnSave.textContent = 'Сохранение...';

  if (editingLessonId !== null) {
    const updatedEvent = { date: dateValue, school, title, startTime, endTime, desc, price };
    updateLessonInAPI(editingLessonId, updatedEvent).then(() => {
      btnSave.disabled = false; btnSave.textContent = 'Сохранить'; btnCancel.click();           
    });
  } else {
    const newEvent = { date: dateValue, school, title, startTime, endTime, desc, price };
    addLessonToAPI(newEvent).then(() => {
      btnSave.disabled = false; btnSave.textContent = 'Сохранить'; btnCancel.click();           
    });
  }
});

window.deleteEvent = async function(id, e) {
  e.stopPropagation(); 
  const hasAccess = await requestPassword('Удалить урок');
  if (hasAccess) { deleteLessonFromAPI(id); }
};

document.addEventListener('DOMContentLoaded', fetchLessons);


// setTimeout(async () => {
//   const MAP_URL = 'https://6a113ca53e35d0f37ee3157f.mockapi.io/lessons';
//   const dayToDateMap = {
//     'Пн': '2026-05-18', 'Вт': '2026-05-19', 'Ср': '2026-05-20',
//     'Чт': '2026-05-21', 'Пт': '2026-05-22', 'Сб': '2026-05-23', 'Вс': '2026-05-24'
//   };

//   try {
//     const response = await fetch(MAP_URL);
//     const lessons = await response.json();
//     for (const lesson of lessons) {
//       if (lesson.day && !lesson.date && dayToDateMap[lesson.day]) {
//         lesson.date = dayToDateMap[lesson.day];
//         await fetch(`${MAP_URL}/${lesson.id}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(lesson)
//         });
//         console.log(`Урок ${lesson.title} обновлен!`);
//       }
//     }
//     alert('✅ База данных успешно обновлена! Перезагрузи страницу.');
//   } catch (e) {
//     console.error('Ошибка обновления базы', e);
//   }
// }, 2000);