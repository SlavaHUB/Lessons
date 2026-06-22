let priceBook = {};
let statusBook = {};
let notesBook = {};
let overridePriceBook = {};
let customLessons = [];
let scheduleData = [];
let loadedStartStr = '';
let loadedEndStr = '';
let currentEditingLesson = null;
// ==========================================
// БАЗА ДАННЫХ, НАСТРОЙКИ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

const LESSONS_DATABASE = [
  { code: 'NTk02', name: 'Основы работы с компьютером' },
  { code: 'NTk04', name: 'Кибербезопасность и нейросети' },
  { code: 'NTk06', name: 'Информационная грамотность и фейки' },
  { code: 'NTk08', name: 'Подготовка к финальному уроку модуля' },
  { code: 'NTk10', name: 'Нейросети в образовании' },
  { code: 'NTk12', name: 'Использование нейросетей в математических предметах' },
  { code: 'NTk14', name: 'Использование нейросетей в гуманитарных предметах' },
  { code: 'NTk16', name: 'Использование нейросетей в естественно-научных предметах' },
  { code: 'NTk18', name: 'Подготовка к финальному уроку модуля' },

  { code: 'NTg02', name: 'Введение в графический дизайн' },
  { code: 'NTg04', name: 'Цветовая теория и композиция' },
  { code: 'NTg06', name: 'Типографика и шрифты' },
  { code: 'NTg08', name: 'Подготовка к финальному уроку модуля' },
  { code: 'NTg10', name: 'Введение в веб-разработку на зерокоде' },
  { code: 'NTg12', name: 'Сборка сайтов в Tilda и создание материалов в Perplexity' },
  { code: 'NTg14', name: 'Перенос дизайна из Figma в Tilda' },
  { code: 'NTg16', name: 'Доработка веб-сайта в Tilda' },
  { code: 'NTg18', name: 'Подготовка к финальному уроку модуля' },

  { code: 'NTd02', name: 'Что такое видеоигры и кто их придумывает' },
  { code: 'NTd04', name: 'Основы разработки игр' },
  { code: 'NTd06', name: 'Сюжет игры, эффекты, звук и озвучка' },
  { code: 'NTd08', name: 'Подготовка к финальному уроку модуля' },
  { code: 'NTd10', name: 'Первые шаги в Construct — от персонажа до событий' },
  { code: 'NTd12', name: 'Прокачиваем игру — переменные, счёт и волшебный ключ' },
  { code: 'NTd14', name: 'Дорабатываем игру — добавляем секрет, музыку и меню' },
  { code: 'NTd16', name: 'Подготовка к финальному уроку модуля' },

  { code: 'NTh02', name: 'Сценарист будущего — креативный штурм с DeepSeek и Perplexity' },
  { code: 'NTh04', name: 'AI-комикс — создание стильного комикса в Leonardo' },
  { code: 'NTh06', name: 'Режиссёр анимации — оживляем миры' },
  { code: 'NTh08', name: 'Режиссёр анимации — монтаж' },
  { code: 'NTh10', name: 'Живые открытки и AR — магия подарков' },
  { code: 'NTh12', name: 'Саунд-дизайнер — генерация хита в Suno и Udio' },
  { code: 'NTh14', name: 'Junior developer — создаём игру «Змейка» или «Кликер» с Qwen' },
  { code: 'NTh16', name: 'Кодинг-челлендж — создаём Telegram-бота с помощью Copilot в GitHub Codespaces' },
  { code: 'NTh18', name: 'Нейросети для ведения блога' },
  { code: 'NTh20', name: 'Финальный проект — цифровое портфолио' }
];

