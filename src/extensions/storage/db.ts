import Dexie from 'dexie';

const db = new Dexie('VideoDatabase');

db.version(1).stores({
    videos: '++id,name,videoBlob'
});

export default db;
