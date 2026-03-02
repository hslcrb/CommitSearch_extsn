/// <reference types="chrome" />
import { useState, useEffect, useMemo } from 'react';
import { Search, Github, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitHubService, type Commit } from './services/githubService';
import { storageService } from './services/storageService';
import { searchEngine } from './services/searchEngine';

function App() {
  const [query, setQuery] = useState('');
  const [commits, setCommits] = useState<Commit[]>([]);
  const [token, setToken] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Load existing commits from Storage
    storageService.getAllCommits().then(storedCommits => {
      setCommits(storedCommits);
      searchEngine.indexCommits(storedCommits);
    });
    // For demo/setup: try to get token from storage
    chrome.storage.local.get(['github_token'], (result: Record<string, any>) => {
      if (result.github_token) setToken(result.github_token);
    });
  }, []);

  const filteredResults = useMemo(() => {
    if (!query) return commits.slice(0, 20); // Default recent
    return searchEngine.search(query, commits);
  }, [query, commits]);

  const handleSync = async () => {
    if (!token) {
      const input = prompt('Please enter your GitHub Personal Access Token:');
      if (input) {
        setToken(input);
        chrome.storage.local.set({ github_token: input });
      } else return;
    }

    setIsSyncing(true);
    setStatus('Fetching repositories...');
    const github = new GitHubService(token);

    try {
      const repos = await github.fetchUserRepositories();
      let allNewCommits: Commit[] = [];

      for (const repo of repos) {
        setStatus(`Syncing ${repo.name}...`);
        const repoCommits = await github.fetchCommits(repo.full_name);
        allNewCommits = [...allNewCommits, ...repoCommits];
      }

      setStatus('Saving to local database...');
      await storageService.saveCommits(allNewCommits);
      searchEngine.indexCommits(allNewCommits);
      setCommits(allNewCommits);
      setStatus('Sync complete!');
    } catch (err) {
      console.error(err);
      setStatus('Sync failed. Check token.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div className="app-container">
      <header className="search-header">
        <h1 className="search-title">CommitSearch</h1>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button className="primary" onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <Github size={16} />}
            <span style={{ marginLeft: '8px' }}>{isSyncing ? 'Syncing...' : 'Sync GitHub'}</span>
          </button>
        </div>
        {status && <div className="status-bar">{status}</div>}
      </header>

      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-box"
          placeholder="Search commit messages, repos, or authors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <Search style={{ position: 'absolute', right: '16px', top: '14px', color: '#94a3b8' }} size={20} />
      </div>

      <div className="results-list">
        <AnimatePresence>
          {filteredResults.map((commit, idx) => (
            <motion.div
              key={commit.sha}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="commit-card"
              onClick={() => window.open(commit.url, '_blank')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="commit-message">{commit.message}</span>
                <ExternalLink size={14} style={{ color: '#94a3b8' }} />
              </div>
              <div className="commit-meta">
                <span>{commit.repoName}</span>
                <span>{new Date(commit.date).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredResults.length === 0 && query && (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>No matches found.</div>
        )}
      </div>
    </div>
  );
}

export default App;
