<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getProfile, getProfileList, type Profile, type TimeResult } from '@core'

interface ExportEntry {
  id: string
  profileId: number
  profileName: string
  startDate: Date
  seconds: number
}

const profiles = ref<Profile[]>([])
const entries = ref<ExportEntry[]>([])
const selectedProfileId = ref<number | null>(null)
const reportType = ref<'detailed' | 'summary'>('detailed')
const tagFilter = ref('')
const fromDate = ref('')
const toDate = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const generateMessage = ref('')

const fromDateObj = computed(() => {
  if (!fromDate.value) return null
  const date = new Date(fromDate.value)
  date.setHours(0, 0, 0, 0)
  return date
})

const toDateObj = computed(() => {
  if (!toDate.value) return null
  const date = new Date(toDate.value)
  date.setHours(23, 59, 59, 999)
  return date
})

const filteredEntries = computed(() => {
  return entries.value.filter((entry) => {
    const matchesProfile =
      selectedProfileId.value === null || entry.profileId === selectedProfileId.value
    const matchesFrom = fromDateObj.value === null || entry.startDate >= fromDateObj.value
    const matchesTo = toDateObj.value === null || entry.startDate <= toDateObj.value

    return matchesProfile && matchesFrom && matchesTo
  })
})

const entryCount = computed(() => filteredEntries.value.length)

const totalDuration = computed(() => {
  const totalSeconds = filteredEntries.value.reduce((sum, entry) => sum + entry.seconds, 0)
  return formatDuration(totalSeconds)
})

const canGenerate = computed(() => {
  return selectedProfileId.value !== null && fromDate.value.length > 0 && toDate.value.length > 0
})

const selectedProfileName = computed(() => {
  if (selectedProfileId.value === null) return 'No profile selected'
  return profiles.value.find((profile) => profile.id === selectedProfileId.value)?.name ?? 'Unknown profile'
})

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}

function clearError(): void {
  errorMessage.value = ''
}

function setError(error: unknown): void {
  errorMessage.value = error instanceof Error ? error.message : 'Unexpected error while loading export data'
}

function applyQuickRange(range: 'month' | '7days'): void {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const start = new Date(end)

  if (range === 'month') {
    start.setDate(1)
  } else {
    start.setDate(start.getDate() - 6)
  }

  fromDate.value = start.toISOString().slice(0, 10)
  toDate.value = end.toISOString().slice(0, 10)
}

function triggerGenerateMock(): void {
  if (!canGenerate.value) return
  generateMessage.value =
    'PDF export backend is not enabled yet. This is a UI preview of the export flow.'
}

async function loadExportData(): Promise<void> {
  isLoading.value = true
  clearError()
  generateMessage.value = ''

  try {
    const profileList = await getProfileList()
    profiles.value = profileList

    if (selectedProfileId.value === null && profileList.length > 0) {
      selectedProfileId.value = profileList[0].id
    }

    const allEntries = (
      await Promise.all(
        profileList.map(async (profile) => {
          const history = await getProfile(profile.id).getTimeHistory()
          return history.map<ExportEntry>((entry: TimeResult, index) => ({
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

    if (!fromDate.value && !toDate.value) {
      applyQuickRange('month')
    }
  } catch (error) {
    setError(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadExportData()
})
</script>

<template>
  <section class="screen">
    <p class="screen-label">PDF Exports</p>

    <section class="panel">
      <h2>Report Configuration</h2>
      <label>
        Profile
        <select v-model="selectedProfileId">
          <option :value="null">Select profile</option>
          <option v-for="profile in profiles" :key="profile.id" :value="profile.id">
            {{ profile.name }}
          </option>
        </select>
      </label>

      <div class="date-grid">
        <label>
          From
          <input v-model="fromDate" type="date" />
        </label>
        <label>
          To
          <input v-model="toDate" type="date" />
        </label>
      </div>

      <div class="quick-actions">
        <button :disabled="isLoading" @click="applyQuickRange('7days')">Last 7 days</button>
        <button :disabled="isLoading" @click="applyQuickRange('month')">This month</button>
      </div>

      <label>
        Report type
        <select v-model="reportType">
          <option value="detailed">Detailed entries</option>
          <option value="summary">Summary by tags</option>
        </select>
      </label>

      <label>
        Tag filter (visual only)
        <input v-model="tagFilter" placeholder="e.g. paid, unpaid" />
      </label>

      <button class="refresh" :disabled="isLoading" @click="loadExportData">Refresh Data</button>
    </section>

    <section class="panel">
      <h2>Preview</h2>
      <p><strong>Profile:</strong> {{ selectedProfileName }}</p>
      <p><strong>Entries:</strong> {{ entryCount }}</p>
      <p><strong>Total time:</strong> {{ totalDuration }}</p>
      <p><strong>Report:</strong> {{ reportType === 'detailed' ? 'Detailed entries' : 'Summary by tags' }}</p>
      <p><strong>Tag filter:</strong> {{ tagFilter.trim() || 'No tag filter' }}</p>

      <p v-if="isLoading">Loading export data…</p>
      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-else-if="entryCount === 0">No entries found for the current filter.</p>
    </section>

    <button class="generate" :disabled="!canGenerate || isLoading" @click="triggerGenerateMock">
      Generate PDF
    </button>
    <p v-if="generateMessage" class="message">{{ generateMessage }}</p>
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
  gap: 0.6rem;
}

.panel h2,
.panel p {
  margin: 0;
}

.panel h2 {
  font-size: 1rem;
}

.date-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.quick-actions {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.refresh {
  width: fit-content;
}

label {
  display: grid;
  gap: 0.35rem;
  font-weight: 500;
}

input,
select,
.refresh,
.generate {
  padding: 0.55rem 0.75rem;
  font: inherit;
}

.generate {
  border-radius: 0.7rem;
}

.message,
.error {
  margin: 0;
}

@media (max-width: 480px) {
  .date-grid {
    grid-template-columns: 1fr;
  }
}
</style>
