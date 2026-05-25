import { formatDateTime, formatMinutes } from '../utils/dateUtils';
import { PlantMark } from './Timer';

export default function History({ sessions, onDeleteSession, onClearAll }) {
  return (
    <section className="view-section">
      <div className="section-header">
        <div>
          <p className="section-kicker">Logbook</p>
          <h2>Session history</h2>
        </div>
        <button className="danger" disabled={!sessions.length} onClick={onClearAll}>
          Clear all data
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-state">No sessions have been recorded yet.</div>
      ) : (
        <div className="history-list">
          {[...sessions]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((session) => (
              <article key={session.id} className={`history-card ${session.status}`}>
                <div className="history-plant">
                  <PlantMark type={session.plantType} status={session.status} compact />
                </div>
                <div>
                  <div className="history-title">
                    <strong>{formatDateTime(session.endedAt)}</strong>
                    <span className={`status-pill ${session.status}`}>{session.status}</span>
                  </div>
                  <div className="history-meta">
                    <span>{formatMinutes(session.actualMinutes)} actual</span>
                    <span>{formatMinutes(session.plannedMinutes)} planned</span>
                    <span>{session.tag}</span>
                    <span>{session.plantType}</span>
                  </div>
                  {session.note && <p>{session.note}</p>}
                </div>
                <button className="ghost danger-text" onClick={() => onDeleteSession(session.id)}>
                  Delete
                </button>
              </article>
            ))}
        </div>
      )}
    </section>
  );
}
