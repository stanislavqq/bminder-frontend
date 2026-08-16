<script>
  import { onMount } from 'svelte';
  import Header from './lib/components/Header.svelte';
  import BirthdayList from './lib/components/BirthdayList.svelte';
  import BirthdayForm from './lib/components/BirthdayForm.svelte';
  import SettingsPanel from './lib/components/SettingsPanel.svelte';
  import DeleteDialog from './lib/components/DeleteDialog.svelte';
  import * as api from './lib/api.js';
  import { daysUntil } from './lib/dates.js';

  const TABS = [
    { id: 'list', label: 'Список' },
    { id: 'add', label: 'Добавить' },
    { id: 'settings', label: 'Оповещения' }
  ];

  let people = $state([]);
  let loading = $state(true);
  let loadError = $state('');
  let activeTab = $state('list');
  let editing = $state(null);
  let deleteTarget = $state(null);
  let submitting = $state(false);
  let toasts = $state([]);
  let search = $state('');
  let sort = $state('date');

  const upcomingCount = $derived(
    people.filter((p) => {
      const d = daysUntil(p.day, p.month);
      return d >= 0 && d <= 30;
    }).length
  );

  function showToast(message, type = 'default') {
    const id = Date.now() + Math.random();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
    }, 3000);
  }

  async function loadPeople() {
    loading = true;
    loadError = '';
    try {
      const data = await api.fetchPeople();
      people = Array.isArray(data) ? data.map(api.fromApi) : [];
    } catch (err) {
      loadError = err.message || 'Не удалось загрузить данные';
    } finally {
      loading = false;
    }
  }

  function switchTab(tabId) {
    if (tabId !== 'add') editing = null;
    activeTab = tabId;
  }

  function startEdit(person) {
    editing = person;
    activeTab = 'add';
  }

  function cancelEdit() {
    editing = null;
    activeTab = 'list';
  }

  async function savePerson(entry) {
    submitting = true;
    try {
      const payload = api.toPayload(entry);
      if (editing) {
        const updated = await api.updatePerson(editing.id, payload);
        const mapped = api.fromApi(updated);
        people = people.map((p) => (p.id === mapped.id ? mapped : p));
        showToast('Запись обновлена', 'success');
      } else {
        const created = await api.createPerson(payload);
        people = [...people, api.fromApi(created)];
        showToast('Запись добавлена', 'success');
      }
      editing = null;
      activeTab = 'list';
    } catch (err) {
      showToast(err.message || 'Не удалось сохранить');
    } finally {
      submitting = false;
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    try {
      await api.deletePerson(id);
      people = people.filter((p) => p.id !== id);
      showToast('Запись удалена');
    } catch (err) {
      showToast(err.message || 'Не удалось удалить');
    } finally {
      deleteTarget = null;
    }
  }

  onMount(loadPeople);
</script>

<div class="app">
  <Header total={people.length} upcoming={upcomingCount} />

  <div class="tabs" role="tablist" aria-label="Разделы приложения">
    {#each TABS as tab}
      <button
        class="tabs__btn"
        class:tabs__btn--active={activeTab === tab.id}
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls="panel-{tab.id}"
        id="tab-{tab.id}"
        type="button"
        onclick={() => switchTab(tab.id)}
      >
        {#if tab.id === 'list'}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
        {:else if tab.id === 'add'}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
        {:else}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        {/if}
        {tab.label}
      </button>
    {/each}
  </div>

  <main class="main">
    {#if activeTab === 'list'}
      <section class="panel panel--active" id="panel-list" aria-labelledby="tab-list">
        {#if loadError}
          <div class="error-banner">
            <span>{loadError}</span>
            <button class="btn btn--ghost" type="button" onclick={loadPeople}>Повторить</button>
          </div>
        {/if}

        {#if loading}
          <div class="loading">
            <div class="spinner" aria-hidden="true"></div>
            <p>Загрузка записей…</p>
          </div>
        {:else}
          <BirthdayList
            {people}
            bind:search
            bind:sort
            onedit={startEdit}
            ondelete={(person) => (deleteTarget = person)}
            onadd={() => switchTab('add')}
          />
        {/if}
      </section>
    {:else if activeTab === 'add'}
      <section class="panel panel--active" id="panel-add" aria-labelledby="tab-add">
        <BirthdayForm
          {editing}
          {submitting}
          onsave={savePerson}
          oncancel={cancelEdit}
        />
      </section>
    {:else}
      <section class="panel panel--active" id="panel-settings" aria-labelledby="tab-settings">
        <SettingsPanel ontoast={showToast} />
      </section>
    {/if}
  </main>

  <div class="toast-container" aria-live="polite">
    {#each toasts as toast (toast.id)}
      <div class="toast" class:toast--success={toast.type === 'success'}>{toast.message}</div>
    {/each}
  </div>
</div>

<DeleteDialog
  person={deleteTarget}
  oncancel={() => (deleteTarget = null)}
  onconfirm={confirmDelete}
/>
