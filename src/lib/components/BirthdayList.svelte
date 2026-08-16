<script>
  import { calcAge, daysUntil, formatDate, fullName, getInitials, isToday } from '../dates.js';

  let {
    people = [],
    search = $bindable(''),
    sort = $bindable('date'),
    onedit,
    ondelete,
    onadd
  } = $props();

  const filtered = $derived.by(() => {
    const query = search.trim().toLowerCase();
    let list = [...people];

    if (query) {
      list = list.filter((b) => fullName(b).toLowerCase().includes(query));
    }

    if (sort === 'date') {
      list.sort((a, b) => daysUntil(a.day, a.month) - daysUntil(b.day, b.month));
    } else if (sort === 'name') {
      list.sort((a, b) => {
        const nameA = `${a.lastName || ''} ${a.firstName}`.toLowerCase();
        const nameB = `${b.lastName || ''} ${b.firstName}`.toLowerCase();
        return nameA.localeCompare(nameB, 'ru');
      });
    } else {
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return list;
  });

  function daysLabel(days) {
    if (days === 1) return 'Завтра';
    return `Через ${days} дн.`;
  }
</script>

<div class="panel__toolbar">
  <div class="search">
    <svg class="search__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <input
      type="search"
      class="search__input"
      placeholder="Поиск по имени или фамилии…"
      autocomplete="off"
      bind:value={search}
    />
  </div>
  <select class="select" aria-label="Сортировка" bind:value={sort}>
    <option value="date">По дате (ближайшие)</option>
    <option value="name">По имени (А–Я)</option>
    <option value="created">По дате добавления</option>
  </select>
</div>

{#if people.length === 0}
  <div class="empty">
    <div class="empty__icon" aria-hidden="true">🎈</div>
    <h2 class="empty__title">Пока нет записей</h2>
    <p class="empty__text">Добавьте первый день рождения, чтобы начать получать напоминания</p>
    <button class="btn btn--primary" type="button" onclick={onadd}>Добавить запись</button>
  </div>
{:else if filtered.length === 0}
  <p class="empty-search">Ничего не найдено</p>
{:else}
  <div class="list" role="list">
    {#each filtered as person (person.id)}
      {@const days = daysUntil(person.day, person.month)}
      {@const today = isToday(person.day, person.month)}
      {@const age = calcAge(person.day, person.month, person.year)}
      <article
        class="birthday-card"
        class:birthday-card--today={today}
        class:birthday-card--soon={!today && days <= 7}
        role="listitem"
      >
        <div class="birthday-card__avatar" aria-hidden="true">{getInitials(person.firstName, person.lastName)}</div>
        <div class="birthday-card__body">
          <div class="birthday-card__name">{fullName(person)}</div>
          <div class="birthday-card__date">
            <span>{formatDate(person.day, person.month, person.year)}</span>
            {#if today}
              <span class="birthday-card__badge birthday-card__badge--today">Сегодня!</span>
            {:else if days <= 7}
              <span class="birthday-card__badge birthday-card__badge--soon">{daysLabel(days)}</span>
            {/if}
            {#if age !== null}
              <span class="birthday-card__age">{age} лет</span>
            {/if}
          </div>
          {#if person.comment}
            <div class="birthday-card__comment">{person.comment}</div>
          {/if}
        </div>
        <div class="birthday-card__actions">
          <button class="icon-btn" type="button" aria-label="Редактировать" onclick={() => onedit(person)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn icon-btn--danger" type="button" aria-label="Удалить" onclick={() => ondelete(person)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </article>
    {/each}
  </div>
{/if}
