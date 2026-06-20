// ==========================================
// БАЗА МЕТОДИЧЕК КУРСА (СЮДА ВСТАВЛЯЙ ССЫЛКИ С GOOGLE ДИСКА)
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
  'NTh20': 'https://drive.google.com/drive/folders/10Yje8wfhHqQ189H8cQV6dj93oI5P6iz9?usp=drive_link',
};

// ==========================================
// НАСТРОЙКИ СЕРВЕРА И ТЕМЫ
// ==========================================
const API_URL = 'https://lessons-mqy0.onrender.com/api/schedule';
const DB_API_URL = 'https://lessons-mqy0.onrender.com/api/data';
const CLOUD_SYNC_QUEUE_KEY = 'cloudSyncQueue';
let currentWeekMonday = getMonday(new Date());
let cloudRevision = '';
let cloudUpdatedAt = '';
let isFlushingCloudQueue = false;

try {
  cloudRevision = localStorage.getItem('cloudRevision') || '';
  cloudUpdatedAt = localStorage.getItem('cloudUpdatedAt') || '';
} catch (e) {
  console.warn('Не удалось прочитать метаданные облачной синхронизации.', e);
}

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
function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
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
  if (school === 'Private') return 'theme-private';
  if (dayName === 'Вт' || dayName === 'Ср') return 'theme-red';
  switch (school) {
    case 'RTS': return 'theme-blue';
    case 'ITCompot': return 'theme-green';
    case 'Zerocoder': return 'theme-purple';
    default: return 'theme-blue';
  }
}

// НОВЫЕ ФУНКЦИИ ДЛЯ НАДЕЖНЫХ КЛЮЧЕЙ СТАТУСОВ
function getInstanceKey(event) {
  if (event.id) return `${event.date}_${event.id}`;
  return `${event.date}_${event.startTime}_${event.title}`; // Запасной для старых ручных
}
function getOldDateKey(event) {
  return `${event.date}_${event.startTime}_${event.title}`;
}
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
  } catch (e) {
    console.warn(`Не удалось прочитать ${key} из localStorage.`, e);
    return fallback;
  }
}
function readStorageString(key, fallback = '') {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (e) {
    console.warn(`Не удалось прочитать ${key} из localStorage.`, e);
    return fallback;
  }
}
function readStorageNumber(key, fallback = 0) {
  try {
    const value = parseInt(localStorage.getItem(key), 10);
    return Number.isNaN(value) ? fallback : value;
  } catch (e) {
    console.warn(`Не удалось прочитать ${key} из localStorage.`, e);
    return fallback;
  }
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

// ==========================================
// БАЗА ДАННЫХ И СИНХРОНИЗАЦИЯ С ОБЛАКОМ
// ==========================================
let priceBook = {};
let statusBook = {};
let notesBook = {};
let overridePriceBook = {};
let customLessons = [];

let scheduleData = readStorageJSON('cachedSchedule', []);
scheduleData.forEach(e => {
  if (!e || !e.date) return;
  e.customDayIndex = getCustomDayIndex(e.date);
  e.title = cleanTrashCodes(e.title);
});

let loadedStartStr = readStorageString('loadedStartStr');
let loadedEndStr = readStorageString('loadedEndStr');
let isFetching = false;
let currentEditingLesson = null;
let parsedExcelLessons = [];
let reconciliationResult = null;

document.documentElement.setAttribute('data-theme', 'dark');

function fetchWithClientTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeout));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getPendingCloudQueue() {
  return readStorageJSON(CLOUD_SYNC_QUEUE_KEY, []);
}

function persistPendingCloudQueue(queue) {
  try {
    localStorage.setItem(CLOUD_SYNC_QUEUE_KEY, JSON.stringify(Array.isArray(queue) ? queue : []));
  } catch (e) {
    console.warn('Не удалось сохранить очередь синхронизации.', e);
    setSyncStatus('Offline: ошибка сохранения', 'error');
  }
}

function setSyncStatus(text, type = 'info') {
  const el = document.getElementById('sync-status');
  if (!el) return;

  el.textContent = text;
  el.dataset.type = type;
  el.className = `sync-status ${type}`;
}

function getCloudPayload() {
  return {
    priceBook,
    statusBook,
    notesBook,
    overridePriceBook,
    customLessons,
    clientRevision: cloudRevision,
    clientUpdatedAt: cloudUpdatedAt
  };
}

async function flushCloudQueue() {
  if (isFlushingCloudQueue) return;

  isFlushingCloudQueue = true;
  let retryCount = 3;

  try {
    while (true) {
      const queue = getPendingCloudQueue();

      if (queue.length === 0) {
        const checkTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        setSyncStatus(`Online: ${checkTime}`, 'ok');
        break;
      }

      if (!navigator.onLine) {
        const checkTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        setSyncStatus(`Offline: ${checkTime}`, 'warn');
        break;
      }

      const [currentOp, ...restQueue] = queue;

      try {
        setSyncStatus('Синхронизация...', 'info');

        const res = await fetchWithClientTimeout(DB_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // БЕРЕМ СВЕЖИЕ ДАННЫЕ ВМЕСТО СТАРЫХ ИЗ ОЧЕРЕДИ
          body: JSON.stringify(getCloudPayload())
        }, 12000);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const saved = await res.json();

        if (saved.revision !== undefined) {
          cloudRevision = String(saved.revision);
          localStorage.setItem('cloudRevision', cloudRevision);
        }

        if (saved.updatedAt) {
          cloudUpdatedAt = saved.updatedAt;
          localStorage.setItem('cloudUpdatedAt', cloudUpdatedAt);
        }

        persistPendingCloudQueue(restQueue);
        retryCount = 3;
      } catch (error) {
        persistPendingCloudQueue(queue);

        if (retryCount <= 0) {
          const checkTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          setSyncStatus(`Offline: ${checkTime}`, 'error');
          break;
        }

        retryCount -= 1;
        await delay(1000 * (4 - retryCount));
      }
    }
  } finally {
    isFlushingCloudQueue = false;
  }
}

