// ==========================================
// ГЛОБАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ
// ==========================================

function initApp() {
  // 1. Загрузка локальных данных
  try {
    priceBook = readStorageJSON('lessonPrices_v2', {});
    statusBook = readStorageJSON('lessonStatuses', {});
    notesBook = readStorageJSON('lessonNotes', {});
    overridePriceBook = readStorageJSON('lessonOverrides', {});
    customLessons = readStorageJSON('customLessons', []);
  } catch (e) {
    priceBook = {}; statusBook = {}; notesBook = {}; overridePriceBook = {}; customLessons = [];
  }

  scheduleData = readStorageJSON('cachedSchedule', []);
  scheduleData.forEach(e => {
    if (!e || !e.date) return;
    e.customDayIndex = getCustomDayIndex(e.date);
    e.title = cleanTrashCodes(e.title);
  });

  loadedStartStr = readStorageString('loadedStartStr');
  loadedEndStr = readStorageString('loadedEndStr');

  cleanOldCacheData();

  if (scheduleData.length > 0) {
    if (loadedStartStr && loadedEndStr) applyScheduleMerge(loadedStartStr, loadedEndStr);
    initCalendar();
    calcSalary();
  }

  // 2. Фоновая загрузка облака MongoDB
  loadCloudData().then((loaded) => {
    if (loaded) console.log("☁️ Данные из MongoDB успешно загружены в фоне");
    else console.log("☁️ Ошибка MongoDB, используем локальные данные");

    flushCloudQueue();
    if (loadedStartStr && loadedEndStr) applyScheduleMerge(loadedStartStr, loadedEndStr);
    else if (scheduleData.length > 0) scheduleData = mergeScheduleData(scheduleData.filter(e => !e.isManual), formatDateToString(addDays(currentWeekMonday, -30)), formatDateToString(addDays(currentWeekMonday, 90)));
    initCalendar();
    calcSalary();
  }).catch(err => console.error("Ошибка фоновой загрузки:", err));

  // 3. Фоновая загрузка из CRM
  const lastSync = readStorageNumber('lastSyncTime', 0);
  const oneHour = 60 * 60 * 1000;
  if (Date.now() - lastSync > oneHour) fetchLessons(true);
  else fetchLessons();

  setInterval(() => { fetchLessons(true); }, oneHour);

  // 4. Слушатели статуса сети
  window.addEventListener('online', () => flushCloudQueue());
  window.addEventListener('offline', () => {
    const checkTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    setSyncStatus(`Offline: ${checkTime}`, 'warn');
  });

  // ==========================================
  // НАВИГАЦИЯ И БАЗОВЫЕ КНОПКИ
  // ==========================================
  document.getElementById('btn-burger').addEventListener('click', () => document.getElementById('action-controls').classList.toggle('open'));
  document.getElementById('btn-prev').addEventListener('click', () => { currentWeekMonday = addDays(currentWeekMonday, -7); fetchLessons(); });
  document.getElementById('btn-next').addEventListener('click', () => { currentWeekMonday = addDays(currentWeekMonday, 7); fetchLessons(); });
  document.getElementById('btn-today').addEventListener('click', () => { currentWeekMonday = getMonday(new Date()); fetchLessons(); });
  document.getElementById('btn-refresh').addEventListener('click', () => fetchLessons(true));
  document.getElementById('btn-wife').addEventListener('click', () => window.location.href = 'wife.html');

  // ==========================================
  // МОДАЛКИ СТАТИСТИКИ И EXCEL
  // ==========================================
  document.getElementById('btn-stats').addEventListener('click', openStats);
  document.getElementById('btn-stats-close').addEventListener('click', () => document.getElementById('stats-modal').classList.remove('active'));

  document.getElementById('btn-open-excel').addEventListener('click', () => {
    document.getElementById('stats-modal').classList.remove('active');
    openDetailedExcel();
  });
  document.getElementById('btn-excel-close').addEventListener('click', () => document.getElementById('detailed-excel-modal').classList.remove('active'));

  document.getElementById('btn-export-csv').addEventListener('click', () => {
    let csv = '\uFEFF№;Дата;Статус;Урок/Группа;Школа;Сумма\n';
    document.querySelectorAll('#detailed-excel-tbody tr').forEach(row => {
      csv += Array.from(row.querySelectorAll('td')).map(c => c.innerText.replace(' ₽', '').trim()).join(';') + '\n';
    });
    csv += `\n; ; ; ;Ожидаемый Итог:;${document.getElementById('ex-expected').innerText.replace(' ₽', '')}\n`;
    csv += `; ; ; ;Фактически заработано:;${document.getElementById('ex-earned').innerText.replace(' ₽', '')}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Зарплата_${document.getElementById('excel-month-name').innerText}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  });

  // ==========================================
  // ПОИСК ОКОШЕК (СЛОТОВ)
  // ==========================================
  document.getElementById('btn-find-slots').addEventListener('click', () => {
    document.getElementById('slots-results').innerHTML = '';
    document.getElementById('slots-modal').classList.add('active');
    document.getElementById('action-controls').classList.remove('open');
  });
  document.getElementById('btn-slots-cancel').addEventListener('click', () => document.getElementById('slots-modal').classList.remove('active'));
  document.getElementById('btn-slots-search').addEventListener('click', findFreeSlots);

  // ==========================================
  // ПОИСК УЧЕНИКА
  // ==========================================
  document.getElementById('btn-search-student').addEventListener('click', () => {
    document.getElementById('search-modal').classList.add('active');
    document.getElementById('search-student-input').value = '';
    document.getElementById('search-student-results').innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 10px;">Начните вводить данные...</div>';
    document.getElementById('action-controls').classList.remove('open');
    setTimeout(() => document.getElementById('search-student-input').focus(), 100);
  });

  document.getElementById('btn-search-close').addEventListener('click', () => {
    document.getElementById('search-modal').classList.remove('active');
  });

  document.getElementById('search-student-input').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-student-results');

    if (query.length < 2) {
      resultsContainer.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 10px;">Введите хотя бы 2 символа...</div>';
      return;
    }

    const matchedTitles = new Set();
    const groupedData = {};

    scheduleData.forEach(ev => {
      if (ev.title.toLowerCase().includes(query)) {
        matchedTitles.add(ev.title);
        if (!groupedData[ev.title]) {
          groupedData[ev.title] = {
            school: ev.school,
            isManual: ev.isManual,
            lessons: [],
            daysInfo: new Set()
          };
        }
        groupedData[ev.title].lessons.push(ev);
        groupedData[ev.title].daysInfo.add(`${daysOfWeek[ev.customDayIndex]} (${ev.startTime})`);
      }
    });

    if (matchedTitles.size === 0) {
      resultsContainer.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 10px;">Ученик не найден 🤷‍♂️</div>';
      return;
    }

    let html = '';
    const todayStr = formatDateToString(new Date());

    matchedTitles.forEach(title => {
      const data = groupedData[title];
      data.lessons.sort((a, b) => a.date.localeCompare(b.date));

      const pastLessons = data.lessons.filter(l => l.date < todayStr && getEventStatus(l) === 'done').length;
      const futureLessons = data.lessons.filter(l => l.date >= todayStr && !l.isPhantom && getEventStatus(l) !== 'canceled');
      const nextLesson = futureLessons.length > 0 ? futureLessons[0] : null;

      let nextLessonStr = '<span style="color: var(--text-muted);">Нет в расписании</span>';
      if (nextLesson) {
        const [, m, d] = nextLesson.date.split('-');
        nextLessonStr = `<strong style="color: #10b981;">${d}.${m} в ${nextLesson.startTime}</strong>`;
      }

      let note = '';
      let price = 0;
      for (let l of data.lessons) {
        const lKey = getLessonKey(l, daysOfWeek[l.customDayIndex]);
        if (notesBook[lKey]) note = notesBook[lKey];
        if (priceBook[lKey]) price = priceBook[lKey];
      }

      // Добавлена кнопка "В CRM" прямо в заголовок карточки
      html += `
        <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; font-size: 0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="font-size: 1.05rem; font-weight: bold; color: #3b82f6;">${escapeHtml(title)}</div>
            <button class="btn-crm-search btn-secondary" data-school="${data.school}" data-title="${escapeHtml(title)}" style="padding: 4px 10px; font-size: 0.75rem; flex-shrink: 0; margin-left: 10px;">🔗 В CRM</button>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div><span style="color: var(--text-muted); font-size: 0.75rem;">Школа:</span><br><strong style="font-size: 0.9rem;">${getSchoolLabel(data.school)}</strong></div>
            <div><span style="color: var(--text-muted); font-size: 0.75rem;">Цена за урок:</span><br><strong style="font-size: 0.9rem;">${price ? price + ' ₽' : 'По умолчанию'}</strong></div>
            <div><span style="color: var(--text-muted); font-size: 0.75rem;">Обычно занимается:</span><br><strong style="font-size: 0.9rem;">${Array.from(data.daysInfo).join(', ')}</strong></div>
            <div><span style="color: var(--text-muted); font-size: 0.75rem;">Уже проведено:</span><br><strong style="font-size: 0.9rem;">${pastLessons} шт.</strong></div>
          </div>
          
          <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed var(--border-color);">
            <span style="color: var(--text-muted);">Ближайший урок:</span> ${nextLessonStr}
          </div>
          
          ${note ? `<div style="background: var(--btn-secondary-bg); padding: 10px; border-radius: 6px; border-left: 3px solid #f59e0b; white-space: pre-wrap; font-size: 0.8rem; line-height: 1.4;"><strong style="color: #f59e0b;">Заметка:</strong>\n${escapeHtml(note)}</div>` : ''}
        </div>
      `;
    });

    resultsContainer.innerHTML = html;

    // Вешаем обработчик на новые кнопки
    resultsContainer.querySelectorAll('.btn-crm-search').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const school = e.target.dataset.school;
        const title = e.target.dataset.title;

        // Вырезаем ID ученика (все до первого пробела или тире)
        const studentId = title.split(/[\s-]/)[0].trim();

        // Копируем в буфер и открываем сайт
        navigator.clipboard.writeText(studentId).then(() => {
          const originalText = e.target.textContent;
          e.target.textContent = '✅ ID скопирован!';
          e.target.style.background = '#10b981';
          e.target.style.color = '#fff';
          setTimeout(() => {
            e.target.textContent = originalText;
            e.target.style.background = '';
            e.target.style.color = '';
          }, 2000);

          if (LINKS[school]) {
            window.open(LINKS[school], '_blank');
          }
        }).catch(err => {
          console.error('Ошибка копирования:', err);
          if (LINKS[school]) window.open(LINKS[school], '_blank');
        });
      });
    });
  });
  
  // ==========================================
  // МОДАЛКА УРОКА
  // ==========================================
  document.getElementById('btn-lesson-close').addEventListener('click', () => document.getElementById('lesson-modal').classList.remove('active'));
  document.getElementById('btn-lm-save').addEventListener('click', async () => {
    if (!currentEditingLesson) return;
    const inputVal = parseFloat(document.getElementById('lm-input-price').value) || 0;
    const finalPrice = currentEditingLesson.isPerStudent ? inputVal * ITCOMPOT_RATE : inputVal;

    const { event, dayName } = currentEditingLesson;
    const instKey = getInstanceKey(event);
    const oldKey = getOldDateKey(event);
    const lessonKey = getLessonKey(event, dayName);
    const newStatus = document.querySelector('.status-btn.active').dataset.status;

    statusBook[instKey] = newStatus;
    delete statusBook[oldKey];

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
  document.getElementById('btn-lm-crm').addEventListener('click', () => { if (currentEditingLesson?.event?.school) window.open(LINKS[currentEditingLesson.event.school], '_blank'); });
  document.getElementById('btn-lm-delete-manual').addEventListener('click', () => {
    if (currentEditingLesson?.event?.isManual) deleteManualLesson(currentEditingLesson.event);
  });
  document.getElementById('btn-copy-notes').addEventListener('click', function (e) {
    e.preventDefault(); const textarea = document.getElementById('lm-notes'); textarea.select(); document.execCommand('copy');
    const origText = this.textContent; this.textContent = '✅ Скопировано!'; this.style.background = '#10b981'; this.style.color = '#ffffff';
    setTimeout(() => { this.textContent = origText; this.style.background = ''; this.style.color = ''; }, 2000);
  });

  // ==========================================
  // ЭКСПОРТ РАСПИСАНИЯ КАК КАРТИНКИ
  // ==========================================
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

  // ==========================================
  // АНАЛИЗАТОР СООБЩЕНИЙ МЕНЕДЖЕРА
  // ==========================================
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

  // ==========================================
  // РУЧНОЙ ЭКСПОРТ/ИМПОРТ ЦЕН
  // ==========================================
  document.getElementById('btn-export-prices').addEventListener('click', function () {
    const input = document.getElementById('sync-data-input');
    input.value = JSON.stringify(priceBook || {});
    input.select(); document.execCommand('copy');
    const orig = this.textContent; this.textContent = '📋 Скопировано!'; setTimeout(() => this.textContent = orig, 2000);
  });

  document.getElementById('btn-import-prices').addEventListener('click', async function () {
    try {
      priceBook = JSON.parse(document.getElementById('sync-data-input').value.trim());
      localStorage.setItem('lessonPrices_v2', JSON.stringify(priceBook));
      await saveToCloud();
      calcSalary(); initCalendar();
      document.getElementById('sync-data-input').value = '';
      const orig = this.textContent; this.textContent = '📥 Успешно!'; setTimeout(() => { this.textContent = orig; document.getElementById('stats-modal').classList.remove('active'); }, 1500);
    } catch (e) { alert('Ошибка данных!'); }
  });

  // ==========================================
  // ЗАГРУЗКА EXCEL
  // ==========================================
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

  // ==========================================
  // СВЕРКА EXCEL (МОДАЛКА)
  // ==========================================
  document.getElementById('btn-review-close').addEventListener('click', () => document.getElementById('excel-review-modal').classList.remove('active'));
  document.getElementById('btn-excel-confirm-cancel').addEventListener('click', () => document.getElementById('excel-review-modal').classList.remove('active'));

  document.getElementById('btn-excel-apply-fixes').addEventListener('click', async () => {
    if (!reconciliationResult) return;
    const btn = document.getElementById('btn-excel-apply-fixes');
    const origText = btn.innerHTML;
    btn.innerHTML = '⏳ Применяю...'; btn.disabled = true;

    try {
      const applied = applyReconciliationFixes(reconciliationResult);
      await saveToCloud();
      calcSalary(); initCalendar();
      btn.innerHTML = `✅ Применено: ${applied}`;
      setTimeout(() => {
        document.getElementById('excel-review-modal').classList.remove('active');
        btn.innerHTML = origText; btn.disabled = false;
      }, 1200);
    } catch (e) {
      alert('Ошибка: ' + e.message);
      btn.innerHTML = origText; btn.disabled = false;
    }
  });

  // ==========================================
  // ДОБАВЛЕНИЕ РУЧНОГО УРОКА
  // ==========================================
  document.getElementById('btn-add-lesson').addEventListener('click', () => {
    document.getElementById('add-lesson-modal').classList.add('active');
    document.getElementById('add-date').value = formatDateToString(new Date());
    document.getElementById('add-time').value = '';
    document.getElementById('add-title').value = '';
    document.getElementById('add-recurring').checked = false;
    document.getElementById('add-school').value = 'Private';
  });

  document.getElementById('btn-save-new-lesson').addEventListener('click', async () => {
    const btnSaveNewLesson = document.getElementById('btn-save-new-lesson');
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
      date, startTime: time, endTime, title, school,
      isManual: true, isRecurring
    };

    let currentCustom = readStorageJSON('customLessons', []);
    currentCustom.push(newLesson);
    localStorage.setItem('customLessons', JSON.stringify(currentCustom));
    customLessons = currentCustom;

    btnSaveNewLesson.innerHTML = '⏳ Сохранение...'; btnSaveNewLesson.disabled = true;
    try { await saveToCloud(); } catch (e) { console.error('Ошибка облака:', e); }

    document.getElementById('add-lesson-modal').classList.remove('active');
    if (loadedStartStr && loadedEndStr) applyScheduleMerge(loadedStartStr, loadedEndStr);
    else await fetchLessons(true);

    initCalendar(); calcSalary();
    btnSaveNewLesson.innerHTML = 'Сохранить урок'; btnSaveNewLesson.disabled = false;
  });
}

// -----------------------------------------------------------------------------
// КЛЮЧЕВОЕ ИЗМЕНЕНИЕ ЗДЕСЬ:
// Если браузер уже загрузил страницу - запускаем сразу.
// Если еще грузит - ждем события DOMContentLoaded.
// -----------------------------------------------------------------------------
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('active');
});