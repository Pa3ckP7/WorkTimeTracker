<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getProfile, getProfileList, type Profile, type TimeResult } from '@core'

interface HistoryEntry {
  id: string
  profileId: number
  profileName: string
  startDate: Date
  seconds: number
}

const profiles = ref<Profile[]>([])
const entries = ref<HistoryEntry[]>([])
const selectedProfile = ref<'all' | number>('all')
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
    const matchesProfile =
      selectedProfile.value === 'all' || entry.profileId === selectedProfile.value
    const matchesDate =
      rangeStartDate.value === null || entry.startDate.getTime() >= rangeStartDate.value.getTime()

    return matchesProfile && matchesDate
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
    profiles.value = profileList

    const allEntries = (
      await Promise.all(
        profileList.map(async (profile) => {
          const history = await getProfile(profile.id).getTimeHistory()
          return history.map<HistoryEntry>((entry: TimeResult, index) => ({
            id: `${profile.id}-${entry.startDate.toISOString()}-${entry.seconds}-${index}`,
            profileId: profile.id,
            profileName: profile.name,
            startDate: entry.startDate,
            seconds: entry.seconds,
          }))
        })
      )
    ).flat()

    entries.value = allEntries.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
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
    <p class="screen-label">History</p>

    <section class="panel filters">
      <h2>Filters</h2>
      <div class="row">
        <label for="profile">Profile</label>
        <select id="profile" v-model="selectedProfile">
          <option value="all">All profiles</option>
          <option v-for="profile in profiles" :key="profile.id" :value="profile.id">
            {{ profile.name }}
          </option>
        </select>
      </div>
      <div class="row">
        <label for="range">Date range</label>
        <select id="range" v-model="selectedRange">
          <option value="today">Today</option>
          <option value="last7">Last 7 days</option>
          <option value="last30">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>
      <button class="refresh" :disabled="isLoading" @click="loadHistory">Refresh</button>
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
              <div>
                <p class="entry-profile">{{ entry.profileName }}</p>
                <p class="entry-time">{{ formatEntryTime(entry.startDate) }}</p>
              </div>
              <strong>{{ formatDuration(entry.seconds) }}</strong>
            </li>
          </ul>
        </section>
      </div>
    </section>

    <section class="panel">
      <h2>Next step</h2>
      <p>Entry editing and bulk tagging will be added in the next frontend phase.</p>
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
  gap: 0.55rem;
}

.panel h2,
.panel p {
  margin: 0;
}

.panel h2 {
  font-size: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.summary-row strong {
  font-size: 0.95rem;
}

.filters .row {
  display: grid;
  gap: 0.35rem;
}

.refresh {
  width: fit-content;
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
  opacity: 0.85;
}

.group ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.4rem;
}

.group li {
  border: 1px solid;
  border-radius: 0.65rem;
  padding: 0.55rem 0.7rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
}

.entry-profile,
.entry-time,
.error {
  margin: 0;
}

.entry-profile {
  font-weight: 600;
}

.entry-time {
  opacity: 0.8;
  font-size: 0.875rem;
}

select {
  padding: 0.5rem 0.75rem;
  font: inherit;
}

button {
  padding: 0.5rem 0.75rem;
  font: inherit;
}
</style>
