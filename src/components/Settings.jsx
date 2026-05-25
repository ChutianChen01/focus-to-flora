import { useState } from 'react';
import BackupRestore from './BackupRestore';
import { themes } from '../utils/storage';

export default function Settings({ tags, theme, sessions, gardenPlacements, onAddTag, onThemeChange, onImport }) {
  const [newTag, setNewTag] = useState('');
  const [message, setMessage] = useState('');

  function submitTag(event) {
    event.preventDefault();
    const trimmed = newTag.trim().toLowerCase();
    if (!trimmed) return;
    const added = onAddTag(trimmed);
    setMessage(added ? `Added tag "${trimmed}".` : 'That tag already exists.');
    setNewTag('');
  }

  return (
    <section className="view-section settings-layout">
      <div className="section-header">
        <div>
          <p className="section-kicker">Controls</p>
          <h2>Settings</h2>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-panel">
          <h3>Theme</h3>
          <div className="theme-grid">
            {themes.map((themeName) => (
              <button
                key={themeName}
                className={theme === themeName ? 'selected' : ''}
                onClick={() => onThemeChange(themeName)}
              >
                {themeName}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-panel">
          <h3>Tags</h3>
          <div className="tag-cloud">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <form className="tag-form" onSubmit={submitTag}>
            <input value={newTag} onChange={(event) => setNewTag(event.target.value)} placeholder="New tag" />
            <button type="submit">Add tag</button>
          </form>
          {message && <p className="settings-message">{message}</p>}
        </div>

        <BackupRestore
          sessions={sessions}
          tags={tags}
          theme={theme}
          gardenPlacements={gardenPlacements}
          onImport={onImport}
        />
      </div>
    </section>
  );
}
