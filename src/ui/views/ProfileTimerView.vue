<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProfile, getProfileList, type Profile, type TimeResult } from '@core'

const route = useRoute()
const profileId = computed(() => Number(route.params.profileId))

const profile = ref<Profile | null>(null)
const manager = ref<Awaited<ReturnType<typeof getProfile>> | null>(null)
const runningTime = ref<TimeResult | null>(null)
const history = ref<TimeResult[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
let activeLoadId = 0
let ticker: number | null = null

watch(
  profileId,
  async (id) => {
    const loadId = ++activeLoadId
    clearError()

    try {
      const nextManager = await getProfile(id)
      if (loadId !== activeLoadId) return

      manager.value = nextManager
      await loadProfileData(loadId)
    } catch (error) {
      if (loadId !== activeLoadId) return
      setError(error)
    }
  },
  { immediate: true },
)

const elapsedSeconds = computed(() => {
  if (!runningTime.value) return 0
  return Math.floor((Date.now() - runningTime.value.startDate.getTime()) / 1000)
})

const hasActiveTimer = computed(() => runningTime.value !== null)
const formattedElapsed = computed(() => formatDuration(elapsedSeconds.value))
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

async function loadProfileData(loadId = activeLoadId): Promise<void> {
  if (!manager.value) return

  isLoading.value = true
  clearError()
  history.value = []
  runningTime.value = null
  stopTicker()

  try {
    const profileList = await getProfileList()
    if (loadId !== activeLoadId) return

    profile.value = profileList.find((item) => item.id === profileId.value) ?? null

    try {
      runningTime.value = await manager.value.getTime()
      if (loadId !== activeLoadId) return
      startTicker()
    } catch {
      if (loadId !== activeLoadId) return
      runningTime.value = null
    }

    history.value = await manager.value.getTimeHistory()
  } catch (error) {
    setError(error)
  } finally {
    isLoading.value = false
  }
}

async function toggleTimer(): Promise<void> {
  if (!manager.value) return

  isLoading.value = true
  clearError()

  try {
    if (hasActiveTimer.value) {
      await manager.value.stopTimer()
    } else {
      await manager.value.startTimer()
    }

    await loadProfileData()
  } catch (error) {
    setError(error)
  } finally {
    isLoading.value = false
  }
}

onBeforeUnmount(() => {
  stopTicker()
})
</script>

<template>
  <section class="screen">
    <p class="screen-label">Profile Timer</p>

    <section class="timer-stage card-surface">
      <div :class="['timer-circle', { active: hasActiveTimer }]">
        <p class="timer-circle-label">{{ profile?.name ?? 'Profile' }}</p>
        <p class="timer-circle-time">{{ formattedElapsed }}</p>
        <p class="timer-circle-status">{{ hasActiveTimer ? 'Running' : 'Ready to start' }}</p>
      </div>

      <button
        :class="hasActiveTimer ? 'timer-main-btn btn-danger' : 'timer-main-btn btn-primary'"
        :disabled="isLoading"
        @click="toggleTimer"
      >
        {{ hasActiveTimer ? 'Stop' : 'Start' }}
      </button>
    </section>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <section class="panel">
      <h2>Last Logged Entry</h2>
      <p v-if="lastEntry">{{ formatDate(lastEntry.startDate) }} at {{ formatDuration(lastEntry.seconds) }}</p>
      <p v-else class="muted">No completed sessions yet.</p>
    </section>
  </section>
</template>

<style scoped>
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
.timer-circle-status {
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
</style>
