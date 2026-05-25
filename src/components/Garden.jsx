import { useMemo, useState } from 'react';
import { formatDateTime, formatMinutes } from '../utils/dateUtils';
import { PlantMark } from './Timer';

export default function Garden({ sessions, tags }) {
  const [filter, setFilter] = useState('all');
  const completed = useMemo(
    () => sessions.filter((session) => session.status === 'completed' && (filter === 'all' || session.tag === filter)),
    [sessions, filter],
  );

  return (
    <section className="view-section">
      <div className="section-header">
        <div>
          <p className="section-kicker">Garden</p>
          <h2>Completed focus plants</h2>
        </div>
        <label className="inline-label">
          Filter
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">all tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
      </div>

      {completed.length === 0 ? (
        <div className="empty-state">Complete a focus session to plant the first entry.</div>
      ) : (
        <div className="garden-grid">
          {completed.map((session) => (
            <button key={session.id} className="garden-plot" title={`${formatDateTime(session.endedAt)}\n${session.tag}`}>
              <PlantMark type={session.plantType} />
              <span className="plot-tag">{session.tag}</span>
              <span className="plot-detail">
                {formatDateTime(session.endedAt)}
                <br />
                {formatMinutes(session.actualMinutes)}
                {session.note ? ` - ${session.note}` : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
