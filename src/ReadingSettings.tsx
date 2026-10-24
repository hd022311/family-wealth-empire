import { useEffect, useState } from 'react';
const key = 'fwe-reading-size-v1';
/** Device preference only: never changes State v4 or cloud save contents. */
export function ReadingSettings() {
  const [size, setSize] = useState(() => {
    try { const value = localStorage.getItem(key); return value === '125' || value === '150' ? value : '100'; }
    catch { return '100'; }
  });
  useEffect(() => {
    document.documentElement.dataset.textSize = size;
    try { localStorage.setItem(key, size); } catch { /* Reading remains available without storage. */ }
  }, [size]);
  return <div className="reading-settings"><label htmlFor="reading-size">文字大小</label>
    <select id="reading-size" value={size} onChange={e => setSize(e.target.value)}>
      <option value="100">100% · 標準</option><option value="125">125% · 大字</option><option value="150">150% · 特大</option>
    </select><span>只調整閱讀，不影響遊戲進度</span></div>;
}
