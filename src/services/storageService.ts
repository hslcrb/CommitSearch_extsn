import { openDB, type IDBPDatabase } from 'idb';
import type { Commit } from './githubService';

const DB_NAME = 'CommitSearchDB';
const STORE_NAME = 'commits';

export class StorageService {
    private db: Promise<IDBPDatabase>;

    constructor() {
        this.db = openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'sha' });
                    store.createIndex('date', 'date');
                    store.createIndex('repoName', 'repoName');
                }
            },
        });
    }

    async saveCommits(commits: Commit[]) {
        const db = await this.db;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        for (const commit of commits) {
            tx.store.put(commit);
        }
        await tx.done;
    }

    async getAllCommits(): Promise<Commit[]> {
        const db = await this.db;
        return db.getAll(STORE_NAME);
    }

    async clearAll() {
        const db = await this.db;
        await db.clear(STORE_NAME);
    }
}

export const storageService = new StorageService();
