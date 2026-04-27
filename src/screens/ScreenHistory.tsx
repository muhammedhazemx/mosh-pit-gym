import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGym } from '../hooks/useGym';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type WorkoutSet } from '../db';

interface Props {
  onBack: () => void;
}

const SessionItem: React.FC<{ session: any; onDelete: (id: number) => void }> = ({ session, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const { deleteSet } = useGym();
  
  const sets = useLiveQuery(
    () => db.sets.where('sessionId').equals(session.id).toArray(),
    [session.id]
  );

  const groupedSets = sets?.reduce((acc: Record<string, WorkoutSet[]>, set) => {
    if (!acc[set.exerciseName]) acc[set.exerciseName] = [];
    acc[set.exerciseName].push(set);
    return acc;
  }, {});

  const handleDeleteSet = async (e: React.MouseEvent, setId: number) => {
    e.stopPropagation();
    if (confirm('Delete this set?')) {
      await deleteSet(setId);
    }
  };

  return (
    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
      <div 
        style={{ cursor: 'pointer' }} 
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ fontSize: '2rem' }}>{session.routineName}</h2>
          <span className="label-bracket">{session.date.toLocaleDateString()}</span>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="label-bracket">{expanded ? '[hide_details]' : 'energy_logged'}</span>
          <button className="label-bracket" onClick={(e) => { e.stopPropagation(); onDelete(session.id!); }} style={{ opacity: 0.5 }}>[delete_session]</button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginTop: '1.5rem' }}
          >
            {groupedSets && Object.entries(groupedSets).map(([name, exSets]) => (
              <div key={name} style={{ marginBottom: '1.5rem' }}>
                <h3 className="label-bracket" style={{ color: 'var(--fg-color)', marginBottom: '0.5rem', fontSize: '1rem' }}>{name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {exSets.map((set) => (
                    <div key={set.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '1rem' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                        {set.weight}KG × {set.reps}
                        <span className="label-bracket" style={{ marginLeft: '1rem', fontSize: '0.7rem' }}>
                          {set.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                      <button className="label-bracket" onClick={(e) => handleDeleteSet(e, set.id!)} style={{ opacity: 0.3 }}>[x]</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ScreenHistory: React.FC<Props> = ({ onBack }) => {
  const { history, deleteSession } = useGym();

  const handleDelete = async (id: number) => {
    if (confirm('Permanently delete this session log?')) {
      await deleteSession(id);
    }
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

      <h1 style={{ fontSize: '3.5rem', marginBottom: '2rem' }}>HISTORY</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {history?.map(session => (
          <SessionItem key={session.id} session={session} onDelete={handleDelete} />
        ))}

        {history?.length === 0 && (
          <p className="label-bracket">no sessions logged yet.</p>
        )}
      </div>
    </motion.div>
  );
};
