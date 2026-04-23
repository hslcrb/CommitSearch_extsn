import { openDB, type IDBPDatabase } from 'idb';
import type { Commit, Repository } from './githubService';

const DB_NAME = 'CommitSearchDB';
const STORE_NAME = 'commits';
const REPO_STORE = 'repositories';
const SETTINGS_STORE = 'settings';

export interface GoalSettings {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    displayMode: 'percentage' | 'count';
    language: 'en' | 'ko';
}

const DEFAULT_SETTINGS: GoalSettings = {
    daily: 1,
    weekly: 5,
    monthly: 20,
    yearly: 365,
    displayMode: 'count',
    language: 'ko'
};

export class StorageService {
    private db: Promise<IDBPDatabase>;

    constructor() {
        this.db = openDB(DB_NAME, 3, {
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
                if (oldVersion < 3) {
                    if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
                        db.createObjectStore(SETTINGS_STORE);
                    }
                }
            },
        });
    }

    async saveSettings(settings: GoalSettings) {
        const db = await this.db;
        await db.put(SETTINGS_STORE, settings, 'user_settings');
    }

    async getSettings(): Promise<GoalSettings> {
        const db = await this.db;
        const settings = await db.get(SETTINGS_STORE, 'user_settings');
        return settings || DEFAULT_SETTINGS;
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
