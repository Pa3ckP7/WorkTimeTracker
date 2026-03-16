import { container } from "tsyringe";
import type { Profile } from "../data/types";
import { TimerManagerService, type TimeResult } from "../services/TimeManager";
import { ProfileRepository } from "../data/repositories/ProfileRepository";
import { ensureCoreInitialized } from "../init";
import { getTimer, TimeController } from "./timerController";
import { TimerRepository } from "../data/repositories/TimerRepository";

let profileRepo: ProfileRepository;

async function getProfileRepo(): Promise<ProfileRepository>{
  await ensureCoreInitialized();
  return profileRepo || (profileRepo = container.resolve(ProfileRepository));
}

export async function getProfileList() : Promise<Profile[]> {
  const profileRepo = await getProfileRepo();
  return profileRepo.GetProfiles();
}

export async function getProfile(id: number): Promise<ProfileManager>{
  await ensureCoreInitialized();
  return new ProfileManager(id);
}

export async function createProfile(name: string): Promise<number> {
  const profileRepo = await getProfileRepo();
  const profile = await profileRepo.CreateProfile({name})
  return profile.id;
}

export async function deleteProfile(id: number): Promise<void> {
  const profileRepo = await getProfileRepo();
  await profileRepo.DeleteProfile(id);
}

export async function editProfile(id: number, data: Partial<Omit<Profile, "id">>){
  const profileRepo = await getProfileRepo();
  await profileRepo.UpdateProfile(id, data);
}

export class ProfileManager{
  private _profileId: number
  private _timeService: TimerManagerService
  private _timeRepo: TimerRepository

  constructor(id: number){
    this._profileId = id
    this._timeService = container.resolve(TimerManagerService);
    this._timeRepo = container.resolve(TimerRepository);
  }

  public async startTimer(startOverride? : Date): Promise<TimeController>{
    const tId = await this._timeService.StartTimer(this._profileId, startOverride);
    return getTimer(tId);
  }

  public async getCurrentTimer(): Promise<TimeController | null>{
    const timer = await this._timeRepo.getProfileTimer(this._profileId);
    if (timer === null) return null;
    return getTimer(timer.id);
  }

  public async getTime(): Promise<TimeResult>{
    return this._timeService.GetProfileTime(this._profileId);
  }

  public async stopTimer(): Promise<TimeResult>{
    return this._timeService.StopProfileTimer(this._profileId);
  }

  public async getTimeHistory() : Promise<TimeResult[]>{
    const tmrs = await this._timeRepo.getTimersWithProfile(this._profileId)
    const results: TimeResult[] = []
    for(const tmr of tmrs){
      const ctrl = await getTimer(tmr.id);
      const result = await ctrl.getTime();
      results.push(result);
    }
    return results;
  }
}
