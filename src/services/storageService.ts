import { openDB, type IDBPDatabase } from 'idb';
import type { Commit, Repository } from './githubService';

const DB_NAME = 'CommitSearchDB';
const STORE_NAME = 'commits';
const REPO_STORE = 'repositories';

export class StorageService {
    private db: Promise<IDBPDatabase>;

    constructor() {
        this.db = openDB(DB_NAME, 2, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'sha' });
                    store.createIndex('date', 'date');
                    store.createIndex('repoName', 'repoName');
                }
                if (oldVersion < 2) {
                    if (!db.objectStoreNames.contains(REPO_STORE)) {
                        db.createObjectStore(REPO_STORE, { keyPath: 'full_name' });
                    }
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

    async saveRepositories(repos: Repository[]) {
        const db = await this.db;
        const tx = db.transaction(REPO_STORE, 'readwrite');
        for (const repo of repos) {
            tx.store.put(repo);
        }
        await tx.done;
    }

    async getAllRepositories(): Promise<Repository[]> {
        const db = await this.db;
        return db.getAll(REPO_STORE);
    }

    async clearAll() {
        const db = await this.db;
        await db.clear(STORE_NAME);
        if (db.objectStoreNames.contains(REPO_STORE)) {
            await db.clear(REPO_STORE);
        }
    }
}

export const storageService = new StorageService();