const GUIDEBOOK_LINKS = {
  'NTk02': 'https://docs.google.com/presentation/d/13_hFRtR7-GAu3IkIDeRNOkU3b0DjFn8n/edit?usp=drive_link&ouid=115169301904572984275&rtpof=true&sd=true',
  'NTk04': 'https://docs.google.com/presentation/d/1LsYVrgxH4JpkiBGoxdFhxh3zAT2VmRsH/edit?usp=drive_link&ouid=115169301904572984275&rtpof=true&sd=true',
  'NTk06': 'https://docs.google.com/presentation/d/1bIw9yGV8NNDTkj4DeE3Qc_gv8uZ7ksqJ/edit?usp=drive_link&ouid=115169301904572984275&rtpof=true&sd=true',
  'NTk08': 'https://docs.google.com/presentation/d/1Yg_ShTqtY23U1iH0eqjau4t72XzZdBdI/edit?usp=drive_link&ouid=115169301904572984275&rtpof=true&sd=true',
  'NTk10': 'https://docs.google.com/presentation/d/1Gj5AyNo9QoRt1ginIDbC-LaV-tnEzo2tq4ACQgSTIFQ/edit?usp=drive_link',
  'NTk12': 'https://docs.google.com/presentation/d/1eDtPzUM3iPCSUmAzuEivbtXJqb9v7RYhMsfdZio4WaI/edit?usp=drive_link',
  'NTk14': 'https://docs.google.com/presentation/d/1DX-LwObgN4M6GIZm4HNrOkyIOKfsGbECG1zeIANVZ7o/edit?usp=drive_link',
  'NTk16': 'https://docs.google.com/presentation/d/1HLKrUZifYhhlAXeUfO7auYu6Pk0fVsWqAobIc8nVxkw/edit?usp=drive_link',
  'NTk18': 'https://drive.google.com/drive/folders/1nYuRITBslnL5J712_cuC9sJjIBbWaYyX?usp=drive_linkс',
  'NTg02': 'https://docs.google.com/presentation/d/1fDj-avW-bH359IBqNf0b2St49ORop2O0/edit?usp=drive_link&ouid=115169301904572984275&rtpof=true&sd=true',
  'NTg04': 'https://docs.google.com/presentation/d/1wCjiJ-0xmAszvqsn_IEYfeEShnlQ6e3H/edit?usp=drive_link&ouid=115169301904572984275&rtpof=true&sd=true',
  'NTg06': 'https://drive.google.com/drive/folders/1ufwxmNRaFIkz4yqx0ahc-mEpW5pBD6fL?usp=drive_link',
  'NTg08': 'https://drive.google.com/drive/folders/1hmLPElyK3sEE4fU1wez6TPr4yQphRuPN?usp=drive_link',
  'NTg10': 'https://drive.google.com/drive/folders/11kJtbKyabip746RMY1ev2vRFrAbLKh8e?usp=drive_link',
  'NTg12': 'https://drive.google.com/drive/folders/1lgsOBN_IDXLSoLnOxIBQrzUwF-ECJQCA?usp=drive_link',
  'NTg14': 'https://drive.google.com/drive/folders/1AsmaoTytLQuIFdB7fntHKsGSVgnEPZzv?usp=drive_link',
  'NTg16': 'https://drive.google.com/drive/folders/1PEpyKuL7uZO9gnRtx9zwcOc9rncd7STG?usp=drive_link',
  'NTg18': 'https://drive.google.com/drive/folders/1nFVm3QhycLFpErEg3hZpU9alQoNdtrnu?usp=drive_link',
  'NTd02': 'https://drive.google.com/drive/folders/1OVJk3xZDBogOTQkJOYMIGUJinwXEOBx7?usp=drive_link',
  'NTd04': 'https://drive.google.com/drive/folders/1nQilIG5LWxGwv7rUMUpWWUzAKfKihus2?usp=drive_link',
  'NTd06': 'https://drive.google.com/drive/folders/1rfcl6mfhL_uO3Qe783mfZVk3_IMmVxqv?usp=drive_link',
  'NTd08': 'https://drive.google.com/drive/folders/1a4aDOdjxqGG1WZ3sDybQCRsM2EsUVGdX?usp=drive_link',
  'NTd10': 'https://drive.google.com/drive/folders/1q3x3nBTHh49TQN8k1tHkEf05USA3_UyY?usp=drive_link',
  'NTd12': 'https://drive.google.com/drive/folders/1CbuDot92Bo8BBs2v1hBMTFuiF1XPKfe0?usp=drive_link',
  'NTd14': 'https://drive.google.com/drive/folders/11kde32FYMGn7BSL_ltdmj0pAb2_nZVp6?usp=drive_link',
  'NTd16': 'https://drive.google.com/drive/folders/15er9z7BFQmYr11yPGNPq3xsYVKw5Ybtf?usp=drive_link',
  'NTh02': 'https://docs.google.com/presentation/d/1Q2DqDpEBuPg45kPzw1OMiJ4AscBE77Cj/edit?usp=drive_link&ouid=115169301904572984275&rtpof=true&sd=true',
  'NTh04': 'https://docs.google.com/presentation/d/1IaqguObrarseo1u1w82PLrvfySW8-EYZ/edit?usp=drive_link&ouid=115169301904572984275&rtpof=true&sd=true',
  'NTh06': 'https://drive.google.com/drive/folders/17a-OgqW7nAbH6wnvHMroy0NeIZXo8FDe?usp=drive_link',
  'NTh08': 'https://docs.google.com/presentation/d/1J5w4OZjiXMkjp2l_z3XoILWpN9z22e3b/edit?usp=drive_link&ouid=115169301904572984275&rtpof=true&sd=true',
  'NTh10': 'https://drive.google.com/drive/folders/1EgRxT1EIilzlYv5rg7OCMXnZU1_W1NIU?usp=drive_link',
  'NTh12': 'https://drive.google.com/drive/folders/1akqAbEhPHs5O78oLeiWDwJU2AAEmpCff?usp=drive_link',
  'NTh14': 'https://docs.google.com/presentation/d/1TXnB1ceFuVq7VUZlqd6ZB2ofSKrwFp7m-2YE364cN-4/edit?usp=drive_link',
  'NTh16': 'https://drive.google.com/drive/folders/1C8mdEvGBXFQkyvV9YGmT5tghaj5jfplc?usp=drive_link',
  'NTh18': 'https://drive.google.com/drive/folders/1dtWAakTyzQu9xVW1vQiUZLS5RhJ-MwZd?usp=drive_link',
  'NTh20': 'https://drive.google.com/drive/folders/10Yje8wfhHqQ189H8cQV6dj93oI5P6iz9?usp=drive_link'
};

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

