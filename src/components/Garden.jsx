import { useEffect, useMemo, useRef, useState } from 'react';
import { formatDateTime, formatMinutes } from '../utils/dateUtils';
import { PlantMark } from './Timer';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function Garden({ sessions, tags, gardenPlacements, onGardenPlacementsChange }) {
  const [filter, setFilter] = useState('all');
  const [dragPreview, setDragPreview] = useState(null);
  const groundRef = useRef(null);

  const completed = useMemo(
    () => sessions.filter((session) => session.status === 'completed'),
    [sessions],
  );
  const visibleCompleted = useMemo(
    () => completed.filter((session) => filter === 'all' || session.tag === filter),
    [completed, filter],
  );
  const unplanted = visibleCompleted.filter((session) => !gardenPlacements[session.id]);
  const planted = visibleCompleted.filter((session) => gardenPlacements[session.id]);
  const draggedSession = dragPreview ? completed.find((session) => session.id === dragPreview.sessionId) : null;

  useEffect(() => {
    if (!dragPreview) return undefined;
    const sessionId = dragPreview.sessionId;

    function handlePointerMove(event) {
      setDragPreview((current) => current && { ...current, x: event.clientX, y: event.clientY });
    }

    function handlePointerUp(event) {
      const rect = groundRef.current?.getBoundingClientRect();
      if (rect) {
        const isOverGround =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (isOverGround) {
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          plantAt(sessionId, x, y);
        }
      }

      setDragPreview(null);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragPreview?.sessionId, onGardenPlacementsChange]);

  function plantAt(sessionId, x, y) {
    onGardenPlacementsChange((current) => ({
      ...current,
      [sessionId]: {
        x: clamp(Math.round(x), 4, 96),
        y: clamp(Math.round(y), 8, 92),
      },
    }));
  }

  function plantInOpenSpot(sessionId) {
    const plantedCount = Object.keys(gardenPlacements).length;
    const col = plantedCount % 5;
    const row = Math.floor(plantedCount / 5) % 4;
    plantAt(sessionId, 14 + col * 18, 22 + row * 20);
  }

  function unplant(sessionId) {
    onGardenPlacementsChange((current) => {
      const next = { ...current };
      delete next[sessionId];
      return next;
    });
  }

  function startPointerDrag(event, sessionId) {
    if (event.target.closest('button')) return;
    event.preventDefault();
    setDragPreview({
      sessionId,
      x: event.clientX,
      y: event.clientY,
    });
  }

  return (
    <section className="view-section garden-view">
      <div className="section-header">
        <div>
          <p className="section-kicker">Garden</p>
          <h2>Plant your completed focus flora</h2>
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
        <div className="empty-state">Complete a focus session to grow the first flora for your library.</div>
      ) : (
        <div className="garden-builder">
          <aside className="flora-library" aria-label="Grown flora library">
            <div className="library-header">
              <h3>Flora library</h3>
              <span>{unplanted.length} ready</span>
            </div>
            {unplanted.length === 0 ? (
              <div className="empty-state compact">All visible flora are planted.</div>
            ) : (
              <div className="library-list">
                {unplanted.map((session) => (
                  <article
                    key={session.id}
                    className={`library-flora ${dragPreview?.sessionId === session.id ? 'is-dragging' : ''}`}
                    onPointerDown={(event) => startPointerDrag(event, session.id)}
                  >
                    <PlantMark type={session.plantType} compact />
                    <div>
                      <strong>{session.plantType}</strong>
                      <span>
                        {formatMinutes(session.actualMinutes)} · {session.tag}
                      </span>
                    </div>
                    <button type="button" onClick={() => plantInOpenSpot(session.id)}>
                      Plant
                    </button>
                  </article>
                ))}
              </div>
            )}
          </aside>

          <div
            ref={groundRef}
            className="garden-ground"
            aria-label="Garden ground"
          >
            {planted.map((session) => {
              const placement = gardenPlacements[session.id];
              return (
                <div
                  key={session.id}
                  className={`planted-flora ${dragPreview?.sessionId === session.id ? 'is-dragging' : ''}`}
                  style={{ left: `${placement.x}%`, top: `${placement.y}%` }}
                  onPointerDown={(event) => startPointerDrag(event, session.id)}
                  title={`${formatDateTime(session.endedAt)}\n${formatMinutes(session.actualMinutes)}\n${session.tag}`}
                >
                  <PlantMark type={session.plantType} />
                  <div className="plot-detail">
                    {formatDateTime(session.endedAt)}
                    <br />
                    {formatMinutes(session.actualMinutes)} · {session.tag}
                    {session.note ? (
                      <>
                        <br />
                        {session.note}
                      </>
                    ) : null}
                    <button type="button" onClick={() => unplant(session.id)}>
                      Return to library
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {draggedSession && (
        <div className="flora-drag-ghost" style={{ left: dragPreview.x, top: dragPreview.y }} aria-hidden="true">
          <PlantMark type={draggedSession.plantType} />
        </div>
      )}
    </section>
  );
}
