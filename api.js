// ==========================================
// API & СИНХРОНИЗАЦИЯ С ОБЛАКОМ (MongoDB + CRM)
// ==========================================

const API_URL = 'https://lessons-mqy0.onrender.com/api/schedule';
const DB_API_URL = 'https://lessons-mqy0.onrender.com/api/data';
const CLOUD_SYNC_QUEUE_KEY = 'cloudSyncQueue';

let cloudRevision = '';
let cloudUpdatedAt = '';
let isFlushingCloudQueue = false;
let isFetching = false;

try {
  cloudRevision = localStorage.getItem('cloudRevision') || '';
  cloudUpdatedAt = localStorage.getItem('cloudUpdatedAt') || '';
} catch (e) {
  console.warn('Не удалось прочитать метаданные облачной синхронизации.', e);
}

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
    createdAt: new Date().toISOString()
  });

  persistPendingCloudQueue(queue);
  const checkTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  setSyncStatus(`Offline: ${checkTime}`, 'warn');

  await flushCloudQueue();
  return getPendingCloudQueue().length === 0;
}

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