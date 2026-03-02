/// <reference types="chrome" />
import { useState, useEffect, useMemo } from 'react';
import { Search, Github, RefreshCw, ExternalLink, Filter, ChevronDown, SortAsc, SortDesc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitHubService, type Commit, type Repository } from './services/githubService';
import { storageService } from './services/storageService';
import { searchEngine } from './services/searchEngine';

function App() {
  const [query, setQuery] = useState('');
  const [commits, setCommits] = useState<Commit[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [token, setToken] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState('');

  // Filters
  const [selectedRepo, setSelectedRepo] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    storageService.getAllCommits().then(storedCommits => {
      setCommits(storedCommits);
      searchEngine.indexCommits(storedCommits);
    });
    storageService.getAllRepositories().then(storedRepos => {
      setRepos(storedRepos);
    });
    chrome.storage.local.get(['github_token'], (result: Record<string, any>) => {
      if (result.github_token) setToken(result.github_token);
    });
  }, []);

  const filteredResults = useMemo(() => {
    let result = query ? searchEngine.search(query, commits) : [...commits];

    // Filter by Repository
    if (selectedRepo !== 'all') {
      result = result.filter(c => c.repoName === selectedRepo);
    }

    // Filter by Visibility
    if (visibilityFilter !== 'all') {
      const isPrivate = visibilityFilter === 'private';
      const visibleRepoNames = repos
        .filter(r => r.private === isPrivate)
        .map(r => r.full_name);
      result = result.filter(c => visibleRepoNames.includes(c.repoName));
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result.slice(0, 50);
  }, [query, commits, selectedRepo, visibilityFilter, sortOrder, repos]);

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
      const fetchedRepos = await github.fetchUserRepositories();
      setRepos(fetchedRepos);
      await storageService.saveRepositories(fetchedRepos);

      let allNewCommits: Commit[] = [];
      for (const repo of fetchedRepos) {
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
          placeholder="Search commits..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <Search style={{ position: 'absolute', right: '16px', top: '14px', color: '#94a3b8' }} size={20} />
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <Filter size={14} className="filter-icon" />
          <select value={selectedRepo} onChange={(e) => setSelectedRepo(e.target.value)} className="filter-select">
            <option value="all">All Repositories</option>
            {repos.map(r => <option key={r.full_name} value={r.full_name}>{r.name}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value as any)} className="filter-select">
            <option value="all">All Visibility</option>
            <option value="public">Public Only</option>
            <option value="private">Private Only</option>
          </select>
        </div>

        <div className="filter-group" onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')} style={{ cursor: 'pointer' }}>
          {sortOrder === 'newest' ? <SortDesc size={14} /> : <SortAsc size={14} />}
          <span className="filter-label">{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
        </div>
      </div>

      <div className="results-list">
        <AnimatePresence>
          {filteredResults.map((commit, idx) => (
            <motion.div
              key={commit.sha}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.5) }}
              className="commit-card"
              onClick={() => window.open(commit.url, '_blank')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="commit-message">{commit.message}</span>
                <ExternalLink size={14} style={{ color: '#94a3b8' }} />
              </div>
              <div className="commit-meta">
                <span className="repo-tag">{commit.repoName.split('/')[1]}</span>
                <span>{new Date(commit.date).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredResults.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>
            <Search size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
            <div>No matches found in your commits.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
