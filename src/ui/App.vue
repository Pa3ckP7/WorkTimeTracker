<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  createProfile,
  getProfile,
  getProfileList,
  type Profile,
  type TimeResult,
} from '@core'

const profiles = ref<Profile[]>([])
const selectedProfileId = ref<number | null>(null)
const newProfileName = ref('')
const runningTime = ref<TimeResult | null>(null)
const history = ref<TimeResult[]>([])
const errorMessage = ref('')
const isBusy = ref(false)
let ticker: number | null = null

const selectedProfile = computed(() =>
  profiles.value.find((profile) => profile.id === selectedProfileId.value) ?? null
)

const selectedManager = computed(() => {
  if (selectedProfileId.value === null) return null
  return getProfile(selectedProfileId.value)
})

const elapsedSeconds = computed(() => {
  if (!runningTime.value) return 0
  return Math.floor((Date.now() - runningTime.value.startDate.getTime()) / 1000)
})

const hasActiveTimer = computed(() => runningTime.value !== null)

const formattedElapsed = computed(() => formatDuration(elapsedSeconds.value))

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
}

function formatDate(date: Date): string {
  return date.toLocaleString()
}

function clearError(): void {
  errorMessage.value = ''
}

function setError(error: unknown): void {
  errorMessage.value = error instanceof Error ? error.message : 'Unexpected error'
}

function stopTicker(): void {
  if (ticker !== null) {
    window.clearInterval(ticker)
    ticker = null
  }
}

function startTicker(): void {
  stopTicker()
  ticker = window.setInterval(() => {
    if (!runningTime.value) {
      stopTicker()
      return
    }
    runningTime.value = { ...runningTime.value }
  }, 1000)
}

async function refreshProfiles(): Promise<void> {
  profiles.value = await getProfileList()
  if (profiles.value.length === 0) {
    const id = await createProfile('Default')
    profiles.value = await getProfileList()
    selectedProfileId.value = id
    return
  }

  if (!profiles.value.some((profile) => profile.id === selectedProfileId.value)) {
    selectedProfileId.value = profiles.value[0].id
  }
}

async function loadSelectedProfileData(): Promise<void> {
  history.value = []
  runningTime.value = null
  stopTicker()

  if (!selectedManager.value) return

  try {
    runningTime.value = await selectedManager.value.getTime()
    startTicker()
  } catch {
    runningTime.value = null
  }

  history.value = await selectedManager.value.getTimeHistory()
}

async function initialize(): Promise<void> {
  isBusy.value = true
  clearError()
  try {
    await refreshProfiles()
    await loadSelectedProfileData()
  } catch (error) {
    setError(error)
  } finally {
    isBusy.value = false
  }
}

async function addProfile(): Promise<void> {
  const trimmedName = newProfileName.value.trim()
  if (!trimmedName) return

  isBusy.value = true
  clearError()
  try {
    const id = await createProfile(trimmedName)
    newProfileName.value = ''
    await refreshProfiles()
    selectedProfileId.value = id
    await loadSelectedProfileData()
  } catch (error) {
    setError(error)
  } finally {
    isBusy.value = false
  }
}

async function selectProfile(profileId: number): Promise<void> {
  if (selectedProfileId.value === profileId) return

  selectedProfileId.value = profileId
  isBusy.value = true
  clearError()
  try {
    await loadSelectedProfileData()
  } catch (error) {
    setError(error)
  } finally {
    isBusy.value = false
  }
}

async function startTimer(): Promise<void> {
  if (!selectedManager.value) return

  isBusy.value = true
  clearError()
  try {
    await selectedManager.value.startTimer()
    runningTime.value = {
      seconds: 0,
      startDate: new Date(),
    }
    startTicker()
  } catch (error) {
    setError(error)
  } finally {
    isBusy.value = false
  }
}

async function stopTimer(): Promise<void> {
  if (!selectedManager.value) return

  isBusy.value = true
  clearError()
  try {
    const result = await selectedManager.value.stopTimer()
    runningTime.value = null
    stopTicker()
    history.value = [result, ...history.value]
  } catch (error) {
    setError(error)
  } finally {
    isBusy.value = false
  }
}

onMounted(async () => {
  await initialize()
})

onBeforeUnmount(() => {
  stopTicker()
})
</script>

<template>
  <main class="timer-page">
    <h1>Work Timer</h1>

    <div class="controls">
      <div>
        <p class="label">Profiles</p>
        <div class="profile-list">
          <button
            v-for="profile in profiles"
            :key="profile.id"
            :disabled="isBusy"
            :class="['profile-button', { active: profile.id === selectedProfileId }]"
            @click="selectProfile(profile.id)"
          >
            {{ profile.name }}
          </button>
        </div>
      </div>

      <div class="new-profile">
        <input
          v-model="newProfileName"
          :disabled="isBusy"
          placeholder="New profile name"
          @keyup.enter="addProfile"
        />
        <button :disabled="isBusy || !newProfileName.trim()" @click="addProfile">Add</button>
      </div>
    </div>

    <section class="timer-card">
      <p class="profile-name">{{ selectedProfile?.name ?? 'No profile selected' }}</p>
      <p class="elapsed">{{ formattedElapsed }}</p>

      <div class="timer-actions">
        <button :disabled="isBusy || hasActiveTimer || selectedProfileId === null" @click="startTimer">
          Start
        </button>
        <button :disabled="isBusy || !hasActiveTimer || selectedProfileId === null" @click="stopTimer">
          Stop
        </button>
      </div>
    </section>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <section>
      <h2>History</h2>
      <ul v-if="history.length > 0" class="history-list">
        <li v-for="entry in history" :key="`${entry.startDate.toISOString()}-${entry.seconds}`">
          <span>{{ formatDate(entry.startDate) }}</span>
          <strong>{{ formatDuration(entry.seconds) }}</strong>
        </li>
      </ul>
      <p v-else>No completed sessions yet.</p>
    </section>
  </main>
</template>

<style scoped>
.timer-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: grid;
  gap: 1rem;
}

.controls {
  display: grid;
  gap: 0.75rem;
}

.new-profile {
  display: grid;
  gap: 0.5rem;
}

.new-profile {
  grid-template-columns: 1fr auto;
}

.label {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.profile-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.profile-button {
  border: 1px solid;
  border-radius: 999px;
  background: transparent;
}

.profile-button.active {
  font-weight: 700;
}

input,
select,
button {
  padding: 0.5rem 0.75rem;
  font: inherit;
}

.timer-card {
  border: 1px solid;
  border-radius: 0.5rem;
  padding: 1rem;
  display: grid;
  gap: 0.75rem;
}

.profile-name {
  margin: 0;
  font-weight: 600;
}

.elapsed {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.timer-actions {
  display: flex;
  gap: 0.5rem;
}

.history-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.5rem;
}

.history-list li {
  border: 1px solid;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.error {
  margin: 0;
}
</style>
