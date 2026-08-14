(function () {
  'use strict';

  const STORAGE_KEY = 'bminder_birthdays';
  const SETTINGS_KEY = 'bminder_settings';

  const MONTH_NAMES = [
    '', 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const REMINDER_LABELS = {
    month: 'За месяц (30 дней)',
    week: 'За неделю (7 дней)',
    '3days': 'За 3 дня',
    '1day': 'За 1 день',
    today: 'В день рождения'
  };

  const DEFAULT_SETTINGS = {
    reminders: ['today'],
    time: '09:00'
  };

  // --- State ---
  let birthdays = loadBirthdays();
  let settings = loadSettings();
  let deleteTargetId = null;

  // --- DOM refs ---
  const tabs = document.querySelectorAll('.tabs__btn');
  const panels = document.querySelectorAll('.panel');
  const birthdayList = document.getElementById('birthdayList');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const birthdayForm = document.getElementById('birthdayForm');
  const settingsForm = document.getElementById('settingsForm');
  const deleteModal = document.getElementById('deleteModal');
  const previewList = document.getElementById('previewList');
  const totalCount = document.getElementById('totalCount');
  const upcomingCount = document.getElementById('upcomingCount');

  // --- Storage ---
  function loadBirthdays() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveBirthdays() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(birthdays));
  }

  function loadSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  // --- Date helpers ---
  function daysInMonth(month, year) {
    if (!year) {
      const days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      return days[month - 1];
    }
    return new Date(year, month, 0).getDate();
  }

  function isValidDate(day, month, year) {
    if (!day || !month) return false;
    const maxDay = daysInMonth(Number(month), year ? Number(year) : 2000);
    return day >= 1 && day <= maxDay;
  }

  function getNextBirthday(day, month) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let year = now.getFullYear();
    let next = new Date(year, month - 1, day);
    if (next < now) {
      next = new Date(year + 1, month - 1, day);
    }
    return next;
  }

  function daysUntil(day, month) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const next = getNextBirthday(day, month);
    return Math.round((next - now) / (1000 * 60 * 60 * 24));
  }

  function isToday(day, month) {
    const now = new Date();
    return now.getDate() === Number(day) && now.getMonth() + 1 === Number(month);
  }

  function calcAge(day, month, year) {
    if (!year) return null;
    const now = new Date();
    let age = now.getFullYear() - Number(year);
    const hadBirthday =
      now.getMonth() + 1 > Number(month) ||
      (now.getMonth() + 1 === Number(month) && now.getDate() >= Number(day));
    if (!hadBirthday) age--;
    return age;
  }

  function formatDate(day, month, year) {
    let str = `${day} ${MONTH_NAMES[Number(month)]}`;
    if (year) str += ` ${year}`;
    return str;
  }

  function getInitials(firstName, lastName) {
    const f = (firstName || '?')[0].toUpperCase();
    const l = lastName ? lastName[0].toUpperCase() : '';
    return f + l;
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // --- Tabs ---
  function switchTab(tabId) {
    tabs.forEach(btn => {
      const active = btn.dataset.tab === tabId;
      btn.classList.toggle('tabs__btn--active', active);
      btn.setAttribute('aria-selected', active);
    });

    panels.forEach(panel => {
      const id = panel.id.replace('panel-', '');
      const active = id === tabId;
      panel.classList.toggle('panel--active', active);
      panel.hidden = !active;
    });
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll('[data-go-tab]').forEach(el => {
    el.addEventListener('click', () => switchTab(el.dataset.goTab));
  });

  // --- Toast ---
  function showToast(message, type = 'default') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'success' ? ' toast--success' : '');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // --- Render list ---
  function getFilteredBirthdays() {
    const query = searchInput.value.trim().toLowerCase();
    let list = [...birthdays];

    if (query) {
      list = list.filter(b => {
        const full = `${b.firstName} ${b.lastName || ''}`.toLowerCase();
        return full.includes(query);
      });
    }

    const sort = sortSelect.value;
    if (sort === 'date') {
      list.sort((a, b) => daysUntil(a.day, a.month) - daysUntil(b.day, b.month));
    } else if (sort === 'name') {
      list.sort((a, b) => {
        const nameA = `${a.lastName || ''} ${a.firstName}`.toLowerCase();
        const nameB = `${b.lastName || ''} ${b.firstName}`.toLowerCase();
        return nameA.localeCompare(nameB, 'ru');
      });
    } else {
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return list;
  }

  function renderList() {
    const list = getFilteredBirthdays();
    birthdayList.innerHTML = '';

    const upcoming = birthdays.filter(b => {
      const d = daysUntil(b.day, b.month);
      return d >= 0 && d <= 30;
    }).length;

    totalCount.textContent = birthdays.length;
    upcomingCount.textContent = upcoming;

    if (birthdays.length === 0) {
      emptyState.hidden = false;
      birthdayList.hidden = true;
      return;
    }

    emptyState.hidden = true;
    birthdayList.hidden = false;

    if (list.length === 0) {
      birthdayList.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:24px;">Ничего не найдено</p>';
      return;
    }

    list.forEach(b => {
      const days = daysUntil(b.day, b.month);
      const today = isToday(b.day, b.month);
      const age = calcAge(b.day, b.month, b.year);
      const fullName = [b.firstName, b.lastName].filter(Boolean).join(' ');

      const card = document.createElement('article');
      card.className = 'birthday-card';
      if (today) card.classList.add('birthday-card--today');
      else if (days <= 7) card.classList.add('birthday-card--soon');
      card.setAttribute('role', 'listitem');

      let badge = '';
      if (today) {
        badge = '<span class="birthday-card__badge birthday-card__badge--today">Сегодня!</span>';
      } else if (days === 1) {
        badge = '<span class="birthday-card__badge birthday-card__badge--soon">Завтра</span>';
      } else if (days <= 7) {
        badge = `<span class="birthday-card__badge birthday-card__badge--soon">Через ${days} дн.</span>`;
      }

      card.innerHTML = `
        <div class="birthday-card__avatar" aria-hidden="true">${getInitials(b.firstName, b.lastName)}</div>
        <div class="birthday-card__body">
          <div class="birthday-card__name">${escapeHtml(fullName)}</div>
          <div class="birthday-card__date">
            <span>${formatDate(b.day, b.month, b.year)}</span>
            ${badge}
            ${age !== null ? `<span class="birthday-card__age">${age} лет</span>` : ''}
          </div>
          ${b.comment ? `<div class="birthday-card__comment">${escapeHtml(b.comment)}</div>` : ''}
        </div>
        <div class="birthday-card__actions">
          <button class="icon-btn" type="button" data-edit="${b.id}" aria-label="Редактировать">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn icon-btn--danger" type="button" data-delete="${b.id}" aria-label="Удалить">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;

      birthdayList.appendChild(card);
    });

    birthdayList.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => startEdit(btn.dataset.edit));
    });

    birthdayList.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => openDeleteModal(btn.dataset.delete));
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Form ---
  function clearErrors() {
    document.querySelectorAll('.field__error').forEach(el => { el.textContent = ''; });
    document.querySelectorAll('.field__input--invalid').forEach(el => {
      el.classList.remove('field__input--invalid');
    });
  }

  function setError(field, message) {
    const input = document.getElementById(field);
    const errorEl = document.querySelector(`[data-error="${field}"]`);
    if (input) input.classList.add('field__input--invalid');
    if (errorEl) errorEl.textContent = message;
  }

  function validateForm() {
    clearErrors();
    let valid = true;

    const firstName = document.getElementById('firstName').value.trim();
    const day = Number(document.getElementById('day').value);
    const month = Number(document.getElementById('month').value);
    const yearVal = document.getElementById('year').value;
    const year = yearVal ? Number(yearVal) : null;

    if (!firstName) {
      setError('firstName', 'Введите имя');
      valid = false;
    }

    if (!day || day < 1 || day > 31) {
      setError('day', 'Укажите день (1–31)');
      valid = false;
    }

    if (!month) {
      setError('month', 'Выберите месяц');
      valid = false;
    }

    if (valid && !isValidDate(day, month, year)) {
      setError('day', 'Некорректная дата для выбранного месяца');
      valid = false;
    }

    if (year && (year < 1900 || year > 2100)) {
      document.getElementById('year').classList.add('field__input--invalid');
      valid = false;
    }

    return valid;
  }

  function resetForm() {
    birthdayForm.reset();
    document.getElementById('editId').value = '';
    document.getElementById('formTitle').textContent = 'Новая запись';
    document.getElementById('submitBtn').textContent = 'Сохранить';
    document.getElementById('cancelEditBtn').hidden = true;
    document.getElementById('commentCount').textContent = '0';
    clearErrors();
  }

  function startEdit(id) {
    const b = birthdays.find(x => x.id === id);
    if (!b) return;

    document.getElementById('editId').value = b.id;
    document.getElementById('firstName').value = b.firstName;
    document.getElementById('lastName').value = b.lastName || '';
    document.getElementById('day').value = b.day;
    document.getElementById('month').value = b.month;
    document.getElementById('year').value = b.year || '';
    document.getElementById('comment').value = b.comment || '';
    document.getElementById('commentCount').textContent = (b.comment || '').length;
    document.getElementById('formTitle').textContent = 'Редактирование';
    document.getElementById('submitBtn').textContent = 'Обновить';
    document.getElementById('cancelEditBtn').hidden = false;

    switchTab('add');
    document.getElementById('firstName').focus();
  }

  birthdayForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm()) return;

    const editId = document.getElementById('editId').value;
    const entry = {
      id: editId || generateId(),
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      day: Number(document.getElementById('day').value),
      month: Number(document.getElementById('month').value),
      year: document.getElementById('year').value ? Number(document.getElementById('year').value) : null,
      comment: document.getElementById('comment').value.trim(),
      createdAt: editId
        ? (birthdays.find(x => x.id === editId)?.createdAt || Date.now())
        : Date.now()
    };

    if (editId) {
      const idx = birthdays.findIndex(x => x.id === editId);
      if (idx !== -1) birthdays[idx] = entry;
      showToast('Запись обновлена', 'success');
    } else {
      birthdays.push(entry);
      showToast('Запись добавлена', 'success');
    }

    saveBirthdays();
    resetForm();
    renderList();
    switchTab('list');
  });

  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    resetForm();
    switchTab('list');
  });

  document.getElementById('comment').addEventListener('input', e => {
    document.getElementById('commentCount').textContent = e.target.value.length;
  });

  // --- Delete ---
  function openDeleteModal(id) {
    const b = birthdays.find(x => x.id === id);
    if (!b) return;
    deleteTargetId = id;
    const name = [b.firstName, b.lastName].filter(Boolean).join(' ');
    document.getElementById('deleteModalText').textContent =
      `Удалить «${name}»? Это действие нельзя отменить.`;
    deleteModal.showModal();
  }

  document.getElementById('deleteCancel').addEventListener('click', () => {
    deleteModal.close();
    deleteTargetId = null;
  });

  document.getElementById('deleteConfirm').addEventListener('click', () => {
    if (deleteTargetId) {
      birthdays = birthdays.filter(b => b.id !== deleteTargetId);
      saveBirthdays();
      renderList();
      showToast('Запись удалена');
    }
    deleteModal.close();
    deleteTargetId = null;
  });

  // --- Settings ---
  function applySettingsToForm() {
    document.querySelectorAll('input[name="reminder"]').forEach(cb => {
      cb.checked = settings.reminders.includes(cb.value);
    });
    document.getElementById('reminderTime').value = settings.time;
    updatePreview();
  }

  function updatePreview() {
    const checked = [...document.querySelectorAll('input[name="reminder"]:checked')];
    const time = document.getElementById('reminderTime').value || '09:00';

    if (checked.length === 0) {
      previewList.innerHTML = '<li>Выберите хотя бы один вариант оповещения</li>';
      return;
    }

    const order = ['month', 'week', '3days', '1day', 'today'];
    const sorted = checked.sort(
      (a, b) => order.indexOf(a.value) - order.indexOf(b.value)
    );

    previewList.innerHTML = sorted.map(cb => {
      const label = REMINDER_LABELS[cb.value];
      return `<li><strong>${label}</strong> — в ${time}</li>`;
    }).join('');
  }

  settingsForm.addEventListener('submit', e => {
    e.preventDefault();
    const reminders = [...document.querySelectorAll('input[name="reminder"]:checked')]
      .map(cb => cb.value);

    if (reminders.length === 0) {
      showToast('Выберите хотя бы один вариант оповещения');
      return;
    }

    settings = {
      reminders,
      time: document.getElementById('reminderTime').value
    };

    saveSettings();
    updatePreview();
    showToast('Настройки сохранены', 'success');
  });

  document.querySelectorAll('input[name="reminder"], #reminderTime').forEach(el => {
    el.addEventListener('change', updatePreview);
  });

  // --- Search & sort ---
  searchInput.addEventListener('input', renderList);
  sortSelect.addEventListener('change', renderList);

  // --- Demo data (first visit) ---
  function seedDemoData() {
    if (birthdays.length > 0) return;

    const now = new Date();
    const demo = [
      { firstName: 'Анна', lastName: 'Смирнова', day: now.getDate(), month: now.getMonth() + 1, year: 1995, comment: 'Любит книги и кофе' },
      { firstName: 'Дмитрий', lastName: 'Козлов', day: ((now.getDate() + 3 - 1) % 28) + 1, month: now.getMonth() + 1, year: 1988, comment: 'Коллега из отдела' },
      { firstName: 'Мария', lastName: 'Иванова', day: 15, month: 12, year: 2000, comment: 'Подруга детства' }
    ];

    birthdays = demo.map((d, i) => ({
      ...d,
      id: generateId() + i,
      createdAt: Date.now() - i * 1000
    }));

    saveBirthdays();
  }

  // --- Init ---
  seedDemoData();
  applySettingsToForm();
  renderList();
})();