async function loadCloudData() {
  try {
    const res = await fetchWithClientTimeout(DB_API_URL, {}, 8000);

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      const reason = `${res.status} ${res.statusText || ''}${errorText ? ` — ${errorText.slice(0, 160)}` : ''}`.trim();
      console.warn(`⚠️ Оффлайн режим. Работаем по локальным данным. БД недоступна: ${reason}`);
      return false;
    }

    const data = await res.json();

    if (data?.revision !== undefined) {
      cloudRevision = String(data.revision);
      localStorage.setItem('cloudRevision', cloudRevision);
    }

    if (data?.updatedAt) {
      cloudUpdatedAt = data.updatedAt;
      localStorage.setItem('cloudUpdatedAt', cloudUpdatedAt);
    }

    const pendingQueue = getPendingCloudQueue();
    const hasCloudData = data && (
      Object.keys(data.priceBook || {}).length > 0 ||
      Object.keys(data.statusBook || {}).length > 0 ||
      Object.keys(data.notesBook || {}).length > 0 ||
      Object.keys(data.overridePriceBook || {}).length > 0 ||
      Array.isArray(data.customLessons) && data.customLessons.length > 0
    );

    if (hasCloudData) {
      if (pendingQueue.length > 0) {
        priceBook = { ...(data.priceBook || {}), ...priceBook };
        statusBook = { ...(data.statusBook || {}), ...statusBook };
        notesBook = { ...(data.notesBook || {}), ...notesBook };
        overridePriceBook = { ...(data.overridePriceBook || {}), ...overridePriceBook };
        customLessons = customLessons.length > 0 ? customLessons : (data.customLessons || []);

        localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));
        localStorage.setItem('lessonStatuses', JSON.stringify(statusBook));
        localStorage.setItem('lessonNotes', JSON.stringify(notesBook));
        localStorage.setItem('lessonOverrides', JSON.stringify(overridePriceBook));
        localStorage.setItem('customLessons', JSON.stringify(customLessons));
      } else {
        priceBook = data.priceBook || {};
        statusBook = data.statusBook || {};
        notesBook = data.notesBook || {};
        overridePriceBook = data.overridePriceBook || {};
        customLessons = data.customLessons || [];

        localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));
        localStorage.setItem('lessonStatuses', JSON.stringify(statusBook));
        localStorage.setItem('lessonNotes', JSON.stringify(notesBook));
        localStorage.setItem('lessonOverrides', JSON.stringify(overridePriceBook));
        localStorage.setItem('customLessons', JSON.stringify(customLessons));
      }
    } else {
      const localPrices = readStorageJSON('lessonPrices_v2', {});

      if (Object.keys(localPrices).length > 0) {
        priceBook = localPrices;
        statusBook = readStorageJSON('lessonStatuses', {});
        notesBook = readStorageJSON('lessonNotes', {});
        overridePriceBook = readStorageJSON('lessonOverrides', {});
        customLessons = readStorageJSON('customLessons', []);
        await saveToCloud();
      } else {
        setSyncStatus('Online: пусто', 'warn');
      }
    }

    return true;
  } catch (e) {
    const reason = e?.name === 'AbortError' ? 'тайм-аут подключения' : (e?.message || 'ошибка сети');
    console.warn(`⚠️ Оффлайн режим. Работаем по локальным данным. Причина: ${reason}`);
    priceBook = readStorageJSON('lessonPrices_v2', {});
    statusBook = readStorageJSON('lessonStatuses', {});
    notesBook = readStorageJSON('lessonNotes', {});
    overridePriceBook = readStorageJSON('lessonOverrides', {});
    customLessons = readStorageJSON('customLessons', []);
    
    const checkTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    setSyncStatus(`Offline: ${checkTime}`, 'warn');
    return false;
  }
}

async function saveToCloud() {
  const queue = getPendingCloudQueue();

  queue.push({
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    // Убрали сохранение старого состояния (payload), чтобы в облако всегда летели свежие данные
    createdAt: new Date().toISOString()
  });

  persistPendingCloudQueue(queue);
  const checkTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  setSyncStatus(`Offline: ${checkTime}`, 'warn');

  await flushCloudQueue();
  return getPendingCloudQueue().length === 0;
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

  if (hasCacheForThisWeek && !forceSync) {
    applyScheduleMerge(loadedStartStr, loadedEndStr);
    initCalendar();
    calcSalary();
    return;
  }
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

      scheduleData = mergeScheduleData(validEvents, startStr, endStr);
      localStorage.setItem('cachedSchedule', JSON.stringify(scheduleData));
      localStorage.setItem('loadedStartStr', startStr);
      localStorage.setItem('loadedEndStr', endStr);
      localStorage.setItem('lastSyncTime', Date.now().toString());
      loadedStartStr = startStr; loadedEndStr = endStr;
      initCalendar();
    }
  } catch (error) {
    if (loadedStartStr && loadedEndStr) applyScheduleMerge(loadedStartStr, loadedEndStr);
    else if (scheduleData.length > 0) initCalendar();
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
  const isManual = !!event.isManual;

  document.getElementById('lm-school').textContent = isManual ? getSchoolLabel(event.school) : (event.school || 'Неизвестно');
  const [, month, day] = event.date.split('-');
  document.getElementById('lm-time').textContent = `${day}.${month} | ${event.startTime} - ${event.endTime}`;
  document.getElementById('lm-name').textContent = event.title;

  const enterBtn = document.getElementById('btn-lm-enter-class');
  const crmBtn = document.getElementById('btn-lm-crm');
  const manualZone = document.getElementById('lm-manual-zone');
  enterBtn.style.display = isManual ? 'none' : 'block';
  crmBtn.style.display = isManual ? 'none' : 'block';
  manualZone.style.display = isManual ? 'block' : 'none';

  if (!isManual) {
    enterBtn.onclick = () => {
      if (event.school === 'ITCompot') window.open('https://us02web.zoom.us/j/9514811985', '_blank');
      else window.open('https://matrius.ktalk.ru/hpb5rfegc1tl', '_blank');
    };
  }

  const topicText = event.topic ? event.topic.replace(/\r\n|\n/g, ' - ') : '';
  let topicDisplayZone = document.getElementById('lm-topic-display');
  if (!topicDisplayZone) {
    topicDisplayZone = document.createElement('div');
    topicDisplayZone.id = 'lm-topic-display';
    document.getElementById('lm-name').parentNode.after(topicDisplayZone);
  }
  
  if (topicText) {
    topicDisplayZone.innerHTML = `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dotted rgba(255,255,255,0.1); font-size: 0.85rem;"><strong>Тема:</strong> <span style="color: #fbbf24;">${escapeHtml(topicText)}</span></div>`;
  } else {
    topicDisplayZone.innerHTML = '';
  }

  const codeMatch = (event.topic || '').match(/NT[kgdh]\d{2}/i) || event.title.match(/NT[kgdh]\d{2}/i);
  let currentCode = null;
  if (codeMatch) {
    const raw = codeMatch[0];
    currentCode = raw.substring(0, 2).toUpperCase() + raw.substring(2, 3).toLowerCase() + raw.substring(3);
  }

  let guideZone = document.getElementById('lm-guide-zone');
  if (!guideZone) {
    guideZone = document.createElement('div');
    guideZone.id = 'lm-guide-zone';
    guideZone.style = 'margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border-color); display: flex; flex-direction: column; gap: 8px;';
    enterBtn.after(guideZone);
  }

  let optionsHtml = `<option value="">-- Выбрать другую методичку --</option>`;
  LESSONS_DATABASE.forEach(l => {
    const star = GUIDEBOOK_LINKS[l.code] ? '⚡ ' : '❌ ';
    optionsHtml += `<option value="${l.code}" ${l.code === currentCode ? 'selected' : ''}>${star}${l.code} - ${l.name}</option>`;
  });

  const primaryLink = currentCode ? (GUIDEBOOK_LINKS[currentCode] || '#') : '#';
  const primaryDisabled = primaryLink === '#' ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';
  const btnLabel = currentCode ? `📘 Открыть методичку (${currentCode})` : `📘 Методичка не найдена`;

  guideZone.innerHTML = `
    <button id="btn-lm-primary-guide" class="btn-primary" style="width: 100%; background: var(--theme-green-bg); color: var(--text-main); border: 1px solid var(--theme-green-border); font-weight: bold;" ${primaryDisabled}>${btnLabel}</button>
    <select id="lm-guide-select" style="padding: 8px 10px; font-size: 0.85rem; border-radius: 6px; background: var(--input-bg); color: var(--text-main); border: 1px solid var(--border-color);">${optionsHtml}</select>
  `;

  document.getElementById('btn-lm-primary-guide').onclick = () => {
    if (primaryLink !== '#') window.open(primaryLink, '_blank');
  };

  document.getElementById('lm-guide-select').onchange = (e) => {
    const selected = e.target.value;
    if (selected && GUIDEBOOK_LINKS[selected]) {
      window.open(GUIDEBOOK_LINKS[selected], '_blank');
      e.target.value = currentCode || "";
    } else if (selected) {
      alert('Ссылка для этой методички еще не добавлена в код!');
      e.target.value = currentCode || "";
    }
  };

  const instKey = getInstanceKey(event);
  const oldKey = getOldDateKey(event);
  const lessonKey = getLessonKey(event, dayName);

  let currentStatus = getEventStatus(event);
  let currentNote = notesBook[lessonKey];
  if (!currentNote) {
    currentNote = isManual
      ? `${event.title}\nПерсональный урок`
      : `${event.title}\nАлсу @Alsushenka1985 - Елена @ElenaLCastellano\n\nНе на уроке.`;
  }

  const duration = timeToMins(event.endTime) - timeToMins(event.startTime);
  const isPerStudent = !isManual && (event.school === 'ITCompot' && duration >= 90 && !event.isExcelCustom);
  currentEditingLesson.isPerStudent = isPerStudent;

  const computePrice = (status) => {
    if (status === 'canceled') return 0;
    if (overridePriceBook[instKey] !== undefined && status === currentStatus) return overridePriceBook[instKey];
    if (overridePriceBook[oldKey] !== undefined && status === currentStatus) return overridePriceBook[oldKey];
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
      e.currentTarget.classList.add('active');
      currentStatus = e.currentTarget.dataset.status;
      currentPrice = computePrice(currentStatus);
      renderPriceInput(currentPrice);
    };
  });

  document.getElementById('lesson-modal').classList.add('active');
}

