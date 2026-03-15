import { container } from "tsyringe";
import type { Profile } from "../data/types";
import { TimerManagerService, type TimeResult } from "../services/TimeManager";
import { ProfileRepository } from "../data/repositories/ProfileRepository";
import { ensureCoreInitialized } from "../init";

let profileRepo: ProfileRepository;

export async function getProfileList() : Promise<Profile[]> {
  await ensureCoreInitialized();
  profileRepo ??= container.resolve(ProfileRepository);
  return profileRepo.GetProfiles();
}

export function getProfile(id: number): ProfileManager{
  return new ProfileManager(id);
}

export async function createProfile(name: string): Promise<number> {
  await ensureCoreInitialized();
  profileRepo ??= container.resolve(ProfileRepository);
  const profile = await profileRepo.CreateProfile({name})
  return profile.id;
}

export async function deleteProfile(id: number): Promise<void> {
  await ensureCoreInitialized();
  profileRepo ??= container.resolve(ProfileRepository);
  await profileRepo.DeleteProfile(id);
}

export class ProfileManager{
  private _profileId: number
  private _timeService: TimerManagerService | null = null

  constructor(id: number){
    this._profileId = id
  }

  private async getTimeService(): Promise<TimerManagerService> {
    await ensureCoreInitialized();
    this._timeService ??= container.resolve(TimerManagerService);
    return this._timeService;
  }

  public async startTimer(startOverride? : Date): Promise<void>{
    const timeService = await this.getTimeService();
    return timeService.StartTimer(this._profileId, startOverride);
  }

  public async stopTimer() : Promise<TimeResult>{
    const timeService = await this.getTimeService();
    return timeService.StopTimer(this._profileId);
  }

  public async getTime() : Promise<TimeResult>{
    const timeService = await this.getTimeService();
    return timeService.GetTime(this._profileId);
  }

  public async getTimeHistory() : Promise<TimeResult[]>{
    const timeService = await this.getTimeService();
    return timeService.GetTimingHistory(this._profileId);
  }
}
