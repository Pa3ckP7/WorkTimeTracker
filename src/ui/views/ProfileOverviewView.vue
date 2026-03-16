<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getProfile, getProfileList, type Profile, type TimeResult } from '@core'

interface ExportEntry {
  id: string
  startDate: Date
  seconds: number
}

const route = useRoute()
const profileId = computed(() => Number(route.params.profileId))

const profile = ref<Profile | null>(null)
const entries = ref<ExportEntry[]>([])
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
    const matchesFrom = fromDateObj.value === null || entry.startDate >= fromDateObj.value
    const matchesTo = toDateObj.value === null || entry.startDate <= toDateObj.value
    return matchesFrom && matchesTo
  })
})

const entryCount = computed(() => filteredEntries.value.length)

const totalDuration = computed(() => {
  const totalSeconds = filteredEntries.value.reduce((sum, entry) => sum + entry.seconds, 0)
  return formatDuration(totalSeconds)
})

const canGenerate = computed(() => fromDate.value.length > 0 && toDate.value.length > 0)

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
    profile.value = profileList.find((item) => item.id === profileId.value) ?? null

    const history = await getProfile(profileId.value).getTimeHistory()
    entries.value = history
      .map<ExportEntry>((entry: TimeResult, index) => ({
        id: `${profileId.value}-${entry.startDate.toISOString()}-${entry.seconds}-${index}`,
        startDate: entry.startDate,
        seconds: entry.seconds,
      }))
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())

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
    <p class="screen-label">Profile Overview</p>

    <section class="panel">
      <h2>{{ profile?.name ?? 'Profile' }} Overview</h2>

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
        <button class="btn-soft" :disabled="isLoading" @click="applyQuickRange('7days')">Last 7 days</button>
        <button class="btn-soft" :disabled="isLoading" @click="applyQuickRange('month')">This month</button>
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
    </section>

    <section class="panel">
      <h2>Preview</h2>
      <p><strong>Profile:</strong> {{ profile?.name ?? 'Unknown profile' }}</p>
      <p><strong>Entries:</strong> {{ entryCount }}</p>
      <p><strong>Total time:</strong> {{ totalDuration }}</p>
      <p><strong>Report:</strong> {{ reportType === 'detailed' ? 'Detailed entries' : 'Summary by tags' }}</p>
      <p><strong>Tag filter:</strong> {{ tagFilter.trim() || 'No tag filter' }}</p>

      <p v-if="isLoading">Loading export data…</p>
      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-else-if="entryCount === 0">No entries found for the current filter.</p>
    </section>

    <button class="generate btn-primary" :disabled="!canGenerate || isLoading" @click="triggerGenerateMock">
      Generate PDF
    </button>
    <p v-if="generateMessage" class="message">{{ generateMessage }}</p>
  </section>
</template>

<style scoped>
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

.generate {
  min-height: 50px;
  border-radius: 999px;
}

.message,
.error {
  color: var(--success);
  font-weight: 600;
}

@media (max-width: 480px) {
  .date-grid {
    grid-template-columns: 1fr;
  }
}
</style>
