// ==========================================
// СТАТИСТИКА, ПАРСИНГ EXCEL И СВЕРКА ПО ПОРЯДКУ
// ==========================================

let parsedExcelLessons = [];
let reconciliationResult = null;
let excelManualStats = { itcBase: 0, zeroTotal: 0 };

function getCurrentMonthBounds() {
  const now = new Date();
  return { year: now.getFullYear(), monthIndex: now.getMonth() };
}

function isInCurrentMonth(dateStr) {
  const { year, monthIndex } = getCurrentMonthBounds();
  const [y, m] = dateStr.split('-').map(Number);
  return y === year && (m - 1) === monthIndex;
}

function parseExcelDateCell(cell, carryDate, curYear, curMonthIndex) {
  if (cell === null || cell === undefined || cell === '') return carryDate;
  const raw = String(cell).trim();
  if (!raw || raw.toLowerCase() === 'дата') return carryDate;

  if (!isNaN(raw) && Number(raw) > 40000) {
    try {
      const d = XLSX.SSF.parse_date_code(Number(raw));
      const candidate = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
      if (isValidDateStr(candidate)) return candidate;
    } catch (e) { }
  }

  const fixed = raw.replace(/(\d{1,2})\.0+\.(\d{4})/, (_, day, year) => `${day}.${String(curMonthIndex + 1).padStart(2, '0')}.${year}`);
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

// ПАРСИНГ ЭКСЕЛЯ И ЧТЕНИЕ ИТОГОВ
function processExcelData(workbook) {
  parsedExcelLessons = [];
  excelManualStats = { itcBase: 0, zeroTotal: 0 };
  const { year: curYear, monthIndex: curMonthIndex } = getCurrentMonthBounds();
  const monthSheetName = monthsNominative[curMonthIndex];

  workbook.SheetNames.forEach(sheetName => {
    if (sheetName.toLowerCase().includes('долг')) return;
    if (sheetName !== monthSheetName && !sheetName.toLowerCase().includes(monthSheetName.toLowerCase())) return;

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });
    let currentDate = '';

    rows.forEach((cols, index) => {
      if (!cols || cols.length === 0) return;

      // Читаем твои ручные итоги из шапки (до 15 строки)
      if (index < 15) {
        for (let i = 0; i < cols.length; i++) {
          const val = String(cols[i]).toLowerCase().trim();
          if (val === 'итог:' || val === 'итог') {
             excelManualStats.itcBase = parseFloat(String(cols[i+1]).replace(/\s/g, '').replace(',', '.')) || 0;
          }
          if (val.includes('вторая школа')) {
             excelManualStats.zeroTotal = parseFloat(String(cols[i+1]).replace(/\s/g, '').replace(',', '.')) || 0;
          }
        }
      }

      const col0 = cols[0];
      const col1 = String(cols[1]).trim();
      const col2 = cols[2];
      const col3 = cols[3];

      const parsedDate = parseExcelDateCell(col0, currentDate, curYear, curMonthIndex);
      if (parsedDate && parsedDate !== currentDate && isInCurrentMonth(parsedDate)) currentDate = parsedDate;

      if (!currentDate || !isInCurrentMonth(currentDate)) return;
      if (!col1 || col1.toLowerCase().includes('итог') || col1.toLowerCase().includes('премия')) return;

      let school = 'ITCompot';
      let price = 0;
      let status = 'done';
      let note = '';

      const p3 = parseFloat(String(col3).replace(/\s/g, '').replace(',', '.'));
      const p2 = parseFloat(String(col2).replace(/\s/g, '').replace(',', '.'));

      if (col1.toLowerCase().includes('нейро') || (!isNaN(p3) && p3 > 0)) {
        school = 'Zerocoder';
        price = !isNaN(p3) ? p3 : 0;
        if (String(col2).toLowerCase().includes('комп') || String(col2).toLowerCase().includes('прогул')) status = 'noshow';
      } else {
        school = 'ITCompot';
        price = !isNaN(p2) ? p2 : 0;
        if (String(col2).toLowerCase().includes('комп') || String(col2).toLowerCase().includes('прогул')) status = 'noshow';
      }

      if (price === 0 && status === 'done') return;

      parsedExcelLessons.push({
        tempId: `excel_${sheetName}_${index}`,
        rowIndex: index,
        date: currentDate,
        title: col1,
        school: school,
        status: status,
        price: price,
        note: note
      });
    });
  });

  if (parsedExcelLessons.length === 0) {
    alert(`В файле не найдено уроков за ${monthsNominative[curMonthIndex]} ${curYear}. Проверьте лист «${monthSheetName}».`);
    return;
  }

  // Сортировка по дате и индексу (хронология)
  parsedExcelLessons.sort((a, b) => a.date.localeCompare(b.date) || a.rowIndex - b.rowIndex);
  reconciliationResult = reconcileExcelWithSchedule(parsedExcelLessons, getMonthScheduleEvents());
  renderReconciliationModal(reconciliationResult);
}

