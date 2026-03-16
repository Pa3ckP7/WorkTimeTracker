<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getProfile, getProfileList, type Profile, type TimeResult } from '@core'

interface HistoryEntry {
  id: string
  startDate: Date
  seconds: number
}

const route = useRoute()
const profileId = computed(() => Number(route.params.profileId))

const profile = ref<Profile | null>(null)
const entries = ref<HistoryEntry[]>([])
const selectedRange = ref<'today' | 'last7' | 'last30' | 'all'>('last30')
const isLoading = ref(false)
const errorMessage = ref('')

const rangeStartDate = computed(() => {
  if (selectedRange.value === 'all') return null

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (selectedRange.value === 'today') return startOfToday

  const days = selectedRange.value === 'last7' ? 7 : 30
  const start = new Date(startOfToday)
  start.setDate(start.getDate() - (days - 1))
  return start
})

const filteredEntries = computed(() => {
  return entries.value.filter((entry) => {
    return rangeStartDate.value === null || entry.startDate.getTime() >= rangeStartDate.value.getTime()
  })
})

const groupedEntries = computed(() => {
  const groups = new Map<string, HistoryEntry[]>()

  for (const entry of filteredEntries.value) {
    const key = formatDayKey(entry.startDate)
    const existing = groups.get(key) ?? []
    existing.push(entry)
    groups.set(key, existing)
  }

  return Array.from(groups.entries()).map(([dayKey, dayEntries]) => ({
    dayKey,
    displayDate: formatGroupDate(dayEntries[0].startDate),
    entries: dayEntries,
  }))
})

const totalDuration = computed(() => {
  const totalSeconds = filteredEntries.value.reduce((sum, entry) => sum + entry.seconds, 0)
  return formatDuration(totalSeconds)
})

function formatDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatGroupDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatEntryTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}

function clearError(): void {
  errorMessage.value = ''
}

function setError(error: unknown): void {
  errorMessage.value = error instanceof Error ? error.message : 'Unexpected error while loading history'
}

async function loadHistory(): Promise<void> {
  isLoading.value = true
  clearError()

  try {
    const profileList = await getProfileList()
    profile.value = profileList.find((item) => item.id === profileId.value) ?? null

    const manager = await getProfile(profileId.value)
    const history = await manager.getTimeHistory()
    entries.value = history
      .map<HistoryEntry>((entry: TimeResult, index) => ({
        id: `${profileId.value}-${entry.startDate.toISOString()}-${entry.seconds}-${index}`,
        startDate: entry.startDate,
        seconds: entry.seconds,
      }))
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
  } catch (error) {
    setError(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadHistory()
})
</script>

<template>
  <section class="screen">
    <p class="screen-label">Profile History</p>

    <section class="panel filters">
      <h2>{{ profile?.name ?? 'Profile' }}</h2>
      <div class="row">
        <label for="range">Date range</label>
        <select id="range" v-model="selectedRange">
          <option value="today">Today</option>
          <option value="last7">Last 7 days</option>
          <option value="last30">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>
    </section>

    <section class="panel">
      <div class="summary-row">
        <h2>Entries</h2>
        <strong>{{ totalDuration }}</strong>
      </div>

      <p v-if="isLoading">Loading history…</p>
      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-else-if="groupedEntries.length === 0">No history entries in this filter.</p>

      <div v-else class="group-list">
        <section v-for="group in groupedEntries" :key="group.dayKey" class="group">
          <h3>{{ group.displayDate }}</h3>
          <ul>
            <li v-for="entry in group.entries" :key="entry.id">
              <p class="entry-time">{{ formatEntryTime(entry.startDate) }}</p>
              <strong>{{ formatDuration(entry.seconds) }}</strong>
            </li>
          </ul>
        </section>
      </div>
    </section>
  </section>
</template>

<style scoped>
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.summary-row strong {
  font-size: 1rem;
  color: var(--primary);
}

.filters .row {
  display: grid;
  gap: 0.35rem;
}

.group-list {
  display: grid;
  gap: 0.75rem;
}

.group {
  display: grid;
  gap: 0.5rem;
}

.group h3 {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.group ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.4rem;
}

.group li {
  border: 1px solid var(--border);
  border-radius: 0.65rem;
  background: var(--surface-soft);
  padding: 0.55rem 0.7rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
}

.entry-time,
.error {
  margin: 0;
  color: var(--text-muted);
}
</style>
