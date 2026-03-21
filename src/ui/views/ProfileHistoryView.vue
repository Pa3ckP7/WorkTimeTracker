<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProfile, getProfileList, getTimer, type Profile, type TimeResult } from '@core'

interface HistoryEntry {
  id: string
  timerId: number
  startDate: Date
  endDate: Date
  seconds: number
}

const route = useRoute()
const profileId = computed(() => Number(route.params.profileId))

const profile = ref<Profile | null>(null)
const entries = ref<HistoryEntry[]>([])
const selectedRange = ref<'today' | 'last7' | 'last30' | 'all'>('all')
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const editEntryId = ref<string | null>(null)
const editDate = ref('')
const editStartTime = ref('')
const editEndTime = ref('')
const editError = ref('')
let activeLoadId = 0

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
    return (
      rangeStartDate.value === null || entry.startDate.getTime() >= rangeStartDate.value.getTime()
    )
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

function formatEntryRange(entry: HistoryEntry): string {
  return `${formatEntryTime(entry.startDate)} - ${formatEntryTime(entry.endDate)}`
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toTimeInputValue(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function buildDateTime(dateValue: string, timeValue: string): Date {
  return new Date(`${dateValue}T${timeValue}:00`)
}

function clearError(): void {
  errorMessage.value = ''
}

function setError(error: unknown): void {
  errorMessage.value =
    error instanceof Error ? error.message : 'Unexpected error while loading history'
}

function clearEditState(): void {
  editEntryId.value = null
  editDate.value = ''
  editStartTime.value = ''
  editEndTime.value = ''
  editError.value = ''
}

function startEditing(entry: HistoryEntry): void {
  editEntryId.value = entry.id
  editDate.value = toDateInputValue(entry.startDate)
  editStartTime.value = toTimeInputValue(entry.startDate)
  editEndTime.value = toTimeInputValue(entry.endDate)
  editError.value = ''
}

async function loadHistory(loadId = ++activeLoadId): Promise<void> {
  isLoading.value = true
  clearError()

  try {
    const profileList = await getProfileList()
    if (loadId !== activeLoadId) return

    profile.value = profileList.find((item) => item.id === profileId.value) ?? null

    const manager = await getProfile(profileId.value)
    if (loadId !== activeLoadId) return

    const history = await manager.getTimeHistory()
    if (loadId !== activeLoadId) return

    entries.value = history
      .filter((entry) => entry.endDate !== null)
      .map<HistoryEntry>((entry: TimeResult) => ({
        id: `${profileId.value}-${entry.id}`,
        timerId: entry.id,
        startDate: entry.startDate,
        endDate: entry.endDate as Date,
        seconds: entry.seconds,
      }))
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
  } catch (error) {
    setError(error)
  } finally {
    isLoading.value = false
  }
}

async function saveEntryEdit(): Promise<void> {
  if (editEntryId.value === null) return

  const entry = entries.value.find((item) => item.id === editEntryId.value)
  if (!entry) return

  editError.value = ''

  if (!editDate.value || !editStartTime.value || !editEndTime.value) {
    editError.value = 'Date, start time, and end time are required.'
    return
  }

  const startDate = buildDateTime(editDate.value, editStartTime.value)
  const endDate = buildDateTime(editDate.value, editEndTime.value)

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    editError.value = 'Enter a valid date and time.'
    return
  }

  if (endDate <= startDate) {
    editError.value = 'End time must be after start time.'
    return
  }

  isSaving.value = true
  clearError()

  try {
    const timer = await getTimer(entry.timerId)
    await timer.editTimer({
      startDate,
      endDate,
    })
    await loadHistory()
    clearEditState()
  } catch (error) {
    editError.value = error instanceof Error ? error.message : 'Failed to save entry.'
  } finally {
    isSaving.value = false
  }
}

watch(
  profileId,
  async () => {
    await loadHistory()
  },
  { immediate: true },
)
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

      <p v-if="isLoading">Loading history...</p>
      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-else-if="groupedEntries.length === 0">No history entries in this filter.</p>

      <div v-else class="group-list">
        <section v-for="group in groupedEntries" :key="group.dayKey" class="group">
          <h3>{{ group.displayDate }}</h3>
          <ul>
            <li v-for="entry in group.entries" :key="entry.id">
              <div>
                <p class="entry-time">{{ formatEntryRange(entry) }}</p>
              </div>
              <div class="entry-right">
                <strong>{{ formatDuration(entry.seconds) }}</strong>
                <button class="edit-btn btn-soft" :disabled="isSaving" @click="startEditing(entry)">
                  Edit
                </button>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </section>

    <div v-if="editEntryId" class="modal-backdrop" @click="clearEditState">
      <section class="panel modal-panel" @click.stop>
        <div class="summary-row">
          <h2>Edit Entry</h2>
          <button class="btn-soft close-btn" :disabled="isSaving" @click="clearEditState">Close</button>
        </div>

        <div class="edit-grid">
          <label>
            Date
            <input v-model="editDate" type="date" :disabled="isSaving" />
          </label>
          <label>
            Start time
            <input v-model="editStartTime" type="time" :disabled="isSaving" />
          </label>
          <label>
            End time
            <input v-model="editEndTime" type="time" :disabled="isSaving" />
          </label>
        </div>

        <p v-if="editError" class="error">{{ editError }}</p>

        <div class="edit-actions">
          <button class="btn-primary" :disabled="isSaving" @click="saveEntryEdit">Save changes</button>
          <button class="btn-soft" :disabled="isSaving" @click="clearEditState">Cancel</button>
        </div>
      </section>
    </div>
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

.entry-right {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex: 0 0 auto;
}

.edit-btn,
.close-btn {
  padding: 0.42rem 0.62rem;
  font-size: 0.82rem;
  min-width: 64px;
}

.entry-time,
.error {
  margin: 0;
}

.entry-time {
  color: var(--text-muted);
}

.edit-grid {
  display: grid;
  gap: 0.65rem;
}

.edit-actions {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(12, 16, 24, 0.56);
  display: grid;
  align-items: end;
  padding: 1rem;
}

.modal-panel {
  width: min(100%, 520px);
  margin: 0 auto;
  max-height: min(80vh, 560px);
  overflow: auto;
}
</style>