// НОВЫЙ АЛГОРИТМ СВЕРКИ (Хронологический)
function reconcileExcelWithSchedule(excelLessons, scheduleEvents) {
  const result = { ok: [], missing_in_excel: [], missing_in_schedule: [], price_mismatch: [] };
  
  // Группируем расписание по Дате + Школе
  const schedMap = {};
  scheduleEvents.forEach(ev => {
    if (ev.isPhantom || getEventStatus(ev) === 'canceled') return; // Отмененные уроки не участвуют в сверке
    const key = `${ev.date}_${ev.school}`;
    if (!schedMap[key]) schedMap[key] = [];
    schedMap[key].push(ev);
  });

  for (let key in schedMap) {
    schedMap[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // Группируем Excel по Дате + Школе
  const excelMap = {};
  excelLessons.forEach(xl => {
    const key = `${xl.date}_${xl.school}`;
    if (!excelMap[key]) excelMap[key] = [];
    excelMap[key].push(xl);
  });

  // Спариваем их 1 к 1
  const allKeys = new Set([...Object.keys(schedMap), ...Object.keys(excelMap)]);
  
  allKeys.forEach(key => {
    const sList = schedMap[key] || [];
    const eList = excelMap[key] || [];
    const maxLen = Math.max(sList.length, eList.length);

    for (let i = 0; i < maxLen; i++) {
      const sEv = sList[i];
      const eEv = eList[i];

      if (sEv && eEv) {
        const sPrice = getEffectivePrice(sEv, daysOfWeek[sEv.customDayIndex]);
        const sStatus = getEventStatus(sEv);
        const priceDiff = Math.abs(sPrice - eEv.price) > 0.5;
        const statusDiff = sStatus !== eEv.status;
        
        const item = {
          excel: eEv, schedule: sEv,
          schedulePrice: sPrice, excelPrice: eEv.price,
          scheduleStatus: sStatus, excelStatus: eEv.status,
          match: { label: `Пара по порядку (№${i+1} за день)` },
          apply: priceDiff || statusDiff
        };

        if (priceDiff) result.price_mismatch.push(item);
        else result.ok.push(item);

      } else if (sEv && !eEv) {
        result.missing_in_excel.push({
          schedule: sEv,
          schedulePrice: getEffectivePrice(sEv, daysOfWeek[sEv.customDayIndex]),
          scheduleStatus: getEventStatus(sEv),
          apply: false
        });
      } else if (!sEv && eEv) {
        result.missing_in_schedule.push({ excel: eEv, apply: false });
      }
    }
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

  // Расчет итогов системы для нового блока сравнения
  let sysItc = 0;
  let sysZero = 0;
  getMonthScheduleEvents().forEach(ev => {
    const st = getEventStatus(ev);
    if(st !== 'canceled') {
      const p = getEffectivePrice(ev, daysOfWeek[ev.customDayIndex]);
      if (ev.school === 'ITCompot') sysItc += p;
      else if (ev.school === 'Zerocoder') sysZero += p;
    }
  });

  const sectionsEl = document.getElementById('recon-sections');
  sectionsEl.innerHTML = '';

  // Вставляем блок анализа итогов
  const analysisHtml = `
    <div style="background: var(--bg-main); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px;">
      <h4 style="margin: 0 0 10px 0; color: #f59e0b; font-size: 1.1rem;">📊 Анализ ЗП (Excel vs Система)</h4>
      <div style="display: flex; flex-direction: column; gap: 8px; font-family: monospace; font-size: 0.95rem;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 5px;">
          <span><strong>ITCompot (База):</strong> Excel: ${excelManualStats.itcBase} ₽ | Расчет сайта: ${sysItc} ₽</span>
          <span>${excelManualStats.itcBase === sysItc ? '✅ <span style="color:#10b981">Сходится</span>' : '❌ <span style="color:#ef4444; font-weight:bold;">Расхождение</span>'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span><strong>Zerocoder (Итог):</strong> Excel: ${excelManualStats.zeroTotal} ₽ | Расчет сайта: ${sysZero} ₽</span>
          <span>${excelManualStats.zeroTotal === sysZero ? '✅ <span style="color:#10b981">Сходится</span>' : '❌ <span style="color:#ef4444; font-weight:bold;">Расхождение</span>'}</span>
        </div>
      </div>
    </div>
  `;
  sectionsEl.insertAdjacentHTML('beforeend', analysisHtml);

  const renderRows = (items, type) => {
    if (!items.length) return '';
    const titleMap = {
      missing_in_excel: '🔴 В расписании, но НЕТ в Excel (не заплатили)',
      missing_in_schedule: '🟠 В Excel, но НЕТ в расписании',
      price_mismatch: '🟡 Суммы не сходятся',
      ok: '✅ Совпадения'
    };
    let rows = items.map((item, idx) => {
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