import Dexie, { type Table } from 'dexie';

/**
 * IndexedDB Schema for MOSH PIT GYM
 * Powered by Dexie.js
 */

export interface Routine {
  id?: number;
  name: string;
  type: 'PPL' | 'UL' | 'FULL' | 'CUSTOM';
  exercises: string[]; // List of movement names for this routine
}

export interface Exercise {
  id?: number;
  name: string;
  category: string;
}

export interface Session {
  id?: number;
  date: Date;
  startTime: Date; // Start of the workout
  endTime?: Date;   // End of the workout
  routineId?: number;
  routineName: string;
  duration: number; // Final duration in seconds
  status: 'active' | 'completed';
}

export interface WorkoutSet {
  id?: number;
  sessionId: number;
  exerciseName: string;
  reps: number;
  weight: number;
  timestamp: Date; // Auto-generated for time tallying
  isPr?: boolean;
}

export class GymDatabase extends Dexie {
  routines!: Table<Routine>;
  exercises!: Table<Exercise>;
  sessions!: Table<Session>;
  sets!: Table<WorkoutSet>;

  constructor() {
    super('GymDatabase');
    // Schema definition -sessionId and exerciseName are key for fast querying
    this.version(1).stores({
      routines: '++id, name, type',
      exercises: '++id, name, category',
      sessions: '++id, date, routineId, status',
      sets: '++id, sessionId, exerciseName, timestamp'
    });
  }
}

export const db = new GymDatabase();

/**
 * Seeds the database with default streetwear-approved splits if empty.
 */
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