async function deleteManualLesson(event) {
  const baseId = getManualBaseId(event.id);
  const customList = readStorageJSON('customLessons', []);
  const template = customList.find(c => c.id === baseId);
  const isRecurringSeries = template?.isRecurring;

  if (isRecurringSeries) {
    const deleteAll = confirm(
      'Этот урок входит в серию повторений.\n\n' +
      'OK — удалить ВСЮ серию повторений.\n' +
      'Отмена — удалить только этот урок.'
    );
    if (deleteAll) {
      const updated = customList.filter(c => c.id !== baseId);
      localStorage.setItem('customLessons', JSON.stringify(updated));
      customLessons = updated;
      const deletedSingles = (readStorageJSON('deletedManualSingles', [])).filter(id => !id.startsWith(baseId + '_'));
      localStorage.setItem('deletedManualSingles', JSON.stringify(deletedSingles));
    } else {
      const deletedSingles = readStorageJSON('deletedManualSingles', []);
      if (!deletedSingles.includes(event.id)) deletedSingles.push(event.id);
      localStorage.setItem('deletedManualSingles', JSON.stringify(deletedSingles));
    }
  } else {
    if (!confirm('Удалить этот урок полностью?')) return;
    const updated = customList.filter(c => c.id !== baseId);
    localStorage.setItem('customLessons', JSON.stringify(updated));
    customLessons = updated;
  }

  await saveToCloud();
  document.getElementById('lesson-modal').classList.remove('active');
  currentEditingLesson = null;

  if (loadedStartStr && loadedEndStr) applyScheduleMerge(loadedStartStr, loadedEndStr);
  else scheduleData = scheduleData.filter(e => e.id !== event.id && !e.id.startsWith(baseId + '_'));

  initCalendar();
  calcSalary();
}

