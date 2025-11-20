
export interface Teacher {
  id: string;
  name: string;
  allowance: number;
}

export interface Unit {
  id: string;
  name: string;
  assignments: Record<string, number>; // { [teacherId]: hours }
}

export interface Course {
  id: string;
  name: string;
  targetHours?: number;
  units: Unit[];
}

export type AppView = 'grid' | 'courses' | 'teachers';