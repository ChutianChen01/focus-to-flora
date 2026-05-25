import { useEffect, useMemo, useRef, useState } from 'react';
import { formatTimer } from '../utils/dateUtils';

const presets = [25, 50, 60, 90];
const shortPlants = [
  { value: 'flower', label: 'Flower' },
  { value: 'bush', label: 'Bush' },
  { value: 'fungi', label: 'Fungi' },
];
const mediumPlants = [
  { value: 'pine tree', label: 'Pine' },
  { value: 'poplar tree', label: 'Poplar' },
  { value: 'oak tree', label: 'Oak' },
  { value: 'small tree', label: 'Young tree' },
];
const longPlants = [
  { value: 'large tree', label: 'Large tree' },
  { value: 'oak tree', label: 'Oak' },
  { value: 'pine tree', label: 'Pine' },
  { value: 'poplar tree', label: 'Poplar' },
];

export function plantOptionsForMinutes(minutes) {
  const duration = Number(minutes);
  if (duration < 30) return shortPlants;
  if (duration <= 90) return mediumPlants;
  return longPlants;
}

export function plantForMinutes(minutes) {
  if (Number(minutes) > 90) return 'large tree';
  if (Number(minutes) >= 30) return 'oak tree';
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
      {normalized === 'bush' && (
        <>
          <span className="bush-leaf left" />
          <span className="bush-leaf center" />
          <span className="bush-leaf right" />
        </>
      )}
      {normalized === 'fungi' && (
        <>
          <span className="fungi-cap main" />
          <span className="fungi-stem main" />
          <span className="fungi-cap small" />
          <span className="fungi-stem small" />
        </>
      )}
      {normalized === 'pine tree' && (
        <>
          <span className="pine one" />
          <span className="pine two" />
          <span className="trunk" />
        </>
      )}
      {normalized === 'poplar tree' && (
        <>
          <span className="poplar" />
          <span className="trunk" />
        </>
      )}
      {normalized === 'oak tree' && (
        <>
          <span className="canopy oak main" />
          <span className="canopy oak left" />
          <span className="canopy oak right" />
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

export default function Timer({ tags, onAddTag, onSessionSaved }) {
  const [plannedMinutes, setPlannedMinutes] = useState(50);
  const [customMinutes, setCustomMinutes] = useState('');
  const [tag, setTag] = useState(tags[0] || 'lab');
  const [newTag, setNewTag] = useState('');
  const [tagMessage, setTagMessage] = useState('');
  const [plantType, setPlantType] = useState('oak tree');
  const [note, setNote] = useState('');
  const [session, setSession] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(50 * 60);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const actualPlannedMinutes = useMemo(() => {
    const custom = Number(customMinutes);
    const minutes = customMinutes && custom > 0 ? Math.round(custom) : plannedMinutes;
    return Math.min(480, Math.max(10, minutes));
  }, [customMinutes, plannedMinutes]);
  const availablePlants = useMemo(() => plantOptionsForMinutes(actualPlannedMinutes), [actualPlannedMinutes]);

  useEffect(() => {
    if (!session) setRemainingSeconds(actualPlannedMinutes * 60);
  }, [actualPlannedMinutes, session]);

  useEffect(() => {
    if (!tags.includes(tag)) setTag(tags[0] || 'other');
  }, [tag, tags]);

  useEffect(() => {
    if (!session && !availablePlants.some((plant) => plant.value === plantType)) {
      setPlantType(availablePlants[0].value);
    }
  }, [availablePlants, plantType, session]);

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
    const minutes = Math.min(480, Math.max(10, actualPlannedMinutes));
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
  }

  function addCustomTag(event) {
    event.preventDefault();
    const trimmed = newTag.trim().toLowerCase();
    if (!trimmed) return;
    const added = onAddTag(trimmed);
    setTag(trimmed);
    setNewTag('');
    setTagMessage(added ? `Added "${trimmed}".` : `Using existing "${trimmed}".`);
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
            min="10"
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
          <form className="quick-tag-form" onSubmit={addCustomTag}>
            <input
              value={newTag}
              disabled={Boolean(session)}
              onChange={(event) => setNewTag(event.target.value)}
              placeholder="Add custom tag"
            />
            <button type="submit" disabled={Boolean(session) || !newTag.trim()}>
              Add
            </button>
          </form>
          {tagMessage && <span className="field-note">{tagMessage}</span>}
        </label>

        <label>
          Plant
          <span className="field-note">
            {actualPlannedMinutes <= 20
              ? 'Small-plant sessions start at 10 minutes.'
              : actualPlannedMinutes < 30
                ? 'Sessions under 30 minutes allow flowers, bushes, and fungi.'
                : actualPlannedMinutes <= 90
                  ? 'Tree sessions run from 30 to 90 minutes.'
                : 'Long sessions keep the full tree nursery available.'}
          </span>
          <div className="plant-select">
            {availablePlants.map((plant) => (
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
