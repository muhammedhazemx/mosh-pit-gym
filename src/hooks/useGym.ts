import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Routine, type WorkoutSet } from '../db';

export function useGym() {
  const routines = useLiveQuery(() => db.routines.toArray());
  const activeSession = useLiveQuery(() => db.sessions.where('status').equals('active').first());
  const history = useLiveQuery(() => db.sessions.where('status').equals('completed').reverse().sortBy('date'));

  const startSession = async (routine: Routine) => {
    const now = new Date();
    const id = await db.sessions.add({
      date: now,
      startTime: now,
      routineId: routine.id,
      routineName: routine.name,
      duration: 0,
      status: 'active'
    });
    return id;
  };

  const endSession = async (sessionId: number) => {
    const session = await db.sessions.get(sessionId);
    if (!session) return;
    
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
    
    await db.sessions.update(sessionId, { 
      status: 'completed', 
      endTime,
      duration 
    });
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

  const exportData = async () => {
    const sessions = await db.sessions.toArray();
    const sets = await db.sets.toArray();
    const routines = await db.routines.toArray();
    
    const data = {
      exportDate: new Date(),
      sessions,
      sets,
      routines
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mosh-pit-gym-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
    exportData,
    logSet,
    getSetsForSession,
    getPrForExercise,
    getLastSetForExercise
  };
}
