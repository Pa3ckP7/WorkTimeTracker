export interface Profile {
  id: number;
  name: string;
}

export interface Timer {
  id: number;
  profileId: number;
  startDate: Date;
  endDate: Date | null;
}
