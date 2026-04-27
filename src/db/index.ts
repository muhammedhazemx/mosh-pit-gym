import Dexie, { type Table } from 'dexie';

export interface Routine {
  id?: number;
  name: string;
  type: 'PPL' | 'UL' | 'FULL' | 'CUSTOM';
  exercises: string[]; // List of exercise IDs or names for this routine
}

export interface Exercise {
  id?: number;
  name: string;
  category: string;
}

export interface Session {
  id?: number;
  date: Date;
  startTime: Date;
  endTime?: Date;
  routineId?: number;
  routineName: string;
  duration: number; // in seconds
  status: 'active' | 'completed';
}

export interface WorkoutSet {
  id?: number;
  sessionId: number;
  exerciseName: string;
  reps: number;
  weight: number;
  timestamp: Date;
  isPr?: boolean;
}

export class GymDatabase extends Dexie {
  routines!: Table<Routine>;
  exercises!: Table<Exercise>;
  sessions!: Table<Session>;
  sets!: Table<WorkoutSet>;

  constructor() {
    super('GymDatabase');
    this.version(1).stores({
      routines: '++id, name, type',
      exercises: '++id, name, category',
      sessions: '++id, date, routineId, status',
      sets: '++id, sessionId, exerciseName, timestamp'
    });
  }
}

export const db = new GymDatabase();

// Seed initial data
export async function seedDatabase() {
  const routineCount = await db.routines.count();
  if (routineCount === 0) {
    await db.routines.bulkAdd([
      { name: 'PUSH', type: 'PPL', exercises: ['Bench Press', 'Shoulder Press', 'Triceps Pushdown'] },
      { name: 'PULL', type: 'PPL', exercises: ['Pull Ups', 'Barbell Row', 'Bicep Curls'] },
      { name: 'LEGS', type: 'PPL', exercises: ['Squats', 'Leg Press', 'Calf Raises'] },
      { name: 'UPPER', type: 'UL', exercises: ['Bench Press', 'Pull Ups', 'Shoulder Press'] },
      { name: 'LOWER', type: 'UL', exercises: ['Squats', 'Deadlift', 'Leg Press'] },
      { name: 'FULL BODY', type: 'FULL', exercises: ['Squats', 'Bench Press', 'Pull Ups'] },
    ]);
  }
}