document.getElementById('btn-lm-save').addEventListener('click', async () => {
  if (!currentEditingLesson) return;
  const inputVal = parseFloat(document.getElementById('lm-input-price').value) || 0;
  const finalPrice = currentEditingLesson.isPerStudent ? inputVal * ITCOMPOT_RATE : inputVal;

  const { event, dayName } = currentEditingLesson;
  const instKey = getInstanceKey(event);
  const oldKey = getOldDateKey(event);
  const lessonKey = getLessonKey(event, dayName);
  const newStatus = document.querySelector('.status-btn.active').dataset.status;

  // Жестко перезаписываем статус по уникальному ID
  statusBook[instKey] = newStatus;
  delete statusBook[oldKey]; // Вычищаем старый формат

  notesBook[lessonKey] = document.getElementById('lm-notes').value;

  if (newStatus === 'done' || event.isExcelCustom) {
    priceBook[lessonKey] = finalPrice;
    delete overridePriceBook[instKey];
    delete overridePriceBook[oldKey];
  } else {
    overridePriceBook[instKey] = finalPrice;
    delete overridePriceBook[oldKey];
  }

  localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));
  localStorage.setItem('lessonStatuses', JSON.stringify(statusBook));
  localStorage.setItem('lessonNotes', JSON.stringify(notesBook));
  localStorage.setItem('lessonOverrides', JSON.stringify(overridePriceBook));

  await saveToCloud();

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
    const allFutureEvents = scheduleData.filter(e => e.customDayIndex === index && e.date > columnDateStr && !e.isExcelCustom && !e.isManual);
    const realEventKeys = new Set(realEvents.map(e => `${e.startTime}_${e.title}`));

    const phantomMap = new Map();
    allFutureEvents.forEach(fe => {
      const instKey = getInstanceKey(fe);
      const oldKey = getOldDateKey(fe);
      if (statusBook[instKey] === 'canceled' || statusBook[oldKey] === 'canceled') return;
      const key = `${fe.startTime}_${fe.title}`;
      if (!realEventKeys.has(key) && !phantomMap.has(key)) {
        phantomMap.set(key, { ...fe, isPhantom: true });
      }
    });

    const allEventsToDraw = [...realEvents, ...Array.from(phantomMap.values())];

    allEventsToDraw.forEach(event => {
      const topPx = timeToPixels(event.startTime);
      const heightPx = Math.max(timeToPixels(event.endTime) - topPx, (45 / 60) * HOUR_HEIGHT);
      const eventDiv = document.createElement('div');

      const lessonKey = getLessonKey(event, dayName);
      eventDiv.className = `event-card ${getTheme(event.school, dayName)}`;
      if (event.isManual) eventDiv.classList.add('manual-event');

      let priceHtml = ''; let pinHtml = ''; let titlePrefix = '';

      if (event.isPhantom) {
        eventDiv.classList.add('phantom-event');
        const [, m, d] = event.date.split('-');
        pinHtml = `<div class="event-note-pin" title="Будущий урок (${d}.${m})">👻</div>`;
        titlePrefix = `[${d}.${m}] `;
        eventDiv.addEventListener('click', () => alert(`👻 Это фантомный урок!\n\nШкола: ${event.school}\nУченик: ${event.title}\nОн запланирован на ${d}.${m}`));
      } else {
        const status = getEventStatus(event);
        if (status === 'canceled') eventDiv.classList.add('status-canceled');
        if (status === 'noshow') eventDiv.classList.add('status-noshow');
        if (status === 'late') eventDiv.classList.add('status-late');

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
// СТАТИСТИКА, EXCEL-ПАРСИНГ И СВЕРКА
// ==========================================
const EXCEL_JUNK_PATTERNS = /^(итог|премия|byn|итоговый|долг|выплат|вторая школа|урок\/группа|дата|сложение|чисто за)/i;
const ITC_TITLE_PATTERNS = /группа|индив|шоу/i;

const EXCEL_TITLE_ALIASES = {
  "нейротин": "NIN-562"
};

function getCurrentMonthBounds() {
  const now = new Date();
  return { year: now.getFullYear(), monthIndex: now.getMonth() };
}

function isInCurrentMonth(dateStr) {
  const { year, monthIndex } = getCurrentMonthBounds();
  const [y, m] = dateStr.split('-').map(Number);
  return y === year && (m - 1) === monthIndex;
}

function normalizeMatchTitle(str) {
  if (!str) return '';
  return cleanTrashCodes(String(str))
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*-\s*$/, '');
}

function expandTitleAliases(str) {
  const normalized = normalizeMatchTitle(str);
  if (!normalized) return normalized;
  const alias = EXCEL_TITLE_ALIASES[normalized];
  return alias ? `${normalized} ${normalizeMatchTitle(alias)}` : normalized;
}

function getMatchTokens(str) {
  return expandTitleAliases(str)
    .split(' ')
    .filter(token => token && token.length > 1);
}

function getTitlesMatchInfo(scheduleTitle, excelTitle) {
  const a = normalizeMatchTitle(scheduleTitle);
  const b = normalizeMatchTitle(excelTitle);

  if (!a || !b) return null;
  if (a === b) return { type: 'exact', label: 'точное совпадение' };
  if (a.includes(b) || b.includes(a)) return { type: 'fuzzy', label: 'совпадение по вхождению' };

  const scheduleTokens = getMatchTokens(scheduleTitle);
  const excelTokens = getMatchTokens(excelTitle);
  const commonTokens = scheduleTokens.filter(token => excelTokens.includes(token));

  if (commonTokens.length > 0) {
    const excelAlias = EXCEL_TITLE_ALIASES[normalizeMatchTitle(excelTitle)];
    const scheduleAlias = EXCEL_TITLE_ALIASES[normalizeMatchTitle(scheduleTitle)];
    const aliasTokens = [
      ...(excelAlias ? getMatchTokens(excelAlias) : []),
      ...(scheduleAlias ? getMatchTokens(scheduleAlias) : [])
    ];
    const matchedByAlias = commonTokens.some(token => aliasTokens.includes(token));

    return {
      type: matchedByAlias ? 'alias' : 'fuzzy',
      label: matchedByAlias ? `совпадение по alias: ${excelAlias || scheduleAlias}` : `совпадение по слову: ${commonTokens.join(', ')}`
    };
  }

  const ga = a.match(/группа\s*(?:из\s*)?(\d+)/);
  const gb = b.match(/группа\s*(?:из\s*)?(\d+)/);
  if (ga && gb && ga[1] === gb[1]) return { type: 'group', label: 'совпадение по группе' };

  return null;
}

function titlesMatch(scheduleTitle, excelTitle) {
  return !!getTitlesMatchInfo(scheduleTitle, excelTitle);
}

function inferSchoolFromExcelTitle(title) {
  return ITC_TITLE_PATTERNS.test(title) ? 'ITCompot' : 'Zerocoder';
}

function isJunkExcelRow(title) {
  if (!title || !String(title).trim()) return true;
  const t = String(title).trim().toLowerCase();
  if (EXCEL_JUNK_PATTERNS.test(t)) return true;
  if (t.includes('итог') || t.includes('премия') || t.includes('вторая школа')) return true;
  return false;
}

function parseExcelDateCell(cell, carryDate, curYear, curMonthIndex) {
  if (cell === null || cell === undefined || cell === '') return carryDate;
  const raw = String(cell).trim();
  if (!raw || raw.toLowerCase() === 'дата') return carryDate;

  if (!isNaN(raw) && Number(raw) > 40000) {
    try {
      const d = XLSX.SSF.parse_date_code(Number(raw));
      const candidate = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
      return isValidDateStr(candidate) ? candidate : carryDate;
    } catch (e) { /* fall through */ }
  }

  const fixed = raw.replace(/(\d{1,2})\.0+\.(\d{4})/, (_, day, year) =>
    `${day}.${String(curMonthIndex + 1).padStart(2, '0')}.${year}`
  );
  const dm = fixed.match(/(\d{1,2})[\.,\/](\d{1,2})(?:[\.,\/](\d{2,4}))?/);
  if (!dm) return carryDate;

  let day = dm[1].padStart(2, '0');
  let month = dm[2].padStart(2, '0');
  if (month === '00' || month === '0') month = String(curMonthIndex + 1).padStart(2, '0');
  let year = dm[3] ? (dm[3].length === 2 ? `20${dm[3]}` : dm[3]) : String(curYear);
  const candidate = `${year}-${month}-${day}`;
  return isValidDateStr(candidate) ? candidate : carryDate;
}

function isValidDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || m < 1 || m > 12 || d < 1) return false;
  return d <= new Date(y, m, 0).getDate();
}

