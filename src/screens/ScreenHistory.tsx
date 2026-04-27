import { motion } from 'framer-motion';
import { useGym } from '../hooks/useGym';

interface Props {
  onBack: () => void;
}

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
          <div key={session.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 style={{ fontSize: '2rem' }}>{session.routineName}</h2>
              <span className="label-bracket">{session.date.toLocaleDateString()}</span>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span className="label-bracket">energy_logged</span>
               <button className="label-bracket" onClick={() => handleDelete(session.id!)} style={{ opacity: 0.5 }}>[delete]</button>
            </div>
          </div>
        ))}

        {history?.length === 0 && (
          <p className="label-bracket">no sessions logged yet.</p>
        )}
      </div>
    </motion.div>
  );
};
