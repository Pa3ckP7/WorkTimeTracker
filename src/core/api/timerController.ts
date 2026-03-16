import { container } from "tsyringe";
import { TimerManagerService, type TimeResult } from "../services/TimeManager";
import type { Timer } from "../data/types";
import { ensureCoreInitialized } from "../init";
import { TimerRepository } from "../data/repositories/TimerRepository";

export async function getTimer(id: number) : Promise<TimeController>{
    await ensureCoreInitialized()
    return new TimeController(id);
}

export class TimeController{

  private _timeService: TimerManagerService
  private _timeRepo: TimerRepository

  // eslint-disable-next-line no-unused-vars
  constructor(private _id: number){
    this._timeService = container.resolve(TimerManagerService);
    this._timeRepo = container.resolve(TimerRepository)
  }

  public stop(): Promise<TimeResult>{
    return this._timeService.StopTimer(this._id)
  }

  public getTime(): Promise<TimeResult>{
    return this._timeService.GetTime(this._id);

  }

  public editTimer(data: Partial<Omit<Timer, "id">>){
    return this._timeRepo.updateTimer(this._id, data);
  }

}
