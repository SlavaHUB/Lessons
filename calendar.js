// ==========================================
// ОТРИСОВКА КАЛЕНДАРЯ И МОДАЛКА УРОКА
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
  const startMonth = monthsRu[currentWeekMonday.getMonth()];
  const endMonth = monthsRu[sundayOfCurrentWeek.getMonth()];
  const currentYear = currentWeekMonday.getFullYear();

  if (currentWeekMonday.getMonth() === sundayOfCurrentWeek.getMonth()) {
    rangeDisplay.textContent = `${currentWeekMonday.getDate()} – ${sundayOfCurrentWeek.getDate()} ${startMonth} ${currentYear} г.`;
  } else {
    rangeDisplay.textContent = `${currentWeekMonday.getDate()} ${startMonth} – ${sundayOfCurrentWeek.getDate()} ${endMonth} ${currentYear} г.`;
  }

  const realTodayStr = formatDateToString(new Date());
  const currentWeekDates = [];

  for (let i = 0; i < 7; i++) {
    const dateForDay = addDays(currentWeekMonday, i);
    currentWeekDates.push(dateForDay);
    const todayClass = formatDateToString(dateForDay) === realTodayStr ? ' today' : '';
    const hideClass = (i === 1 || i === 2) ? ' mobile-hide' : '';
    header.innerHTML += `<div class="day-header${todayClass}${hideClass}">${daysOfWeek[i]} <span>${dateForDay.getDate()}.${dateForDay.getMonth() + 1}</span></div>`;
  }

  for (let i = START_HOUR; i <= END_HOUR; i++) {
    timeLabels.innerHTML += `<div class="time-slot">${i.toString().padStart(2, '0') + ':00'}</div>`;
  }

  daysOfWeek.forEach((dayName, index) => {
    const dayCol = document.createElement('div');
    dayCol.className = 'day-column';
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

  const studentId = event.title.split(/[\s-]/)[0].trim();
  const defaultManager = studentManagers[studentId] || "Алсу @Alsushenka1985 - Елена @ElenaLCastellano";

  const managerGroup = document.getElementById('lm-managers-group');
  const managerSelect = document.getElementById('lm-manager-select');

  if (managerGroup && managerSelect) {
    if (isManual) {
      managerGroup.style.display = 'none';
    } else {
      managerGroup.style.display = 'block';
      managerSelect.value = defaultManager;

      // Мгновенно меняем текст в окне, если ты переключаешь куратора
      managerSelect.onchange = (e) => {
        const newPair = e.target.value;
        const textarea = document.getElementById('lm-notes');
        let text = textarea.value;
        let replaced = false;

        MANAGER_PAIRS.forEach(pair => {
          if (text.includes(pair)) {
            text = text.replace(pair, newPair);
            replaced = true;
          }
        });

        if (!replaced) {
          const lines = text.split('\n');
          if (lines.length > 1) {
            lines[1] = newPair;
            text = lines.join('\n');
          }
        }
        textarea.value = text;
      };
    }
  }

  let currentStatus = getEventStatus(event);
  let currentNote = notesBook[lessonKey];
  if (!currentNote) {
    currentNote = isManual
      ? `${event.title}\nПерсональный урок`
      : `${event.title}\n${defaultManager}\n\nНе на уроке.`;
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
      const studentId = event.title.split(/[\s-]/)[0].trim();
      let defaultManager = studentManagers[studentId]; // Может быть еще неизвестен

      const managerGroup = document.getElementById('lm-managers-group');
      const managerSelect = document.getElementById('lm-manager-select');

      // Узнаем, есть ли уже сохраненная заметка для этого конкретного урока
      const instKey = getInstanceKey(event);
      const oldKey = getOldDateKey(event);
      const lessonKey = getLessonKey(event, dayName);
      let currentStatus = getEventStatus(event);
      let currentNote = notesBook[lessonKey];

      if (managerGroup && managerSelect) {
        if (isManual) {
          managerGroup.style.display = 'none';
        } else {
          managerGroup.style.display = 'block';

          // Функция, которая подставляет куратора в текст, не стирая твои ручные правки
          const updateManagerUI = (pairName) => {
            managerSelect.value = pairName;
            const textarea = document.getElementById('lm-notes');
            let text = textarea.value;
            let replaced = false;

            // Ищем старую пару и меняем на новую
            MANAGER_PAIRS.forEach(pair => {
              if (text.includes(pair)) {
                text = text.replace(pair, pairName);
                replaced = true;
              }
            });

            // Если в тексте вообще нет пар, вставляем аккуратно второй строкой
            if (!replaced) {
              const lines = text.split('\n');
              if (lines.length > 1) {
                lines[1] = pairName;
                text = lines.join('\n');
              } else {
                text = `${event.title}\n${pairName}\n\nНе на уроке.`;
              }
            }
            textarea.value = text;

            // Сохраняем в память навсегда
            studentManagers[studentId] = pairName;
            localStorage.setItem('studentManagers', JSON.stringify(studentManagers));
          };

          managerSelect.onchange = (e) => updateManagerUI(e.target.value);

          // САМОЕ ГЛАВНОЕ: Если мы еще не знаем куратора - ТЯНЕМ ЕГО ИЗ CRM!
          if (!defaultManager && event.school === 'Zerocoder' && event.studentProfileId) {
            managerSelect.innerHTML = `<option value="">⏳ Ищу в CRM...</option>` + managerSelect.innerHTML;
            managerSelect.value = "";

            // Если заметки еще нет, ставим временную заглушку
            if (!currentNote) currentNote = `${event.title}\n⏳ Ищу куратора...\n\nНе на уроке.`;

            // Делаем скрытый запрос к твоему новому маршруту на сервере
            fetch('https://lessons-mqy0.onrender.com/api/manager', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscribe_id: event.studentProfileId })
            })
              .then(res => res.json())
              .then(data => {
                if (managerSelect.options[0].value === "") managerSelect.remove(0); // убираем "Загрузку"

                const adminName = data.admin_name ? data.admin_name.toLowerCase() : '';
                let fetchedPair = "Алсу @Alsushenka1985 - Елена @ElenaLCastellano"; // по умолчанию

                // Умное распределение по именам и фамилиям
                if (adminName.includes('юли') || adminName.includes('лиз') || adminName.includes('иван')) {
                  fetchedPair = "Юлия @julia_ivan - Лиза @lizablakh";
                } else if (adminName.includes('алин') || adminName.includes('александр') || adminName.includes('шихал') || adminName.includes('домрач')) {
                  fetchedPair = "Алина @Alina_Domracheva - Александра @Lexio19";
                } else if (adminName.includes('алсу') || adminName.includes('елен') || adminName.includes('кастел')) {
                  fetchedPair = "Алсу @Alsushenka1985 - Елена @ElenaLCastellano";
                }

                updateManagerUI(fetchedPair); // Бам! Вставили нужную пару
              })
              .catch(err => {
                if (managerSelect.options[0].value === "") managerSelect.remove(0);
                updateManagerUI("Алсу @Alsushenka1985 - Елена @ElenaLCastellano"); // Если CRM упала, ставим дефолт
              });
          } else {
            // Если куратор уже сохранен в кэше — просто подставляем его моментально
            defaultManager = defaultManager || "Алсу @Alsushenka1985 - Елена @ElenaLCastellano";
            managerSelect.value = defaultManager;
            if (!currentNote) currentNote = `${event.title}\n${defaultManager}\n\nНе на уроке.`;
          }
        }
      } else if (!currentNote) {
        currentNote = `${event.title}\nПерсональный урок`;
      }

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