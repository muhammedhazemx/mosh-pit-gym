import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGym } from '../hooks/useGym';
import type { Routine } from '../db';

interface Props {
  onStartSession: (routine: Routine) => void;
  onViewHistory: () => void;
  onEditRoutine: (routine: Routine) => void;
}

export const ScreenLanding: React.FC<Props> = ({ onStartSession, onViewHistory, onEditRoutine }) => {
  const { routines } = useGym();
  const [selectedSplit, setSelectedSplit] = useState<'PPL' | 'UL' | 'FULL'>('PPL');
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredRoutines = routines?.filter(r => r.type === selectedSplit) || [];
  const currentRoutine = filteredRoutines[currentIndex];

  const nextRoutine = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredRoutines.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container"
      style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
    >
      <div style={{ position: 'absolute', top: '2rem', width: '100%', left: 0 }}>
        <h3 className="label-bracket" style={{ color: 'var(--fg-color)' }}>mosh pit gym</h3>
      </div>

      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
          {(['PPL', 'UL', 'FULL'] as const).map(split => (
            <button 
              key={split}
              onClick={() => { setSelectedSplit(split); setCurrentIndex(0); }}
              className="label-bracket"
              style={{ color: selectedSplit === split ? 'var(--fg-color)' : 'var(--muted-color)', border: 'none' }}
            >
              {split}
            </button>
          ))}
        </div>

        <motion.h1 
          key={currentRoutine?.name}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ fontSize: '5rem', cursor: 'pointer' }}
          onClick={nextRoutine}
        >
          {currentRoutine?.name || 'LOADING'}
        </motion.h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <button 
          className="brutalist-button"
          onClick={() => currentRoutine && onStartSession(currentRoutine)}
        >
          [start_session]
        </button>
        
        <button 
          className="label-bracket"
          onClick={() => currentRoutine && onEditRoutine(currentRoutine)}
        >
          [edit_routine]
        </button>

        <button 
          className="label-bracket"
          onClick={onViewHistory}
        >
          [view_history]
        </button>
      </div>

      <div style={{ position: 'absolute', bottom: '2rem', fontSize: '0.7rem', color: 'var(--muted-color)', textTransform: 'uppercase' }}>
        Raw energy logged locally.
      </div>
    </motion.div>
  );
};
