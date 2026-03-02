import { Index } from 'flexsearch';
import type { Commit } from './githubService';

export class SearchEngine {
    private index: Index;

    constructor() {
        this.index = new Index({
            tokenize: 'forward',
            resolution: 9,
        });
    }

    indexCommits(commits: Commit[]) {
        for (const commit of commits) {
            this.index.add(commit.sha, `${commit.message} ${commit.repoName} ${commit.author}`);
        }
    }

    search(query: string, allCommits: Commit[]): Commit[] {
        const results = this.index.search(query, { limit: 50 });
        return allCommits.filter(c => results.includes(c.sha as any));
    }
}

export const searchEngine = new SearchEngine();
