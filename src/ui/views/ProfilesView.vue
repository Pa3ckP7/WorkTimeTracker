<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createProfile, getProfile, getProfileList, type Profile, type TimeResult } from '@core'

const router = useRouter()
const profiles = ref<Profile[]>([])
const runningByProfile = ref<Record<number, TimeResult | null>>({})
const busyProfileIds = ref<number[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const nowMs = ref(Date.now())
let ticker: number | null = null

const hasProfiles = computed(() => profiles.value.length > 0)

function isBusy(profileId: number): boolean {
  return busyProfileIds.value.includes(profileId)
}

function setBusy(profileId: number, busy: boolean): void {
  if (busy && !busyProfileIds.value.includes(profileId)) {
    busyProfileIds.value = [...busyProfileIds.value, profileId]
    return
  }

  if (!busy) {
    busyProfileIds.value = busyProfileIds.value.filter((id) => id !== profileId)
  }
}

function startTicker(): void {
  stopTicker()
  ticker = window.setInterval(() => {
    nowMs.value = Date.now()
  }, 1000)
}

function stopTicker(): void {
  if (ticker !== null) {
    window.clearInterval(ticker)
    ticker = null
  }
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
}

function getElapsedSeconds(profileId: number): number {
  const running = runningByProfile.value[profileId]
  if (!running) return 0
  return Math.floor((nowMs.value - running.startDate.getTime()) / 1000)
}

function clearError(): void {
  errorMessage.value = ''
}

function setError(error: unknown): void {
  errorMessage.value = error instanceof Error ? error.message : 'Unexpected error'
}

async function loadProfiles(): Promise<void> {
  isLoading.value = true
  clearError()

  try {
    const profileList = await getProfileList()
    profiles.value = profileList

    const runningEntries = await Promise.all(
      profileList.map(async (profile) => {
        try {
          const running = await getProfile(profile.id).getTime()
          return [profile.id, running] as const
        } catch {
          return [profile.id, null] as const
        }
      })
    )

    runningByProfile.value = Object.fromEntries(runningEntries)
  } catch (error) {
    setError(error)
  } finally {
    isLoading.value = false
  }
}

async function addProfile(): Promise<void> {
  const name = window.prompt('Profile name')?.trim()
  if (!name) return

  isLoading.value = true
  clearError()

  try {
    const newId = await createProfile(name)
    await loadProfiles()
    void router.push(`/profiles/${newId}/timer`)
  } catch (error) {
    setError(error)
  } finally {
    isLoading.value = false
  }
}

async function toggleTimer(profileId: number): Promise<void> {
  if (isBusy(profileId)) return

  setBusy(profileId, true)
  clearError()

  try {
    const manager = getProfile(profileId)
    const running = runningByProfile.value[profileId]

    if (running) {
      await manager.stopTimer()
      runningByProfile.value = { ...runningByProfile.value, [profileId]: null }
    } else {
      await manager.startTimer()
      runningByProfile.value = {
        ...runningByProfile.value,
        [profileId]: { seconds: 0, startDate: new Date() },
      }
    }
  } catch (error) {
    setError(error)
  } finally {
    setBusy(profileId, false)
  }
}

function openProfile(profileId: number): void {
  void router.push(`/profiles/${profileId}/timer`)
}

onMounted(async () => {
  await loadProfiles()
  startTicker()
})

onBeforeUnmount(() => {
  stopTicker()
})
</script>

<template>
  <section class="screen">
    <p class="screen-label">Profiles</p>

    <section class="panel">
      <h2>All Profiles</h2>
      <p v-if="isLoading">Loading profiles…</p>
      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-else-if="!hasProfiles" class="muted">No profiles yet. Tap + to create one.</p>

      <ul v-else class="profile-list">
        <li v-for="profile in profiles" :key="profile.id" class="profile-row" @click="openProfile(profile.id)">
          <div>
            <p class="profile-name">{{ profile.name }}</p>
            <p class="profile-time muted">
              {{ runningByProfile[profile.id] ? formatDuration(getElapsedSeconds(profile.id)) : 'Not running' }}
            </p>
          </div>

          <button
            :class="runningByProfile[profile.id] ? 'btn-danger' : 'btn-primary'"
            :disabled="isBusy(profile.id)"
            @click.stop="toggleTimer(profile.id)"
          >
            {{ runningByProfile[profile.id] ? 'Stop' : 'Start' }}
          </button>
        </li>
      </ul>
    </section>

    <button class="add-profile-btn btn-primary" :disabled="isLoading" @click="addProfile">+</button>
  </section>
</template>

<style scoped>
.profile-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.6rem;
}

.profile-row {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-soft);
  padding: 0.7rem 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
}

.profile-name,
.profile-time {
  margin: 0;
}

.profile-name {
  font-weight: 700;
}

.profile-time {
  font-size: 0.88rem;
}

.add-profile-btn {
  position: fixed;
  right: 1rem;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  width: 52px;
  height: 52px;
  border-radius: 999px;
  font-size: 1.65rem;
  line-height: 1;
  padding: 0;
}
</style>
