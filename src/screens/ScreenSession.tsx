import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGym } from '../hooks/useGym';
import type { Session } from '../db';

interface Props {
  session: Session;
  onEndSession: () => void;
}

export const ScreenSession: React.FC<Props> = ({ session, onEndSession }) => {
  const { routines, logSet, getLastSetForExercise, getPrForExercise, endSession, updateRoutine } = useGym();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
  const routine = routines?.find(r => r.id === session.routineId);
  const exercises = routine?.exercises || ["BENCH PRESS"]; // Fallback
  const currentExercise = exercises[currentExerciseIndex];

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [isResting, setIsResting] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [restTime, setRestTime] = useState(90);
  const [timer, setTimer] = useState(0);

  const lastSet = getLastSetForExercise(currentExercise);
  const pr = getPrForExercise(currentExercise);

  const adjustRestTime = (amount: number) => {
    setRestTime(prev => Math.max(0, prev + amount));
  };

  const adjustTimer = (amount: number) => {
    setTimer(prev => Math.max(0, prev + amount));
  };

  const handleAddExercise = async () => {
    if (!newExerciseName || !routine) return;
    const updated = [...exercises, newExerciseName.toUpperCase()];
    await updateRoutine(routine.id!, updated);
    setNewExerciseName('');
    setIsAddingExercise(false);
    setCurrentExerciseIndex(updated.length - 1);
  };

  const handleRemoveExercise = async () => {
    if (!routine || exercises.length <= 1) return;
    const updated = exercises.filter((_, i) => i !== currentExerciseIndex);
    await updateRoutine(routine.id!, updated);
    setCurrentExerciseIndex(0);
  };

  useEffect(() => {
    let interval: number;
    if (isResting && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsResting(false);
    }
    return () => clearInterval(interval);
  }, [isResting, timer]);

  const handleLogSet = async () => {
    if (!weight || !reps) return;
    
    // Crisp haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(40);
    }

    await logSet({
      sessionId: session.id!,
      exerciseName: currentExercise,
      weight: parseFloat(weight),
      reps: parseInt(reps),
    });

    // Check for PR to show celebration
    const currentWeight = parseFloat(weight);
    if (pr && currentWeight > pr.weight) {
       // High-intensity visual flash for PR
       const flash = document.createElement('div');
       flash.className = 'pr-celebration';
       flash.style.backgroundColor = 'white';
       flash.style.mixBlendMode = 'difference';
       document.body.appendChild(flash);
       
       // Repeat flash for "strobe" effect
       setTimeout(() => {
         flash.style.display = 'none';
         setTimeout(() => {
           flash.style.display = 'block';
           setTimeout(() => flash.remove(), 100);
         }, 50);
       }, 100);
       
       if ('vibrate' in navigator) {
         // Deep, layered "Double Pulse" vibration pattern
         navigator.vibrate([200, 100, 200, 50, 400]); 
       }
    }

    setTimer(restTime);
    setIsResting(true);
  };

  const handleEndSession = async () => {
    await endSession(session.id!, 0); // TODO: calc duration
    onEndSession();
  };

  if (isResting) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container"
        style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--fg-color)', color: 'var(--bg-color)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button className="label-bracket" style={{ fontSize: '2rem', color: 'var(--bg-color)' }} onClick={() => adjustTimer(-15)}>-</button>
          <h1 style={{ fontSize: '8rem' }}>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</h1>
          <button className="label-bracket" style={{ fontSize: '2rem', color: 'var(--bg-color)' }} onClick={() => adjustTimer(15)}>+</button>
        </div>
        <h2 style={{ letterSpacing: '0.5em' }}>RESTING</h2>
        <button 
          className="brutalist-button" 
          style={{ marginTop: '4rem', borderColor: 'var(--bg-color)' }}
          onClick={() => setIsResting(false)}
        >
          [skip]
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="container"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <span className="label-bracket">{session.routineName}</span>
        <button className="label-bracket" onClick={handleEndSession}>[finish_session]</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '3rem' }}>{currentExercise}</h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {lastSet && <span className="label-bracket">last: {lastSet.weight}kg x {lastSet.reps}</span>}
            {pr && <span className="label-bracket">pr: {pr.weight}kg</span>}
            <button className="label-bracket" onClick={handleRemoveExercise} style={{ marginLeft: 'auto', opacity: 0.5 }}>[remove_ex]</button>
          </div>
          </div>

          <AnimatePresence>
          {isAddingExercise && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ marginBottom: '2rem', overflow: 'hidden' }}
            >
              <input 
                autoFocus
                type="text" 
                placeholder="NEW EXERCISE" 
                value={newExerciseName}
                onChange={e => setNewExerciseName(e.target.value)}
                style={{ fontSize: '2rem', width: '100%', fontWeight: 700, borderBottom: '2px solid var(--fg-color)' }}
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="label-bracket" onClick={handleAddExercise}>[confirm]</button>
                <button className="label-bracket" onClick={() => setIsAddingExercise(false)}>[cancel]</button>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <input 
              type="number" 
              placeholder="00" 
              value={weight} 
              onChange={e => setWeight(e.target.value)}
              style={{ fontSize: '5rem', width: '100%', fontWeight: 900 }}
            />
            <span className="label-bracket">weight_kg</span>
          </div>

          <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <input 
              type="number" 
              placeholder="00" 
              value={reps} 
              onChange={e => setReps(e.target.value)}
              style={{ fontSize: '5rem', width: '100%', fontWeight: 900 }}
            />
            <span className="label-bracket">reps</span>
          </div>

          <button 
            className="brutalist-button"
            onClick={handleLogSet}
            disabled={!weight || !reps}
          >
            [log_set]
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
        <button className="label-bracket" onClick={() => adjustRestTime(-15)}>-</button>
        <span className="label-bracket" style={{ color: 'var(--fg-color)' }}>rest: {Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, '0')}</span>
        <button className="label-bracket" onClick={() => adjustRestTime(15)}>+</button>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {exercises.map((ex, idx) => (
          <button 
            key={ex}
            onClick={() => setCurrentExerciseIndex(idx)}
            className="label-bracket"
            style={{ color: idx === currentExerciseIndex ? 'var(--fg-color)' : 'var(--muted-color)', whiteSpace: 'nowrap' }}
          >
            {ex}
          </button>
        ))}
        <button 
          className="label-bracket"
          onClick={() => setIsAddingExercise(true)}
          style={{ whiteSpace: 'nowrap', opacity: 0.5 }}
        >
          [add_ex]
        </button>
      </div>
    </motion.div>
  );
};
