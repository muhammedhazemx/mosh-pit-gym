import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGym } from '../hooks/useGym';
import type { Routine } from '../db';

interface Props {
  routine: Routine;
  onBack: () => void;
}

export const ScreenEditRoutine: React.FC<Props> = ({ routine, onBack }) => {
  const { updateRoutine } = useGym();
  const [exercises, setExercises] = useState<string[]>(routine.exercises);
  const [newExercise, setNewExercise] = useState('');

  const handleAdd = () => {
    if (!newExercise) return;
    const updated = [...exercises, newExercise.toUpperCase()];
    setExercises(updated);
    setNewExercise('');
    updateRoutine(routine.id!, updated);
  };

  const handleRemove = (index: number) => {
    const updated = exercises.filter((_, i) => i !== index);
    setExercises(updated);
    updateRoutine(routine.id!, updated);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container"
    >
      <div style={{ marginBottom: '2rem' }}>
        <button className="label-bracket" onClick={onBack}>[back]</button>
      </div>

      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>EDIT {routine.name}</h1>
      <span className="label-bracket" style={{ display: 'block', marginBottom: '3rem' }}>config_routine</span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
        {exercises.map((ex, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>{ex}</h2>
            <button className="label-bracket" onClick={() => handleRemove(idx)}>[remove]</button>
          </div>
        ))}

        <div style={{ marginTop: '2rem' }}>
          <input 
            type="text" 
            placeholder="NEW EXERCISE" 
            value={newExercise}
            onChange={e => setNewExercise(e.target.value)}
            style={{ fontSize: '2rem', width: '100%', fontWeight: 700, borderBottom: '2px solid var(--fg-color)', marginBottom: '1rem' }}
          />
          <button className="brutalist-button" onClick={handleAdd} style={{ width: '100%' }}>[add_to_routine]</button>
        </div>
      </div>
    </motion.div>
  );
};
