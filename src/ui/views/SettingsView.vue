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
.screen {
  display: grid;
  gap: 0.85rem;
}

.screen-label {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.8;
}

.panel {
  border: 1px solid;
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  display: grid;
  gap: 0.65rem;
}

.panel h2,
.panel p {
  margin: 0;
}

.panel h2 {
  font-size: 1rem;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
</style>