function parseExcelPrice(col2, col3) {
  const tryNum = (v) => {
    if (v === null || v === undefined || v === '') return NaN;
    const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
    return (isNaN(n) || n <= 0 || n > 50000) ? NaN : n;
  };
  const p3 = tryNum(col3);
  if (!isNaN(p3)) return p3;
  const p2 = tryNum(col2);
  if (!isNaN(p2)) return p2;
  return 0;
}

function parseExcelStatus(col2) {
  const s = String(col2 ?? '').trim().toLowerCase();
  if (!s || !isNaN(parseFloat(s.replace(',', '.')))) return 'done';
  if (s.includes('комп') || s.includes('прогул')) return 'noshow';
  if (s.includes('отмен')) return 'canceled';
  if (s.includes('опоз')) return 'late';
  return 'done';
}

function getMonthScheduleEvents() {
  const { year, monthIndex } = getCurrentMonthBounds();
  return scheduleData.filter(ev => {
    if (ev.isPhantom) return false;
    const [y, m] = ev.date.split('-').map(Number);
    return y === year && (m - 1) === monthIndex;
  });
}

function computeStatsSnapshot(events) {
  const realTodayStr = formatDateToString(new Date());
  const { year, monthIndex } = getCurrentMonthBounds();
  const weekSet = new Set(getCurrentWeekDates());

  const snap = {
    todaySum: 0, weekSum: 0,
    monthItc: 0, monthZero: 0, monthPrivate: 0,
    counts: { done: 0, canceled: 0, noshow: 0, late: 0, future: 0, total: 0 }
  };

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const dayName = daysOfWeek[ev.customDayIndex];
    const status = getEventStatus(ev);
    const price = getEffectivePrice(ev, dayName);
    const [y, m] = ev.date.split('-').map(Number);
    const inMonth = y === year && (m - 1) === monthIndex;

    snap.counts.total++;
    if (ev.date > realTodayStr) snap.counts.future++;
    else if (status === 'canceled') snap.counts.canceled++;
    else if (status === 'noshow') snap.counts.noshow++;
    else if (status === 'late') snap.counts.late++;
    else snap.counts.done++;

    if (status === 'canceled') continue;

    if (weekSet.has(ev.date)) {
      snap.weekSum += price;
      if (ev.date === realTodayStr) snap.todaySum += price;
    }

    if (!inMonth) continue;
    if (ev.school === 'ITCompot') snap.monthItc += price;
    else if (ev.school === 'Zerocoder') snap.monthZero += price;
    else snap.monthPrivate += price;
  }

  snap.monthGrand = snap.monthItc + Math.round(snap.monthItc * 0.20) + snap.monthZero + snap.monthPrivate;
  return snap;
}

function processExcelData(workbook) {
  parsedExcelLessons = [];
  const { year: curYear, monthIndex: curMonthIndex } = getCurrentMonthBounds();
  const monthSheetName = monthsNominative[curMonthIndex];

  workbook.SheetNames.forEach(sheetName => {
    if (sheetName.toLowerCase().includes('долг')) return;
    if (sheetName !== monthSheetName && !sheetName.toLowerCase().includes(monthSheetName.toLowerCase())) return;

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });
    let currentDate = '';

    rows.forEach((cols, index) => {
      if (!cols || cols.length === 0) return;

      const col0 = cols[0];
      const col1 = cols[1] != null ? String(cols[1]).trim() : '';
      const col2 = cols[2];
      const col3 = cols[3];

      const parsedDate = parseExcelDateCell(col0, currentDate, curYear, curMonthIndex);
      if (parsedDate && parsedDate !== currentDate && isInCurrentMonth(parsedDate)) currentDate = parsedDate;

      if (!currentDate || !isInCurrentMonth(currentDate)) return;
      if (isJunkExcelRow(col1)) return;

      const price = parseExcelPrice(col2, col3);
      const status = parseExcelStatus(col2);
      if (price === 0 && status === 'done') return;

      parsedExcelLessons.push({
        tempId: `excel_${sheetName}_${index}`,
        rowIndex: index,
        date: currentDate,
        title: col1,
        school: inferSchoolFromExcelTitle(col1),
        status,
        price,
        note: (typeof col2 === 'string' && col2.trim() && isNaN(parseFloat(String(col2).replace(',', '.'))))
          ? col2.trim() : ''
      });
    });
  });

  if (parsedExcelLessons.length === 0) {
    alert(`В файле не найдено уроков за ${monthsNominative[curMonthIndex]} ${curYear}. Проверьте лист «${monthSheetName}».`);
    return;
  }

  parsedExcelLessons.sort((a, b) => a.date.localeCompare(b.date) || a.rowIndex - b.rowIndex);
  reconciliationResult = reconcileExcelWithSchedule(parsedExcelLessons, getMonthScheduleEvents());
  renderReconciliationModal(reconciliationResult);
}

function buildScheduleReconIndex(scheduleEvents) {
  const scheduleByDate = new Map();

  scheduleEvents.forEach(ev => {
    if (ev.isPhantom) return;
    if (!scheduleByDate.has(ev.date)) scheduleByDate.set(ev.date, []);
    scheduleByDate.get(ev.date).push(ev);
  });

  return scheduleByDate;
}

function buildExcelReconIndex(excelLessons) {
  const excelByDate = new Map();

  excelLessons.forEach((xl, index) => {
    if (!excelByDate.has(xl.date)) excelByDate.set(xl.date, []);
    excelByDate.get(xl.date).push({ lesson: xl, index });
  });

  return excelByDate;
}

function findExcelMatchForSchedule(ev, excelByDate, usedExcel) {
  const candidates = excelByDate.get(ev.date) || [];

  for (let i = 0; i < candidates.length; i++) {
    const { lesson, index } = candidates[i];
    if (usedExcel.has(index)) continue;
    if (titlesMatch(ev.title, lesson.title)) return { lesson, index };
  }

  return null;
}

