import { injectable, inject } from 'tsyringe';
import type { DBSQLiteValues, SQLiteDBConnection } from "@capacitor-community/sqlite";
import type { Timer } from "../types";
import { parseISO } from "date-fns";
import { DB_CONNECTION_TOKEN } from '../db';

type TimerEntity = {
    id: number,
    profileId: number,
    startDate: string,
  endDate: string | null
}

// Similar to C#: [Service] or [Injectable]
@injectable()
export class TimerRepository{

  // Similar to C#: constructor(IDbConnection connection)
  // eslint-disable-next-line no-unused-vars
  constructor(@inject(DB_CONNECTION_TOKEN) private _connection: SQLiteDBConnection) {}

  async getTimers(profileId: number): Promise<Timer[]>{
    const dbData = await this._connection.query(
      "SELECT * FROM Timer WHERE profileId=? ORDER BY startDate DESC",
      [profileId]
    );
    return this.fromEntities((dbData.values || []) as TimerEntity[]);

  }

  async getTimer(profileId: number): Promise<Timer|null>{
    const dbData = await this._connection.query(
      "SELECT * FROM Timer WHERE profileId=? AND endDate IS NULL ORDER BY id DESC LIMIT 1",
      [profileId]
    );
    if (!dbData.values || dbData.values.length == 0) return null;
    return this.fromEntities([dbData.values[0] as TimerEntity])[0];
  }

  async createTimer(data: Omit<Timer, "id">): Promise<Timer> {
    const parsedData = this.toEntities([data as Timer])[0];
    const result = await this._connection.run(
      'INSERT INTO Timer (profileId, startDate, endDate) VALUES (?, ?, ?)',
      [parsedData.profileId, parsedData.startDate, parsedData.endDate]
    );

    const insertedId = result.changes?.lastId;
    if (!insertedId) {
      throw new Error('Failed to create profile');
    }
    return { id: insertedId, ...data };
  }

  async updateTimer(id: number, data: Omit<Partial<Timer>, "id">): Promise<void> {
    const updates: string[] = [];
    const values = [];

    if (data.profileId !== undefined) {
      updates.push("profileId = ?");
      values.push(data.profileId);
    }

    if (data.startDate !== undefined) {
      updates.push("startDate = ?");
      values.push(data.startDate.toISOString());
    }

    if (data.endDate !== undefined) {
      updates.push("endDate = ?");
      values.push(data.endDate === null ? null : data.endDate.toISOString());
    }

    if (updates.length === 0) {
      return; // Nothing to update
    }

    values.push(id); // Add id for WHERE clause

    const sql = `UPDATE Timer SET ${updates.join(", ")} WHERE id = ?`;
    await this._connection.run(sql, values);
  }

  async DeleteTimer(id: number): Promise<void>{
    await this._connection.query("DELETE FROM Timer WHERE id = ?", [id])
  }

  private fromEntities(data: TimerEntity[]) : Timer[]{
    return data.map<Timer>( t => ({
      id: t.id,
      profileId: t.profileId,
      startDate: parseISO(t.startDate),
      endDate: t.endDate === null ? null : parseISO(t.endDate)
    }));
  }

  private toEntities(data: Timer[]) : TimerEntity[]{
    return data.map<TimerEntity>( t => ({
      id: t.id,
      profileId: t.profileId,
      startDate: t.startDate.toISOString(),
      endDate: t.endDate === null ? null : t.endDate.toISOString()
    }))
  }
}
