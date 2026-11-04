import { getDb } from './db';

const db = getDb();

// 1. Update featured video vid-1 with high-definition sample YouTube video that autoplays
db.prepare('UPDATE videos SET video_url = ? WHERE id = ?').run(
  'https://www.youtube.com/watch?v=ScMzIvxBSi4',
  'vid-1'
);

// 2. Update vid-2 (Deep Space Telemetry)
db.prepare('UPDATE videos SET video_url = ? WHERE id = ?').run(
  'https://www.youtube.com/watch?v=21X5lGlDOfg',
  'vid-2'
);

// 3. Update vid-3 (Chief Economic Advisor Interview)
db.prepare('UPDATE videos SET video_url = ? WHERE id = ?').run(
  'https://www.youtube.com/watch?v=yPYZpwSpKmA',
  'vid-3'
);

// 4. Update vid-4 (Vanishing Sholas Documentary)
db.prepare('UPDATE videos SET video_url = ? WHERE id = ?').run(
  'https://www.youtube.com/watch?v=lTRiuFIWV54',
  'vid-4'
);

// 5. Update live stream in editorial settings
db.prepare('INSERT OR REPLACE INTO editorial_settings (key, value) VALUES (?, ?)').run(
  'live_stream_url',
  'https://www.youtube.com/watch?v=21X5lGlDOfg'
);

console.log('Successfully updated video URLs in database!');
const vids = db.prepare("SELECT id, title, video_url, is_featured FROM videos WHERE id IN ('vid-1', 'vid-2', 'vid-3', 'vid-4')").all();
console.log(vids);
