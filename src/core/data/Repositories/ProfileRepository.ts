import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { Profile } from '../types';

export class ProfileRepository {
  // eslint-disable-next-line no-unused-vars
  constructor(private _connection: SQLiteDBConnection) {}

  async GetProfiles(): Promise<Profile[]> {
    const result = await this._connection.query('SELECT * FROM Profile', []);
    return (result.values || []) as Profile[];
  }

  async GetProfile(id: number): Promise<Profile | null> {
    const result = await this._connection.query(
      'SELECT * FROM Profile WHERE id = ?',
      [id]
    );
    return (result.values?.[0] as Profile) || null;
  }

  async CreateProfile(data: Omit<Profile, "id">): Promise<Profile> {
    const result = await this._connection.run(
      'INSERT INTO Profile (name) VALUES (?)',
      [data.name]
    );

    const insertedId = result.changes?.lastId;
    if (!insertedId) {
      throw new Error('Failed to create profile');
    }

    return { id: insertedId, ...data };
  }

  async UpdateProfile(id:number, data:Omit<Partial<Profile>, "id"> ): Promise<void> {
    const updates:string[] = []
    const values = []

    if(data.name !== undefined){
      updates.push("name = ?")
      values.push(data.name)
    }
    if(updates.length == 0) return;

    values.push(id);

    await this._connection.run(`UPDATE Profile SET ${updates.join(", ")} WHERE id = ?`, [data.name, id]);
    return;
  }

  async DeleteProfile(id: number): Promise<void> {
    await this._connection.run('DELETE FROM Profile WHERE id = ?', [id]);
  }
}
