import { calculateStats } from '../utils/stats';
import { formatMinutes } from '../utils/dateUtils';

export default function Stats({ sessions }) {
  const stats = calculateStats(sessions);
  const tagEntries = Object.entries(stats.byTag).sort((a, b) => b[1] - a[1]);
  const maxTagMinutes = Math.max(...tagEntries.map((entry) => entry[1]), 1);

  return (
    <section className="view-section">
      <div className="section-header">
        <div>
          <p className="section-kicker">Measurements</p>
          <h2>Focus statistics</h2>
        </div>
      </div>

      <div className="stat-grid">
        <Stat label="Today" value={formatMinutes(stats.todayMinutes)} />
        <Stat label="This week" value={formatMinutes(stats.weekMinutes)} />
        <Stat label="This month" value={formatMinutes(stats.monthMinutes)} />
        <Stat label="All time" value={formatMinutes(stats.allTimeMinutes)} />
        <Stat label="Completed" value={stats.completedCount} />
        <Stat label="Completion rate" value={`${stats.completionRate}%`} />
        <Stat label="Average length" value={formatMinutes(stats.averageCompletedMinutes)} />
      </div>

      <div className="tag-chart">
        <h3>Focus time by tag</h3>
        {tagEntries.length === 0 ? (
          <div className="empty-state compact">No completed sessions yet.</div>
        ) : (
          tagEntries.map(([tag, minutes]) => (
            <div className="tag-bar" key={tag}>
              <span>{tag}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${Math.max(6, (minutes / maxTagMinutes) * 100)}%` }} />
              </div>
              <strong>{formatMinutes(minutes)}</strong>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
