<script setup lang="ts">
import { ref } from 'vue'

const showCurrency = ref(true)
const enablePaymentCalc = ref(true)
const reminders = ref(false)
</script>

<template>
  <section class="screen">
    <p class="screen-label">Settings</p>

    <section class="panel">
      <h2>Preferences</h2>
      <label class="toggle-row">
        <span>Show currency</span>
        <input v-model="showCurrency" type="checkbox" />
      </label>
      <label class="toggle-row">
        <span>Enable payment calculations</span>
        <input v-model="enablePaymentCalc" type="checkbox" />
      </label>
      <label class="toggle-row">
        <span>Reminder feature (future)</span>
        <input v-model="reminders" type="checkbox" />
      </label>
    </section>

    <section class="panel">
      <h2>About</h2>
      <p>WorkTimeTracker mobile MVP settings.</p>
    </section>
  </section>
</template>

<style scoped>
.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.62rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-soft);
}

.toggle-row span {
  color: var(--text);
  font-weight: 600;
}

.toggle-row input {
  width: 18px;
  height: 18px;
}
</style>
