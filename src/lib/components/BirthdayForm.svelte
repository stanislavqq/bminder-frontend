<script>
  import { isValidDate, MONTH_OPTIONS } from '../dates.js';

  let { editing = null, submitting = false, onsave, oncancel } = $props();

  let firstName = $state('');
  let lastName = $state('');
  let day = $state('');
  let month = $state('');
  let year = $state('');
  let comment = $state('');
  let errors = $state({});

  const isEdit = $derived(Boolean(editing));
  let appliedKey;

  $effect.pre(() => {
    const person = editing;
    const key = person?.id ?? 'new';
    if (appliedKey === key) return;
    appliedKey = key;
    firstName = person?.firstName ?? '';
    lastName = person?.lastName ?? '';
    day = person?.day ?? '';
    month = person?.month ?? '';
    year = person?.year ?? '';
    comment = person?.comment ?? '';
    errors = {};
  });

  function validate() {
    const next = {};
    const dayNum = Number(day);
    const monthNum = Number(month);
    const yearNum = year ? Number(year) : null;

    if (!firstName.trim()) next.firstName = 'Введите имя';
    if (!lastName.trim()) next.lastName = 'Введите фамилию';

    if (!day || dayNum < 1 || dayNum > 31) next.day = 'Укажите день (1–31)';
    if (!monthNum) next.month = 'Выберите месяц';

    if (!next.day && !next.month && !isValidDate(dayNum, monthNum, yearNum)) {
      next.day = 'Некорректная дата для выбранного месяца';
    }

    if (year && (yearNum < 1900 || yearNum > 2100)) next.year = 'Год от 1900 до 2100';

    errors = next;
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    onsave({
      firstName,
      lastName,
      day: Number(day),
      month: Number(month),
      year: year ? Number(year) : null,
      comment
    });
  }
</script>

<div class="card card--form">
  <h2 class="card__title">{isEdit ? 'Редактирование' : 'Новая запись'}</h2>
  <p class="card__desc">Заполните данные о человеке и дате рождения</p>

  <form novalidate onsubmit={handleSubmit}>
    <div class="form-row">
      <div class="field">
        <label class="field__label" for="firstName">Имя <span class="required">*</span></label>
        <input
          class="field__input"
          class:field__input--invalid={Boolean(errors.firstName)}
          type="text"
          id="firstName"
          maxlength="50"
          placeholder="Иван"
          bind:value={firstName}
        />
        <span class="field__error">{errors.firstName ?? ''}</span>
      </div>
      <div class="field">
        <label class="field__label" for="lastName">Фамилия <span class="required">*</span></label>
        <input
          class="field__input"
          class:field__input--invalid={Boolean(errors.lastName)}
          type="text"
          id="lastName"
          maxlength="50"
          placeholder="Петров"
          bind:value={lastName}
        />
        <span class="field__error">{errors.lastName ?? ''}</span>
      </div>
    </div>

    <fieldset class="fieldset">
      <legend class="fieldset__legend">Дата рождения <span class="required">*</span></legend>
      <div class="form-row form-row--date">
        <div class="field field--sm">
          <label class="field__label" for="day">День</label>
          <input
            class="field__input"
            class:field__input--invalid={Boolean(errors.day)}
            type="number"
            id="day"
            min="1"
            max="31"
            placeholder="15"
            bind:value={day}
          />
          <span class="field__error">{errors.day ?? ''}</span>
        </div>
        <div class="field field--sm">
          <label class="field__label" for="month">Месяц</label>
          <select
            class="field__input field__select"
            class:field__input--invalid={Boolean(errors.month)}
            id="month"
            bind:value={month}
          >
            <option value="">—</option>
            {#each MONTH_OPTIONS as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          <span class="field__error">{errors.month ?? ''}</span>
        </div>
        <div class="field field--sm">
          <label class="field__label" for="year">Год</label>
          <input
            class="field__input"
            class:field__input--invalid={Boolean(errors.year)}
            type="number"
            id="year"
            min="1900"
            max="2100"
            placeholder="1990"
            bind:value={year}
          />
          {#if errors.year}
            <span class="field__error">{errors.year}</span>
          {:else}
            <span class="field__hint">Необязательно — для расчёта возраста</span>
          {/if}
        </div>
      </div>
    </fieldset>

    <div class="field">
      <label class="field__label" for="comment">Комментарий</label>
      <textarea
        class="field__input field__textarea"
        id="comment"
        rows="3"
        maxlength="300"
        placeholder="Подарок, пожелания, заметки…"
        bind:value={comment}
      ></textarea>
      <span class="field__hint">{comment.length} / 300</span>
    </div>

    <div class="form-actions">
      <button class="btn btn--primary" type="submit" disabled={submitting}>
        {submitting ? 'Сохранение…' : isEdit ? 'Обновить' : 'Сохранить'}
      </button>
      {#if isEdit}
        <button class="btn btn--ghost" type="button" onclick={oncancel}>Отмена</button>
      {/if}
    </div>
  </form>
</div>
