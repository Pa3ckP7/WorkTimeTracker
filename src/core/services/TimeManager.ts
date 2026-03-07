import { injectable } from 'tsyringe';
import { getTimeDifferenceSeconds } from "@/shared/utils";
import { TimerRepository } from "../data/repositories/TimerRepository";
import type { Timer } from "../data/types";

export interface TimeResult{
  seconds: number,
  startDate: Date
}

// Similar to C#: [Service] or [Injectable]
@injectable()
export class TimerManagerService{
  // Similar to C#: constructor(ITimerRepository timeRepo)
  constructor(private _timeRepo: TimerRepository){}

  public async StartTimer( profileId: number, startOverride? : Date): Promise<void>  {
    const timer = await this._timeRepo.getTimer(profileId);
    if (timer !== null) throw new Error("Timer is already running");
    const newTimer : Omit<Timer, "id">  = {
      profileId: profileId,
      startDate: startOverride==undefined ? new Date() : startOverride,
      endDate: null
    };
    await this._timeRepo.createTimer(newTimer);
  }

  public async StopTimer( profileId: number): Promise<TimeResult>{
    const timer = await this._timeRepo.getTimer(profileId);
    if (timer === null) throw new Error("Timer is not started");
    const stopTime = new Date();
    this._timeRepo.updateTimer(timer.id,{endDate: stopTime});
    return {
      seconds: getTimeDifferenceSeconds(timer.startDate, stopTime),
      startDate: timer.startDate
    }
  }

  public async GetTime(profileId: number): Promise<TimeResult>{
    const timer = await this._timeRepo.getTimer(profileId);
    if (timer === null) throw new Error("Timer is not started");
    const stopTime = new Date();
    return {
      seconds: getTimeDifferenceSeconds(timer.startDate, stopTime),
      startDate: timer.startDate
    }
  }

  public async GetTimingHistory(profileId: number): Promise<TimeResult[]>{
    const timers = await this._timeRepo.getTimers(profileId)
    const timeResults = timers.filter( t => t.endDate !== null)
    .map<TimeResult>(t => ({
      seconds: getTimeDifferenceSeconds(t.startDate, t.endDate),
      startDate: t.startDate
    }));
    return timeResults;
  }

}
