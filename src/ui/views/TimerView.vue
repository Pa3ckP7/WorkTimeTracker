<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
const manager = ref<Awaited<ReturnType<typeof getProfile>> | null>(null)
let activeLoadId = 0
let ticker: number | null = null

const selectedProfile = computed(() =>
  profiles.value.find((profile) => profile.id === selectedProfileId.value) ?? null,
)

watch(selectedProfileId, async (id) => {
  const loadId = ++activeLoadId

  if (id === null) {
    manager.value = null
    history.value = []
    runningTime.value = null
    stopTicker()
    return
  }

  try {
    const nextManager = await getProfile(id)
    if (loadId !== activeLoadId) return

    manager.value = nextManager
    await loadSelectedProfileData(loadId)
  } catch (error) {
    if (loadId !== activeLoadId) return
    setError(error)
  }
})

const elapsedSeconds = computed(() => {
  if (!runningTime.value) return 0
  return Math.floor((Date.now() - runningTime.value.startDate.getTime()) / 1000)
})

const hasActiveTimer = computed(() => runningTime.value !== null)

const formattedElapsed = computed(() => formatDuration(elapsedSeconds.value))

const timerButtonLabel = computed(() => (hasActiveTimer.value ? 'Stop' : 'Start'))

const timerButtonClass = computed(() => (hasActiveTimer.value ? 'btn-danger' : 'btn-primary'))

const lastEntry = computed(() => history.value[0] ?? null)

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

async function loadSelectedProfileData(loadId = activeLoadId): Promise<void> {
  history.value = []
  runningTime.value = null
  stopTicker()

  if (!manager.value) return

  try {
    runningTime.value = await manager.value.getTime()
    if (loadId !== activeLoadId) return
    startTicker()
  } catch {
    if (loadId !== activeLoadId) return
    runningTime.value = null
  }

  const nextHistory = await manager.value.getTimeHistory()
  if (loadId !== activeLoadId) return
  history.value = nextHistory
}

async function initialize(): Promise<void> {
  isBusy.value = true
  clearError()
  try {
    await refreshProfiles()
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
  } catch (error) {
    setError(error)
  } finally {
    isBusy.value = false
  }
}

async function selectProfile(profileId: number): Promise<void> {
  if (selectedProfileId.value === profileId) return
  selectedProfileId.value = profileId
}

async function startTimer(): Promise<void> {
  if (!manager.value) return

  isBusy.value = true
  clearError()
  try {
    await manager.value.startTimer()
    await loadSelectedProfileData()
  } catch (error) {
    setError(error)
  } finally {
    isBusy.value = false
  }
}

async function stopTimer(): Promise<void> {
  if (!manager.value) return

  isBusy.value = true
  clearError()
  try {
    await manager.value.stopTimer()
    await loadSelectedProfileData()
  } catch (error) {
    setError(error)
  } finally {
    isBusy.value = false
  }
}

async function toggleTimer(): Promise<void> {
  if (hasActiveTimer.value) {
    await stopTimer()
    return
  }

  await startTimer()
}

onMounted(async () => {
  await initialize()
})

onBeforeUnmount(() => {
  stopTicker()
})
</script>

<template>
  <section class="screen">
    <p class="screen-label">Main Timer</p>

    <section class="panel controls-panel">
      <div class="profile-section">
        <p class="label">Profiles</p>
        <div class="profile-list">
          <button
            v-for="profile in profiles"
            :key="profile.id"
            :disabled="isBusy"
            :class="['profile-button', 'btn-soft', { active: profile.id === selectedProfileId }]"
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
        <button class="btn-primary" :disabled="isBusy || !newProfileName.trim()" @click="addProfile">
          Add
        </button>
      </div>
    </section>

    <section class="timer-stage card-surface">
      <div :class="['timer-circle', { active: hasActiveTimer }]">
        <p class="timer-circle-label">{{ selectedProfile?.name ?? 'No profile selected' }}</p>
        <p class="timer-circle-time">{{ formattedElapsed }}</p>
        <p class="timer-circle-status">{{ hasActiveTimer ? 'Running' : 'Ready to start' }}</p>
      </div>

      <button
        :class="['timer-main-btn', timerButtonClass]"
        :disabled="isBusy || selectedProfileId === null"
        @click="toggleTimer"
      >
        {{ timerButtonLabel }}
      </button>
      <p class="muted timer-hint">
        {{
          selectedProfileId === null
            ? 'Select a profile to enable timer actions.'
            : 'One tap to start or stop tracking.'
        }}
      </p>
    </section>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <section class="panel last-entry">
      <h2>Last Logged Entry</h2>
      <p v-if="lastEntry">
        {{ formatDate(lastEntry.startDate) }} at {{ formatDuration(lastEntry.seconds) }}
      </p>
      <p v-else class="muted">No completed sessions yet.</p>
    </section>
  </section>
</template>

<style scoped>
.controls-panel {
  gap: 0.95rem;
}

.profile-section {
  display: grid;
  gap: 0.6rem;
}

.new-profile {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr auto;
}

.label {
  margin: 0;
  font-weight: 700;
  color: var(--text-muted);
}

.profile-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.profile-button {
  border-radius: 999px;
  min-width: 72px;
}

.profile-button.active {
  color: var(--primary);
  border-color: color-mix(in srgb, var(--primary), white 62%);
  background: color-mix(in srgb, var(--primary), white 88%);
}

.timer-stage {
  padding: 1.2rem 1rem;
  display: grid;
  justify-items: center;
  gap: 1rem;
}

.timer-circle {
  width: min(78vw, 290px);
  height: min(78vw, 290px);
  border-radius: 50%;
  background: radial-gradient(
    circle at 28% 22%,
    var(--timer-face-start),
    var(--timer-face-mid) 62%,
    var(--timer-face-end) 100%
  );
  border: 4px solid var(--timer-ring);
  box-shadow:
    inset 0 0 0 8px color-mix(in srgb, var(--timer-ring), transparent 72%),
    0 22px 34px rgba(0, 0, 0, 0.22);
  display: grid;
  place-content: center;
  text-align: center;
  padding: 1rem;
  gap: 0.3rem;
}

.timer-circle.active {
  border-color: var(--timer-ring-active);
  box-shadow:
    inset 0 0 0 8px color-mix(in srgb, var(--timer-ring-active), transparent 72%),
    0 24px 38px rgba(20, 110, 78, 0.22);
}

.timer-circle-label,
.timer-circle-status,
.timer-hint {
  margin: 0;
}

.timer-circle-label {
  font-size: 0.9rem;
  color: var(--timer-muted);
  font-weight: 700;
}

.timer-circle-time {
  margin: 0;
  font-size: clamp(1.9rem, 7vw, 2.4rem);
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--timer-text);
}

.timer-circle-status {
  font-size: 0.84rem;
  color: var(--timer-muted);
  font-weight: 700;
}

.timer-main-btn {
  width: min(280px, 92%);
  min-height: 52px;
  font-size: 1.05rem;
  border-radius: 999px;
}

.timer-hint {
  text-align: center;
  font-size: 0.9rem;
}
</style>
