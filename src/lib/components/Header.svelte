<script>
  let { total = 0, upcoming = 0 } = $props();
</script>

<header class="header">
  <div class="header__brand">
    <span class="header__logo" aria-hidden="true">🎂</span>
    <div>
      <h1 class="header__title">Bminder</h1>
      <p class="header__subtitle">Управление днями рождения</p>
    </div>
  </div>
  <div class="header__stats">
    <span class="stat">
      <span class="stat__value">{total}</span>
      <span class="stat__label">всего</span>
    </span>
    <span class="stat stat--accent">
      <span class="stat__value">{upcoming}</span>
      <span class="stat__label">скоро</span>
    </span>
  </div>
</header>
