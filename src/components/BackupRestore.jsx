import { useRef, useState } from 'react';
import { buildBackup, validateBackup } from '../utils/storage';

export default function BackupRestore({ sessions, tags, theme, onImport }) {
  const inputRef = useRef(null);
  const [message, setMessage] = useState('');

  function exportJson() {
    const backup = buildBackup(sessions, tags, theme);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `focus-to-flora-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Backup exported.');
  }

  async function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = JSON.parse(await file.text());
      const validation = validateBackup(data);
      if (!validation.ok) {
        setMessage(validation.message);
        return;
      }

      const confirmed = window.confirm('Importing this file will replace current sessions, tags, and theme. Continue?');
      if (!confirmed) return;

      onImport(data);
      setMessage('Backup imported.');
    } catch {
      setMessage('Could not read the selected JSON file.');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <div className="backup-panel">
      <div>
        <h3>Backup and restore</h3>
        <p>Export a JSON copy of local browser data or replace it with a valid backup file.</p>
      </div>
      <div className="backup-actions">
        <button onClick={exportJson}>Export JSON</button>
        <button onClick={() => inputRef.current?.click()}>Import JSON</button>
        <input ref={inputRef} type="file" accept="application/json" hidden onChange={importJson} />
      </div>
      {message && <p className="settings-message">{message}</p>}
    </div>
  );
}