function reconcileExcelWithSchedule(excelLessons, scheduleEvents) {
  const usedExcel = new Set();
  const result = { ok: [], missing_in_excel: [], missing_in_schedule: [], price_mismatch: [] };
  const sortedSchedule = [...scheduleEvents].sort((a, b) =>
    a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
  );
  const scheduleByDate = buildScheduleReconIndex(sortedSchedule);
  const excelByDate = buildExcelReconIndex(excelLessons);

  Array.from(scheduleByDate.entries()).forEach(([date, dayEvents]) => {
    dayEvents.forEach(ev => {
      const dayName = daysOfWeek[ev.customDayIndex];
      const schedulePrice = getEffectivePrice(ev, dayName);
      const scheduleStatus = getEventStatus(ev);
      const match = findExcelMatchForSchedule(ev, excelByDate, usedExcel);

      if (!match) {
        if (scheduleStatus !== 'canceled') {
          result.missing_in_excel.push({
            schedule: ev,
            schedulePrice,
            scheduleStatus,
            apply: false
          });
        }
        return;
      }

      usedExcel.add(match.index);
      const excel = match.lesson;
      const priceDiff = Math.abs(schedulePrice - excel.price) > 0.5;
      const statusDiff = scheduleStatus !== excel.status;
      const matchInfo = getTitlesMatchInfo(ev.title, excel.title);

      const item = {
        excel, schedule: ev,
        schedulePrice, excelPrice: excel.price,
        scheduleStatus, excelStatus: excel.status,
        match: matchInfo,
        apply: priceDiff || statusDiff
      };

      if (priceDiff) result.price_mismatch.push(item);
      else result.ok.push(item);
    });
  });

  excelLessons.forEach((xl, i) => {
    if (usedExcel.has(i)) return;
    result.missing_in_schedule.push({ excel: xl, apply: false });
  });

  return result;
}

function applyExcelToSchedule(excelLesson, scheduleEvent) {
  const dayName = daysOfWeek[scheduleEvent.customDayIndex];
  const lessonKey = getLessonKey(scheduleEvent, dayName);
  const instKey = getInstanceKey(scheduleEvent);
  const oldKey = getOldDateKey(scheduleEvent);

  statusBook[instKey] = excelLesson.status;
  delete statusBook[oldKey];

  if (excelLesson.note) notesBook[lessonKey] = excelLesson.note;

  if (excelLesson.status === 'done' || excelLesson.status === 'late') {
    priceBook[lessonKey] = excelLesson.price;
    delete overridePriceBook[instKey];
    delete overridePriceBook[oldKey];
  } else {
    overridePriceBook[instKey] = excelLesson.price;
    delete overridePriceBook[oldKey];
  }
}

function applyReconciliationFixes(recon) {
  let applied = 0;
  const applyItem = (item) => {
    if (!item.apply || !item.excel || !item.schedule) return;
    applyExcelToSchedule(item.excel, item.schedule);
    applied++;
  };

  recon.price_mismatch.forEach(applyItem);
  recon.ok.forEach(item => { if (item.apply) applyItem(item); });

  localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));
  localStorage.setItem('lessonStatuses', JSON.stringify(statusBook));
  localStorage.setItem('lessonNotes', JSON.stringify(notesBook));
  localStorage.setItem('lessonOverrides', JSON.stringify(overridePriceBook));
  return applied;
}

function formatShortDate(dateStr) {
  const [, mm, dd] = dateStr.split('-');
  return `${dd}.${mm}`;
}

