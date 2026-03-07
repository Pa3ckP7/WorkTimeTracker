import { container } from "tsyringe";
import type { Profile, Timer } from "../data/types";
import { TimerManagerService, type TimeResult } from "../services/TimeManager";
import { ProfileRepository } from "../data/repositories/ProfileRepository";


export async function getProfileList() : Promise<Profile[]> {
  const profileRepo = container.resolve(ProfileRepository);
  return profileRepo.GetProfiles();
}

export function getProfile(id: number): ProfileManager{
  return new ProfileManager(id);
}

export class ProfileManager{
  private _profileId: number
  private _timeService: TimerManagerService

  constructor(id: number){
    this._profileId = id
    this._timeService = container.resolve(TimerManagerService);
  }

  public startTimer(startOverride? : Date): Promise<void>{
    return this._timeService.StartTimer(this._profileId, startOverride);
  }

  public stopTimer() : Promise<TimeResult>{
    return this._timeService.StopTimer(this._profileId);
  }

  public getTime() : Promise<TimeResult>{
    return this._timeService.GetTime(this._profileId);
  }

  public getTimeHistory() : Promise<TimeResult[]>{
    return this._timeService.GetTimingHistory(this._profileId);
  }
}
