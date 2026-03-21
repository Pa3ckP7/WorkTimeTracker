import { injectable, inject } from 'tsyringe';
import { getTimeDifferenceSeconds } from "@/shared/utils";
import { TimerRepository } from "../data/repositories/TimerRepository";
import type { Timer } from "../data/types";

export interface TimeResult{
  id: number,
  seconds: number,
  startDate: Date,
  endDate: Date | null
}

// Similar to C#: [Service] or [Injectable]
@injectable()
export class TimerManagerService{
  // Similar to C#: constructor(ITimerRepository timeRepo)
  constructor(@inject(TimerRepository) private _timeRepo: TimerRepository){}

  public async StartTimer( profileId: number, startOverride? : Date): Promise<number>  {
    let timer = await this._timeRepo.getProfileTimer(profileId);
    if (timer !== null) throw new Error("Timer is already running");
    const newTimer : Omit<Timer, "id">  = {
      profileId: profileId,
      startDate: startOverride==undefined ? new Date() : startOverride,
      endDate: null
    };
    timer = await this._timeRepo.createTimer(newTimer);
    return timer.id;
  }

  public async StopProfileTimer(profileId: number): Promise<TimeResult>{
    const timer = await this._timeRepo.getProfileTimer(profileId);
    if (timer === null) throw new Error("Timer is not started");
    const stopTime = new Date();
    await this._timeRepo.updateTimer(timer.id,{endDate: stopTime});
    return {
      id: timer.id,
      seconds: getTimeDifferenceSeconds(timer.startDate, stopTime),
      startDate: timer.startDate,
      endDate: stopTime
    }
  }

  public async StopTimer(timerId: number): Promise<TimeResult>{
    const timer = await this._timeRepo.getTimer(timerId);
    if (timer === null) throw new Error("Timer does not exist");
    const stopTime = new Date();
    await this._timeRepo.updateTimer(timerId,{endDate: stopTime});
    return {
      id: timer.id,
      seconds: getTimeDifferenceSeconds(timer.startDate, stopTime),
      startDate: timer.startDate,
      endDate: stopTime
    }
  }

  public async GetProfileTime(profileId: number): Promise<TimeResult>{
    const timer = await this._timeRepo.getProfileTimer(profileId);
    if (timer === null) throw new Error("Timer is not started");
    const stopTime = new Date();
    return {
      id: timer.id,
      seconds: getTimeDifferenceSeconds(timer.startDate, stopTime),
      startDate: timer.startDate,
      endDate: null
    }
  }

  public async GetTime(timerId: number): Promise<TimeResult>{
    const timer = await this._timeRepo.getTimer(timerId);
    if (timer === null) throw new Error("Timer does not exist");
    const endTime = timer.endDate === null ? new Date() : timer.endDate;
    return {
      id: timer.id,
      seconds: getTimeDifferenceSeconds(timer.startDate, endTime),
      startDate: timer.startDate,
      endDate: timer.endDate
    }
  }

  public async GetTimingHistory(profileId: number): Promise<TimeResult[]>{
    const timers = await this._timeRepo.getTimersWithProfile(profileId)
    const timeResults = timers.filter( t => t.endDate !== null)
    .map<TimeResult>(t => ({
      id: t.id,
      seconds: getTimeDifferenceSeconds(t.startDate, t.endDate),
      startDate: t.startDate,
      endDate: t.endDate
    }));
    return timeResults;
  }

}