function renderReconciliationModal(recon) {
  const { year, monthIndex } = getCurrentMonthBounds();
  const total = recon.ok.length + recon.missing_in_excel.length + recon.missing_in_schedule.length + recon.price_mismatch.length;

  document.getElementById('recon-month-label').textContent = `${monthsNominative[monthIndex]} ${year}`;
  document.getElementById('recon-stat-ok').textContent = recon.ok.length;
  document.getElementById('recon-stat-unpaid').textContent = recon.missing_in_excel.length;
  document.getElementById('recon-stat-extra').textContent = recon.missing_in_schedule.length;
  document.getElementById('recon-stat-mismatch').textContent = recon.price_mismatch.length;
  document.getElementById('recon-stat-total').textContent = total;

  const sectionsEl = document.getElementById('recon-sections');
  sectionsEl.innerHTML = '';

  const renderRows = (items, type) => {
    if (!items.length) return '';
    const titleMap = {
      missing_in_excel: '🔴 В расписании, но НЕТ в Excel (не заплатили)',
      missing_in_schedule: '🟠 В Excel, но НЕТ в расписании',
      price_mismatch: '🟡 Суммы не сходятся',
      ok: '✅ Совпадения'
    };
    let rows = items.map((item, idx) => {
      const globalIdx = `${type}_${idx}`;
      if (type === 'missing_in_excel') {
        const ev = item.schedule;
        return `<tr class="recon-row recon-row-danger" data-type="${type}" data-idx="${idx}">
          <td>${formatShortDate(ev.date)}</td>
          <td>${escapeHtml(ev.title)}<div class="recon-sub">${getSchoolLabel(ev.school)} · ${ev.startTime}</div></td>
          <td>${item.scheduleStatus}</td>
          <td class="num">${item.schedulePrice} ₽</td>
          <td class="recon-empty">—</td>
        </tr>`;
      }
      if (type === 'missing_in_schedule') {
        const xl = item.excel;
        return `<tr class="recon-row recon-row-warn" data-type="${type}" data-idx="${idx}">
          <td>${formatShortDate(xl.date)}</td>
          <td>${escapeHtml(xl.title)}<div class="recon-sub">${getSchoolLabel(xl.school)}</div></td>
          <td>${xl.status}</td>
          <td class="num">${xl.price} ₽</td>
          <td class="recon-empty">—</td>
        </tr>`;
      }
      const { excel, schedule, schedulePrice, excelPrice, apply, match } = item;
      const rowClass = type === 'price_mismatch' ? 'recon-row recon-row-mismatch' : 'recon-row recon-row-ok';
      const matchLabel = match?.label ? `<div class="recon-sub" style="color: #22c55e;">${escapeHtml(match.label)}</div>` : '';
      return `<tr class="${rowClass}" data-type="${type}" data-idx="${idx}">
        <td>${formatShortDate(schedule.date)}</td>
        <td>
          ${escapeHtml(schedule.title)}
          <div class="recon-sub">${getSchoolLabel(schedule.school)} · CRM · ${schedule.startTime}</div>
          <div class="recon-sub">Excel: ${escapeHtml(excel.title)}</div>
          ${matchLabel}
        </td>
        <td>${item.scheduleStatus} → ${item.excelStatus}</td>
        <td class="num"><span class="recon-price-old">${schedulePrice}</span>${type === 'price_mismatch' ? ` → <strong>${excelPrice}</strong>` : ''} ₽</td>
        <td><label class="recon-check"><input type="checkbox" class="recon-apply-cb" data-type="${type}" data-idx="${idx}" ${apply ? 'checked' : ''}> Excel</label></td>
      </tr>`;
    }).join('');

    return `<div class="recon-section">
      <h4 class="recon-section-title">${titleMap[type]} <span class="recon-badge">${items.length}</span></h4>
      <div class="recon-table-wrap"><table class="recon-table"><thead><tr>
        <th>Дата</th><th>Урок</th><th>Статус</th><th>Сумма</th><th></th>
      </tr></thead><tbody>${rows}</tbody></table></div>
    </div>`;
  };

  ['missing_in_excel', 'missing_in_schedule', 'price_mismatch', 'ok'].forEach(type => {
    const html = renderRows(recon[type], type);
    if (html) sectionsEl.insertAdjacentHTML('beforeend', html);
  });

  sectionsEl.querySelectorAll('.recon-apply-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const t = cb.dataset.type;
      const i = parseInt(cb.dataset.idx, 10);
      if (reconciliationResult[t][i]) reconciliationResult[t][i].apply = cb.checked;
    });
  });

  document.getElementById('stats-modal').classList.remove('active');
  document.getElementById('excel-review-modal').classList.add('active');
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
  const currentWeekDates = getCurrentWeekDates();

  currentWeekDates.forEach((dateStr, index) => {
    const dayEvents = scheduleData.filter(e => e.date === dateStr);
    if (dayEvents.length === 0) return;
    const [, month, day] = dateStr.split('-');
    let dayHtml = `<div class="stat-day-header">${daysOfWeek[index]} (${day}.${month})</div>`;

    dayEvents.forEach(ev => {
      const lessonKey = getLessonKey(ev, daysOfWeek[index]);
      let cPrice = priceBook[lessonKey];
      if (cPrice === undefined) {
        if (ev.isExcelCustom) cPrice = ev.excelPrice;
        else {
          const dur = timeToMins(ev.endTime) - timeToMins(ev.startTime);
          cPrice = getStandardPrice(ev.school, dur) || '';
        }
      }
      const schoolTag = ev.isManual ? ' 🟠' : '';
      dayHtml += `<div class="price-row"><span class="price-title">${ev.startTime} - ${ev.title}${schoolTag}</span><input type="number" class="price-input" data-key="${lessonKey}" value="${cPrice}"></div>`;
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
  const snap = computeStatsSnapshot(scheduleData);

  document.getElementById('stat-today').innerHTML = `${snap.todaySum} ₽ <span class="byn-text">(${(snap.todaySum * BYN_RATE).toFixed(2)} Br)</span>`;
  document.getElementById('stat-week').innerHTML = `${snap.weekSum} ₽ <span style="font-size: 0.8rem; color: var(--text-muted);">(${(snap.weekSum * BYN_RATE).toFixed(2)} Br)</span>`;
  document.getElementById('stat-month-project').innerHTML = `${snap.monthGrand} ₽ <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">(${(snap.monthGrand * BYN_RATE).toFixed(2)} Br)</span>`;

  const monthEvents = getMonthScheduleEvents();
  const monthSnap = computeStatsSnapshot(monthEvents);
  const elDone = document.getElementById('stat-count-done');
  const elCancel = document.getElementById('stat-count-canceled');
  const elNoshow = document.getElementById('stat-count-noshow');
  const elLate = document.getElementById('stat-count-late');
  if (elDone) elDone.textContent = monthSnap.counts.done;
  if (elCancel) elCancel.textContent = monthSnap.counts.canceled;
  if (elNoshow) elNoshow.textContent = monthSnap.counts.noshow;
  if (elLate) elLate.textContent = monthSnap.counts.late;
}

function openDetailedExcel() {
  const realTodayStr = formatDateToString(new Date());
  const { year: curYear, monthIndex: curMonthIndex } = getCurrentMonthBounds();
  const weekSet = new Set(getCurrentWeekDates());

  document.getElementById('excel-month-name').textContent = `${monthsNominative[curMonthIndex]} ${curYear}`;

  const monthEvents = getMonthScheduleEvents()
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  let earnedItc = 0, earnedZero = 0, earnedPrivate = 0;
  let expectedItc = 0, expectedZero = 0, expectedPrivate = 0;
  let todaySum = 0, weekSum = 0;
  const rowParts = [];

  for (let i = 0; i < monthEvents.length; i++) {
    const ev = monthEvents[i];
    const dayName = daysOfWeek[ev.customDayIndex];
    const status = getEventStatus(ev);
    const price = getEffectivePrice(ev, dayName);
    const isPastOrToday = ev.date <= realTodayStr;
    const isFuture = ev.date > realTodayStr;

    if (ev.school === 'ITCompot') {
      expectedItc += price;
      if (isPastOrToday) earnedItc += price;
    } else if (ev.school === 'Zerocoder') {
      expectedZero += price;
      if (isPastOrToday) earnedZero += price;
    } else {
      expectedPrivate += price;
      if (isPastOrToday) earnedPrivate += price;
    }

    if (ev.date === realTodayStr) todaySum += price;
    if (weekSet.has(ev.date)) weekSum += price;

    let trClass = ''; let statusText = '✅ Проведен';
    if (status === 'canceled') { trClass = 'row-canceled'; statusText = '❌ Отменен'; }
    else if (status === 'noshow') { trClass = 'row-noshow'; statusText = '⚠️ Прогул'; }
    else if (status === 'late') { trClass = 'row-late'; statusText = '⏰ Опоздал'; }
    else if (isFuture) { trClass = 'row-future'; statusText = '⏳ Ожидается'; }

    const [, mm, dd] = ev.date.split('-');
    rowParts.push(`<tr class="${trClass}"><td>${dd}.${mm}</td><td>${statusText}</td><td>${escapeHtml(ev.title)}</td><td>${getSchoolLabel(ev.school)}</td><td class="num">${price} ₽</td></tr>`);
  }

  document.getElementById('detailed-excel-tbody').innerHTML = rowParts.join('');

  const earnedItcPrem = Math.round(earnedItc * 0.20);
  const earnedItcTotal = earnedItc + earnedItcPrem;
  const earnedGrand = earnedItcTotal + earnedZero + earnedPrivate;

  const expectedItcPrem = Math.round(expectedItc * 0.20);
  const expectedGrand = expectedItc + expectedItcPrem + expectedZero + expectedPrivate;

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
      
      const instKey = getInstanceKey(e);
      const oldKey = getOldDateKey(e);
      if (statusBook[instKey] === 'canceled' || statusBook[oldKey] === 'canceled') return false;
      
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

document.addEventListener('DOMContentLoaded', () => {
  try {
    priceBook = readStorageJSON('lessonPrices_v2', {});
    statusBook = readStorageJSON('lessonStatuses', {});
    notesBook = readStorageJSON('lessonNotes', {});
    overridePriceBook = readStorageJSON('lessonOverrides', {});
    customLessons = readStorageJSON('customLessons', []);
  } catch (e) {
    priceBook = {}; statusBook = {}; notesBook = {}; overridePriceBook = {}; customLessons = [];
  }

  cleanOldCacheData();

  if (scheduleData.length > 0) {
    if (loadedStartStr && loadedEndStr) applyScheduleMerge(loadedStartStr, loadedEndStr);
    initCalendar();
    calcSalary();
  }

  loadCloudData().then((loaded) => {
    if (loaded) {
      console.log("☁️ Свежие данные из MongoDB успешно загружены в фоне");
    } else {
      console.log("☁️ Не удалось загрузить данные из MongoDB, используем локальные данные");
    }

    flushCloudQueue();
    if (loadedStartStr && loadedEndStr) applyScheduleMerge(loadedStartStr, loadedEndStr);
    else if (scheduleData.length > 0) scheduleData = mergeScheduleData(scheduleData.filter(e => !e.isManual), formatDateToString(addDays(currentWeekMonday, -30)), formatDateToString(addDays(currentWeekMonday, 90)));
    initCalendar();
    calcSalary();
  }).catch(err => console.error("Ошибка фоновой загрузки:", err));

  const lastSync = readStorageNumber('lastSyncTime', 0);
  const oneHour = 60 * 60 * 1000;
  if (Date.now() - lastSync > oneHour) {
    fetchLessons(true);
  } else {
    fetchLessons();
  }

  setInterval(() => { fetchLessons(true); }, oneHour);

  window.addEventListener('online', () => flushCloudQueue());
  window.addEventListener('offline', () => {
    const checkTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    setSyncStatus(`Offline: ${checkTime}`, 'warn');
  });

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
  document.getElementById('btn-lm-delete-manual').addEventListener('click', () => {
    if (currentEditingLesson?.event?.isManual) deleteManualLesson(currentEditingLesson.event);
  });

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

      priceBook = rawData;
      localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));

      await saveToCloud();

      calcSalary(); initCalendar();
      document.getElementById('sync-data-input').value = '';
      const orig = this.textContent; this.textContent = '📥 Успешно!'; setTimeout(() => { this.textContent = orig; document.getElementById('stats-modal').classList.remove('active'); }, 1500);
    } catch (e) { alert('Ошибка данных!'); }
  });

  const oldDynamicBtn = document.getElementById('btn-import-excel');
  if (oldDynamicBtn) oldDynamicBtn.remove();

  const filePicker = document.getElementById('excel-file-picker');
  const btnChooseFile = document.getElementById('btn-choose-file');

  if (btnChooseFile && filePicker) {
    btnChooseFile.addEventListener('click', () => filePicker.click());

    filePicker.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (typeof XLSX === 'undefined') {
        alert('Библиотека Excel не найдена. Пытаюсь загрузить...');
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          processExcelData(workbook);
        } catch (err) {
          alert('Ошибка чтения файла: ' + err.message);
          console.error(err);
        } finally {
          filePicker.value = '';
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  document.getElementById('btn-review-close').addEventListener('click', () => {
    document.getElementById('excel-review-modal').classList.remove('active');
  });

  document.getElementById('btn-excel-confirm-cancel').addEventListener('click', () => {
    document.getElementById('excel-review-modal').classList.remove('active');
  });

  document.getElementById('btn-excel-apply-fixes').addEventListener('click', async () => {
    if (!reconciliationResult) return;
    const btn = document.getElementById('btn-excel-apply-fixes');
    const origText = btn.innerHTML;
    btn.innerHTML = '⏳ Применяю...';
    btn.disabled = true;

    try {
      const applied = applyReconciliationFixes(reconciliationResult);
      await saveToCloud();
      calcSalary();
      initCalendar();
      btn.innerHTML = `✅ Применено: ${applied}`;
      setTimeout(() => {
        document.getElementById('excel-review-modal').classList.remove('active');
        btn.innerHTML = origText;
        btn.disabled = false;
      }, 1200);
    } catch (e) {
      alert('Ошибка: ' + e.message);
      btn.innerHTML = origText;
      btn.disabled = false;
    }
  });

  const btnAddLesson = document.getElementById('btn-add-lesson');
  const addLessonModal = document.getElementById('add-lesson-modal');
  const btnSaveNewLesson = document.getElementById('btn-save-new-lesson');

  if (btnAddLesson) {
    btnAddLesson.addEventListener('click', () => {
      addLessonModal.classList.add('active');
      document.getElementById('add-date').value = formatDateToString(new Date());
      document.getElementById('add-time').value = '';
      document.getElementById('add-title').value = '';
      document.getElementById('add-recurring').checked = false;
      document.getElementById('add-school').value = 'Private';
    });
  }

  if (btnSaveNewLesson) {
    btnSaveNewLesson.addEventListener('click', async () => {
      const title = document.getElementById('add-title').value.trim();
      const isRecurring = document.getElementById('add-recurring')?.checked ?? false;
      const date = document.getElementById('add-date').value;
      const time = normalize24HourTime(document.getElementById('add-time').value);
      const duration = document.getElementById('add-duration').value || 45;
      const school = document.getElementById('add-school').value;

      if (!title || !date || !time) return alert('Заполните Имя, Дату и Время в формате 24 часа!');

      const [h, m] = time.split(':').map(Number);
      const endD = new Date(2000, 0, 1, h, m + Number(duration));
      const endTime = `${String(endD.getHours()).padStart(2, '0')}:${String(endD.getMinutes()).padStart(2, '0')}`;

      const newLesson = {
        id: 'manual_' + Date.now(),
        date,
        startTime: time,
        endTime,
        title,
        school,
        isManual: true,
        isRecurring
      };

      let currentCustom = readStorageJSON('customLessons', []);
      currentCustom.push(newLesson);
      localStorage.setItem('customLessons', JSON.stringify(currentCustom));
      customLessons = currentCustom;

      btnSaveNewLesson.innerHTML = '⏳ Сохранение...';
      btnSaveNewLesson.disabled = true;
      try { await saveToCloud(); } catch (e) { console.error('Ошибка облака:', e); }

      addLessonModal.classList.remove('active');
      if (loadedStartStr && loadedEndStr) applyScheduleMerge(loadedStartStr, loadedEndStr);
      else await fetchLessons(true);

      initCalendar();
      calcSalary();

      btnSaveNewLesson.innerHTML = 'Сохранить урок';
      btnSaveNewLesson.disabled = false;
    });
  }

});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});