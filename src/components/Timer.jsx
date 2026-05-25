import { useEffect, useMemo, useRef, useState } from 'react';
import { formatTimer } from '../utils/dateUtils';

const presets = [25, 50, 60, 90];
const plantOptions = [
  { value: 'flower', label: 'Flower', minutes: 25, icon: 'flower' },
  { value: 'small tree', label: 'Small tree', minutes: 50, icon: 'small-tree' },
  { value: 'pine tree', label: 'Pine tree', minutes: 60, icon: 'pine' },
  { value: 'large tree', label: 'Large tree', minutes: 90, icon: 'large-tree' },
];

export function plantForMinutes(minutes) {
  if (Number(minutes) >= 90) return 'large tree';
  if (Number(minutes) >= 60) return 'pine tree';
  if (Number(minutes) >= 50) return 'small tree';
  return 'flower';
}

export function PlantMark({ type, status = 'completed', compact = false }) {
  const normalized = type || 'flower';
  return (
    <span className={`plant-mark ${compact ? 'compact' : ''} ${status}`} aria-label={`${normalized} plant`}>
      {normalized === 'flower' && (
        <>
          <span className="petals" />
          <span className="stem" />
        </>
      )}
      {normalized === 'small tree' && (
        <>
          <span className="canopy small" />
          <span className="trunk" />
        </>
      )}
      {normalized === 'pine tree' && (
        <>
          <span className="pine one" />
          <span className="pine two" />
          <span className="trunk" />
        </>
      )}
      {normalized === 'large tree' && (
        <>
          <span className="canopy large" />
          <span className="canopy side" />
          <span className="trunk" />
        </>
      )}
    </span>
  );
}

export default function Timer({ tags, onSessionSaved }) {
  const [plannedMinutes, setPlannedMinutes] = useState(50);
  const [customMinutes, setCustomMinutes] = useState('');
  const [tag, setTag] = useState(tags[0] || 'lab');
  const [plantType, setPlantType] = useState('small tree');
  const [note, setNote] = useState('');
  const [session, setSession] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(50 * 60);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const actualPlannedMinutes = useMemo(() => {
    const custom = Number(customMinutes);
    return customMinutes && custom > 0 ? Math.round(custom) : plannedMinutes;
  }, [customMinutes, plannedMinutes]);

  useEffect(() => {
    if (!session) setRemainingSeconds(actualPlannedMinutes * 60);
  }, [actualPlannedMinutes, session]);

  useEffect(() => {
    if (!session || isPaused) return undefined;

    intervalRef.current = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(intervalRef.current);
          finishSession('completed', 0);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalRef.current);
  }, [session, isPaused]);

  function createRecord(status, remainingOverride = remainingSeconds) {
    const endedAt = new Date();
    const elapsedMinutes = Math.round((session.plannedMinutes * 60 - remainingOverride) / 60);
    const actualMinutes = status === 'completed' ? Math.max(1, elapsedMinutes) : Math.max(0, elapsedMinutes);

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      startedAt: session.startedAt,
      endedAt: endedAt.toISOString(),
      plannedMinutes: session.plannedMinutes,
      actualMinutes,
      status,
      tag: session.tag,
      note: session.note,
      plantType: session.plantType,
      createdAt: endedAt.toISOString(),
    };
  }

  function finishSession(status, remainingOverride = remainingSeconds) {
    if (!session) return;
    const record = createRecord(status, remainingOverride);
    onSessionSaved(record);
    setSession(null);
    setIsPaused(false);
    setRemainingSeconds(actualPlannedMinutes * 60);
  }

  function startSession() {
    const minutes = Math.min(480, Math.max(1, actualPlannedMinutes));
    setSession({
      startedAt: new Date().toISOString(),
      plannedMinutes: minutes,
      tag,
      note: note.trim(),
      plantType,
    });
    setRemainingSeconds(minutes * 60);
    setIsPaused(false);
  }

  function cancelSession() {
    if (!session) return;
    const confirmed = window.confirm('Cancel this focus session? It will be saved as cancelled.');
    if (confirmed) finishSession('cancelled');
  }

  function selectPreset(minutes) {
    setPlannedMinutes(minutes);
    setCustomMinutes('');
    setPlantType(plantForMinutes(minutes));
  }

  return (
    <section className="timer-grid">
      <div className="timer-panel">
        <p className="section-kicker">Current trial</p>
        <div className="timer-face" aria-live="polite">
          {formatTimer(remainingSeconds)}
        </div>
        <div className="timer-meta">
          <span>{session ? `${session.plannedMinutes} minute plan` : `${actualPlannedMinutes} minute plan`}</span>
          <span>{session ? (isPaused ? 'paused' : 'running') : 'ready'}</span>
        </div>

        <div className="timer-actions">
          {!session && (
            <button className="primary" onClick={startSession}>
              Start
            </button>
          )}
          {session && !isPaused && (
            <button className="primary" onClick={() => setIsPaused(true)}>
              Pause
            </button>
          )}
          {session && isPaused && (
            <button className="primary" onClick={() => setIsPaused(false)}>
              Resume
            </button>
          )}
          {session && (
            <>
              <button onClick={() => finishSession('completed')}>Complete</button>
              <button className="danger" onClick={cancelSession}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="setup-panel">
        <p className="section-kicker">Setup</p>
        <label>
          Duration
          <div className="preset-row">
            {presets.map((minutes) => (
              <button
                key={minutes}
                className={actualPlannedMinutes === minutes && !customMinutes ? 'selected' : ''}
                disabled={Boolean(session)}
                onClick={() => selectPreset(minutes)}
              >
                {minutes}
              </button>
            ))}
          </div>
        </label>

        <label>
          Custom minutes
          <input
            type="number"
            min="1"
            max="480"
            value={customMinutes}
            disabled={Boolean(session)}
            onChange={(event) => {
              setCustomMinutes(event.target.value);
              const minutes = Number(event.target.value);
              if (minutes > 0) setPlantType(plantForMinutes(minutes));
            }}
            placeholder="Optional"
          />
        </label>

        <label>
          Tag
          <select value={tag} disabled={Boolean(session)} onChange={(event) => setTag(event.target.value)}>
            {tags.map((tagName) => (
              <option key={tagName} value={tagName}>
                {tagName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Plant
          <div className="plant-select">
            {plantOptions.map((plant) => (
              <button
                key={plant.value}
                className={plantType === plant.value ? 'selected plant-option' : 'plant-option'}
                disabled={Boolean(session)}
                onClick={() => setPlantType(plant.value)}
              >
                <PlantMark type={plant.value} compact />
                <span>{plant.label}</span>
              </button>
            ))}
          </div>
        </label>

        <label>
          Note
          <textarea
            value={note}
            disabled={Boolean(session)}
            onChange={(event) => setNote(event.target.value)}
            rows="3"
            placeholder="Optional observation"
          />
        </label>
      </div>
    </section>
  );
}