function escapeHtml(str) { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function cleanTrashCodes(str) {
  if (!str) return str;
  let cleaned = str.replace(/\s*-\s*N[TK][a-zA-Z]\d{2,}\b/ig, '');
  return cleaned.replace(/\s*-\s*-\s*/g, ' - ');
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Потерянная переменная
let currentWeekMonday = getMonday(new Date());

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
  if (school === 'Private') return 'theme-private';
  if (dayName === 'Вт' || dayName === 'Ср') return 'theme-red';
  switch (school) {
    case 'RTS': return 'theme-blue';
    case 'ITCompot': return 'theme-green';
    case 'Zerocoder': return 'theme-purple';
    default: return 'theme-blue';
  }
}

function getInstanceKey(event) {
  if (event.id) return `${event.date}_${event.id}`;
  return `${event.date}_${event.startTime}_${event.title}`;
}

function getOldDateKey(event) { return `${event.date}_${event.startTime}_${event.title}`; }

function getEventStatus(ev) {
  const instKey = getInstanceKey(ev);
  const oldKey = getOldDateKey(ev);
  return statusBook[instKey] || statusBook[oldKey] || (ev.isExcelCustom ? ev.excelStatus : 'done');
}

function getLessonKey(event, dayName) { return `${dayName || daysOfWeek[event.customDayIndex]}_${event.startTime}_${event.title}`; }

function getCurrentWeekDates() {
  const dates = [];
  for (let i = 0; i < 7; i++) dates.push(formatDateToString(addDays(currentWeekMonday, i)));
  return dates;
}

function getManualBaseId(lessonId) {
  const match = String(lessonId).match(/^(manual_\d+)(?:_\d{4}-\d{2}-\d{2})?$/);
  return match ? match[1] : lessonId;
}

function readStorageJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}

function readStorageString(key, fallback = '') {
  try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
}

function readStorageNumber(key, fallback = 0) {
  try {
    const value = parseInt(localStorage.getItem(key), 10);
    return Number.isNaN(value) ? fallback : value;
  } catch (e) { return fallback; }
}

function getSchoolLabel(school) {
  if (school === 'ITCompot') return 'ITC';
  if (school === 'Zerocoder') return 'Zero';
  if (school === 'Private') return 'Персональные уроки';
  return school;
}

