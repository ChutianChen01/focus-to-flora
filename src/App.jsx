import { useEffect, useMemo, useState } from 'react';
import Timer from './components/Timer';
import Garden from './components/Garden';
import History from './components/History';
import Stats from './components/Stats';
import Settings from './components/Settings';
import {
  defaultTags,
  loadSessions,
  loadGardenPlacements,
  loadTags,
  loadTheme,
  saveGardenPlacements,
  saveSessions,
  saveTags,
  saveTheme,
} from './utils/storage';

const views = [
  { id: 'timer', label: 'Timer' },
  { id: 'garden', label: 'Garden' },
  { id: 'stats', label: 'Stats' },
  { id: 'history', label: 'History' },
  { id: 'settings', label: 'Settings' },
];

export default function App() {
  const [activeView, setActiveView] = useState('timer');
  const [sessions, setSessions] = useState(() => loadSessions());
  const [gardenPlacements, setGardenPlacements] = useState(() => loadGardenPlacements());
  const [tags, setTags] = useState(() => loadTags());
  const [theme, setTheme] = useState(() => loadTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveGardenPlacements(gardenPlacements);
  }, [gardenPlacements]);

  useEffect(() => {
    saveTags(tags);
  }, [tags]);

  const completedCount = useMemo(() => sessions.filter((session) => session.status === 'completed').length, [sessions]);

  function addSession(record) {
    setSessions((current) => [...current, record]);
    setActiveView(record.status === 'completed' ? 'garden' : 'history');
  }

  function deleteSession(id) {
    const confirmed = window.confirm('Delete this session record?');
    if (confirmed) {
      setSessions((current) => current.filter((session) => session.id !== id));
      setGardenPlacements((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }
  }

  function clearAll() {
    const confirmed = window.confirm('Clear all sessions and custom app data from this browser?');
    if (confirmed) {
      setSessions([]);
      setGardenPlacements({});
      setTags(defaultTags);
      setTheme('dark');
    }
  }

  function addTag(tag) {
    if (tags.includes(tag)) return false;
    setTags((current) => [...current, tag]);
    return true;
  }

  function importBackup(data) {
    setSessions(data.sessions);
    setGardenPlacements(data.gardenPlacements || {});
    setTags([...new Set([...defaultTags, ...data.tags])]);
    setTheme(data.theme || 'dark');
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">local focus logbook</p>
          <h1>Focus to Flora</h1>
          <p>Trade measured focus sessions for a quiet browser garden.</p>
        </div>
        <div className="header-meter">
          <span>{completedCount}</span>
          <small>plants grown</small>
        </div>
      </header>

      <nav className="tab-nav" aria-label="Main views">
        {views.map((view) => (
          <button key={view.id} className={activeView === view.id ? 'active' : ''} onClick={() => setActiveView(view.id)}>
            {view.label}
          </button>
        ))}
      </nav>

      <main>
        {activeView === 'timer' && <Timer tags={tags} onAddTag={addTag} onSessionSaved={addSession} />}
        {activeView === 'garden' && (
          <Garden
            sessions={sessions}
            tags={tags}
            gardenPlacements={gardenPlacements}
            onGardenPlacementsChange={setGardenPlacements}
          />
        )}
        {activeView === 'stats' && <Stats sessions={sessions} />}
        {activeView === 'history' && (
          <History sessions={sessions} onDeleteSession={deleteSession} onClearAll={clearAll} />
        )}
        {activeView === 'settings' && (
          <Settings
            tags={tags}
            theme={theme}
            sessions={sessions}
            gardenPlacements={gardenPlacements}
            onAddTag={addTag}
            onThemeChange={setTheme}
            onImport={importBackup}
          />
        )}
      </main>
    </div>
  );
}
