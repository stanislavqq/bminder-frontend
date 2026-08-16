<script>
  import { fullName } from '../dates.js';

  let { person = null, oncancel, onconfirm } = $props();
  let dialog = $state();

  $effect(() => {
    if (!dialog) return;
    if (person) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  });
</script>

<dialog class="modal" bind:this={dialog} onclose={oncancel}>
  <div class="modal__content">
    <h2 class="modal__title">Удалить запись?</h2>
    <p class="modal__text">
      {person ? `Удалить «${fullName(person)}»? Это действие нельзя отменить.` : 'Это действие нельзя отменить.'}
    </p>
    <div class="modal__actions">
      <button class="btn btn--ghost" type="button" onclick={oncancel}>Отмена</button>
      <button class="btn btn--danger" type="button" onclick={onconfirm}>Удалить</button>
    </div>
  </div>
</dialog>