function expandManualLessons(loadedCustom, reqStartD, reqEndD) {
  const manualLessons = [];
  loadedCustom.forEach(custom => {
    if (!custom.isManual) return;
    const template = { ...custom, title: cleanTrashCodes(custom.title), isManual: true };
    if (custom.isRecurring) {
      let currDate = new Date(custom.date + 'T12:00:00');
      while (currDate <= reqEndD) {
        if (currDate >= reqStartD) {
          const dateStr = formatDateToString(currDate);
          manualLessons.push({
            ...template,
            date: dateStr,
            id: `${custom.id}_${dateStr}`,
            customDayIndex: getCustomDayIndex(dateStr)
          });
        }
        currDate = addDays(currDate, 7);
      }
    } else {
      const lessonDate = new Date(custom.date + 'T12:00:00');
      if (lessonDate >= reqStartD && lessonDate <= reqEndD) {
        manualLessons.push({ ...template, customDayIndex: getCustomDayIndex(custom.date) });
      }
    }
  });
  const deletedSingles = readStorageJSON('deletedManualSingles', []);
  return manualLessons.filter(lesson => !deletedSingles.includes(lesson.id));
}

function mergeScheduleData(crmEvents, startStr, endStr) {
  const loadedCustom = readStorageJSON('customLessons', customLessons);
  const reqStartD = new Date(startStr + 'T00:00:00');
  const reqEndD = new Date(endStr + 'T23:59:59');
  const pureCrm = crmEvents.filter(e => !e.isManual && !e.isExcelCustom);
  return [...pureCrm, ...expandManualLessons(loadedCustom, reqStartD, reqEndD)];
}

function applyScheduleMerge(startStr, endStr) {
  const crmEvents = scheduleData.filter(e => !e.isManual);
  scheduleData = mergeScheduleData(crmEvents, startStr, endStr);
  scheduleData.forEach(e => { if (e.customDayIndex === undefined) e.customDayIndex = getCustomDayIndex(e.date); });
  localStorage.setItem('cachedSchedule', JSON.stringify(scheduleData));
}

function normalize24HourTime(value) {
  const match = String(value || '').trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (!match) return '';
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return '';
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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

function cleanOldCacheData() {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 4);
  const cutoffStr = formatDateToString(cutoffDate);

  let cleaned = false;
  for (const key in statusBook) {
    const datePart = key.split('_')[0];
    if (datePart && datePart < cutoffStr) {
      delete statusBook[key];
      delete overridePriceBook[key];
      cleaned = true;
    }
  }

  const initLen = customLessons.length;
  customLessons = customLessons.filter(c => c.isRecurring || c.date >= cutoffStr);

  if (cleaned || customLessons.length !== initLen) {
    localStorage.setItem('lessonStatuses', JSON.stringify(statusBook));
    localStorage.setItem('lessonOverrides', JSON.stringify(overridePriceBook));
    localStorage.setItem('customLessons', JSON.stringify(customLessons));
    console.log('🧹 Старый кэш очищен');
  }
}

function getEffectivePrice(event, dayName) {
  if (event.isExcelCustom && event.excelPrice !== undefined) {
    const status = getEventStatus(event);
    if (status === 'canceled') return 0;
    return event.excelPrice;
  }

  const instKey = getInstanceKey(event);
  const oldKey = getOldDateKey(event);
  const lessonKey = getLessonKey(event, dayName);
  const status = getEventStatus(event);

  if (status === 'canceled') return 0;

  if (overridePriceBook[instKey] !== undefined) return overridePriceBook[instKey];
  if (overridePriceBook[oldKey] !== undefined) return overridePriceBook[oldKey];

  let basePrice = parseFloat(priceBook[lessonKey]);
  const duration = timeToMins(event.endTime) - timeToMins(event.startTime);
  if (isNaN(basePrice)) basePrice = getStandardPrice(event.school, duration);

  if (status === 'noshow') {
    if (event.school === 'Zerocoder' && duration === 45) return 135;
    if (event.school === 'Zerocoder' && duration === 30) return 90;
  }
  return basePrice;
}