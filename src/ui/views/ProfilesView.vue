<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  createProfile,
  editProfile,
  getProfile,
  getProfileList,
  type Profile,
  type TimeResult,
} from '@core'

const router = useRouter()
const profiles = ref<Profile[]>([])
const runningByProfile = ref<Record<number, TimeResult | null>>({})
const busyProfileIds = ref<number[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const nowMs = ref(Date.now())
const editingProfileId = ref<number | null>(null)
const editingProfileName = ref('')
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

async function syncRunningState(profileId: number): Promise<void> {
  try {
    const manager = await getProfile(profileId)
    const running = await manager.getTime()
    runningByProfile.value = { ...runningByProfile.value, [profileId]: running }
  } catch {
    runningByProfile.value = { ...runningByProfile.value, [profileId]: null }
  }
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
          const manager = await getProfile(profile.id)
          const running = await manager.getTime()
          return [profile.id, running] as const
        } catch {
          return [profile.id, null] as const
        }
      }),
    )

    runningByProfile.value = Object.fromEntries(runningEntries)
  } catch (error) {
    setError(error)
  } finally {
    isLoading.value = false
  }
}

function startRenamingProfile(profile: Profile): void {
  editingProfileId.value = profile.id
  editingProfileName.value = profile.name
}

function cancelRenamingProfile(): void {
  editingProfileId.value = null
  editingProfileName.value = ''
}

async function saveProfileName(profileId: number): Promise<void> {
  const nextName = editingProfileName.value.trim()
  const existingProfile = profiles.value.find((profile) => profile.id === profileId)

  if (!existingProfile || nextName.length === 0 || nextName === existingProfile.name) {
    cancelRenamingProfile()
    return
  }

  setBusy(profileId, true)
  clearError()

  try {
    await editProfile(profileId, { name: nextName })
    await loadProfiles()
    cancelRenamingProfile()
  } catch (error) {
    setError(error)
  } finally {
    setBusy(profileId, false)
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
    const manager = await getProfile(profileId)
    const running = runningByProfile.value[profileId]

    if (running) {
      await manager.stopTimer()
    } else {
      await manager.startTimer()
    }

    await syncRunningState(profileId)
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
      <p v-if="isLoading">Loading profiles...</p>
      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-else-if="!hasProfiles" class="muted">No profiles yet. Tap + to create one.</p>

      <ul v-else class="profile-list">
        <li v-for="profile in profiles" :key="profile.id" class="profile-row">
          <button class="profile-summary" @click="openProfile(profile.id)">
            <span class="profile-name">{{ profile.name }}</span>
            <span class="profile-time muted">
              {{ runningByProfile[profile.id] ? formatDuration(getElapsedSeconds(profile.id)) : 'Not running' }}
            </span>
          </button>

          <div class="profile-actions">
            <button
              class="btn-soft profile-action-btn"
              :disabled="isBusy(profile.id)"
              @click.stop="startRenamingProfile(profile)"
            >
              Edit
            </button>
            <button
              :class="['profile-action-btn', runningByProfile[profile.id] ? 'btn-danger' : 'btn-primary']"
              :disabled="isBusy(profile.id)"
              @click.stop="toggleTimer(profile.id)"
            >
              {{ runningByProfile[profile.id] ? 'Stop' : 'Start' }}
            </button>
          </div>

          <form
            v-if="editingProfileId === profile.id"
            class="rename-form"
            @submit.prevent="saveProfileName(profile.id)"
          >
            <input
              v-model="editingProfileName"
              :disabled="isBusy(profile.id)"
              maxlength="40"
              placeholder="Profile name"
            />
            <div class="rename-actions">
              <button
                class="btn-primary"
                type="submit"
                :disabled="isBusy(profile.id) || !editingProfileName.trim()"
              >
                Save
              </button>
              <button
                class="btn-soft"
                type="button"
                :disabled="isBusy(profile.id)"
                @click="cancelRenamingProfile"
              >
                Cancel
              </button>
            </div>
          </form>
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
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
}

.profile-summary {
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  text-align: left;
  min-width: 0;
}

.profile-summary:hover:not(:disabled),
.profile-summary:active:not(:disabled) {
  transform: none;
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

.profile-actions,
.rename-actions {
  display: flex;
  gap: 0.45rem;
  align-items: center;
}

.profile-action-btn {
  min-width: 74px;
}

.rename-form {
  grid-column: 1 / -1;
  display: grid;
  gap: 0.55rem;
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
