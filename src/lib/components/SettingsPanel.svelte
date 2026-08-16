<script>
  const SETTINGS_KEY = 'bminder_settings';
  const REMINDER_LABELS = {
    month: 'За месяц (30 дней)',
    week: 'За неделю (7 дней)',
    '3days': 'За 3 дня',
    '1day': 'За 1 день',
    today: 'В день рождения'
  };
  const DEFAULT_SETTINGS = { reminders: ['today'], time: '09:00' };

  let { ontoast } = $props();

  function loadSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  const initial = loadSettings();
  let reminders = $state([...initial.reminders]);
  let time = $state(initial.time);

  const preview = $derived.by(() => {
    const order = ['month', 'week', '3days', '1day', 'today'];
    return order.filter((key) => reminders.includes(key));
  });

  function toggleReminder(value, checked) {
    if (checked) {
      reminders = [...reminders, value];
    } else {
      reminders = reminders.filter((item) => item !== value);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (reminders.length === 0) {
      ontoast('Выберите хотя бы один вариант оповещения');
      return;
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ reminders, time }));
    ontoast('Настройки сохранены', 'success');
  }
</script>

<div class="card">
  <h2 class="card__title">Настройки оповещений</h2>
  <p class="card__desc">Выберите, когда и во сколько напоминать о днях рождения</p>

  <form onsubmit={handleSubmit}>
    <fieldset class="fieldset">
      <legend class="fieldset__legend">Когда напоминать</legend>
      <p class="fieldset__hint">Можно выбрать несколько вариантов</p>

      <ul class="checkbox-list">
        {#each [
          { value: 'month', label: 'За месяц', desc: '30 дней до дня рождения' },
          { value: 'week', label: 'За неделю', desc: '7 дней до дня рождения' },
          { value: '3days', label: 'За 3 дня', desc: '3 дня до дня рождения' },
          { value: '1day', label: 'За день', desc: '1 день до дня рождения' },
          { value: 'today', label: 'В день рождения', desc: 'Утром в день праздника' }
        ] as item}
          <li class="checkbox-item">
            <label class="checkbox">
              <input
                type="checkbox"
                name="reminder"
                value={item.value}
                checked={reminders.includes(item.value)}
                onchange={(e) => toggleReminder(item.value, e.currentTarget.checked)}
              />
              <span class="checkbox__box"></span>
              <span class="checkbox__content">
                <span class="checkbox__label">{item.label}</span>
                <span class="checkbox__desc">{item.desc}</span>
              </span>
            </label>
          </li>
        {/each}
      </ul>
    </fieldset>

    <div class="field field--time">
      <label class="field__label" for="reminderTime">Время напоминания</label>
      <input class="field__input field__input--time" type="time" id="reminderTime" bind:value={time} />
      <span class="field__hint">Все выбранные оповещения будут приходить в это время</span>
    </div>

    <div class="form-actions">
      <button class="btn btn--primary" type="submit">Сохранить настройки</button>
    </div>
  </form>
</div>

<div class="card card--preview">
  <h3 class="card__subtitle">Предпросмотр расписания</h3>
  <ul class="preview-list">
    {#if preview.length === 0}
      <li>Выберите хотя бы один вариант оповещения</li>
    {:else}
      {#each preview as key}
        <li><strong>{REMINDER_LABELS[key]}</strong> — в {time || '09:00'}</li>
      {/each}
    {/if}
  </ul>
</div>
