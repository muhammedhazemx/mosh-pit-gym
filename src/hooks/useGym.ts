import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Routine, type WorkoutSet } from '../db';

export function useGym() {
  const routines = useLiveQuery(() => db.routines.toArray());
  const activeSession = useLiveQuery(() => db.sessions.where('status').equals('active').first());
  const history = useLiveQuery(() => db.sessions.where('status').equals('completed').reverse().sortBy('date'));

  const startSession = async (routine: Routine) => {
    const id = await db.sessions.add({
      date: new Date(),
      routineId: routine.id,
      routineName: routine.name,
      duration: 0,
      status: 'active'
    });
    return id;
  };

  const endSession = async (sessionId: number, duration: number) => {
    await db.sessions.update(sessionId, { status: 'completed', duration });
  };

  const logSet = async (set: Omit<WorkoutSet, 'id' | 'timestamp'>) => {
    await db.sets.add({
      ...set,
      timestamp: new Date()
    });
  };

  const getSetsForSession = (sessionId: number) => {
    return useLiveQuery(() => db.sets.where('sessionId').equals(sessionId).toArray(), [sessionId]);
  };

  const getPrForExercise = (exerciseName: string) => {
    return useLiveQuery(async () => {
      const allSets = await db.sets.where('exerciseName').equals(exerciseName).toArray();
      if (allSets.length === 0) return null;
      return allSets.reduce((prev, curr) => (curr.weight > prev.weight ? curr : prev), allSets[0]);
    }, [exerciseName]);
  };

  const getLastSetForExercise = (exerciseName: string) => {
    return useLiveQuery(async () => {
      return await db.sets.where('exerciseName').equals(exerciseName).reverse().first();
    }, [exerciseName]);
  };

  const updateRoutine = async (routineId: number, exercises: string[]) => {
    await db.routines.update(routineId, { exercises });
  };

  const deleteSession = async (sessionId: number) => {
    await db.sessions.delete(sessionId);
    await db.sets.where('sessionId').equals(sessionId).delete();
  };

  const deleteSet = async (setId: number) => {
    await db.sets.delete(setId);
  };

  return {
    routines,
    activeSession,
    history,
    startSession,
    endSession,
    updateRoutine,
    deleteSession,
    deleteSet,
    logSet,
    getSetsForSession,
    getPrForExercise,
    getLastSetForExercise
  };
}
