/// <reference types="chrome" />
import { useState, useEffect, useMemo } from 'react';
import { Search, Github, RefreshCw, ExternalLink, Filter, SortAsc, SortDesc, Target, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitHubService, type Commit, type Repository } from './services/githubService';
import { storageService, type GoalSettings } from './services/storageService';
import { searchEngine } from './services/searchEngine';
import { goalService, type GoalProgress } from './services/goalService';
import { t, type Language } from './i18n';

function App() {
  const [query, setQuery] = useState('');
  const [commits, setCommits] = useState<Commit[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [token, setToken] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempToken, setTempToken] = useState('');

  // Settings & Goals
  const [settings, setSettings] = useState<GoalSettings>({
    daily: 1, weekly: 5, monthly: 20, yearly: 365, displayMode: 'count', language: 'ko'
  });
  const [progress, setProgress] = useState<GoalProgress | null>(null);

  // Filters
  const [selectedRepo, setSelectedRepo] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    async function loadData() {
      const storedCommits = await storageService.getAllCommits();
      setCommits(storedCommits);
      searchEngine.indexCommits(storedCommits);

      const storedRepos = await storageService.getAllRepositories();
      setRepos(storedRepos);

      const storedSettings = await storageService.getSettings();
      setSettings(storedSettings);
      
      const calcProgress = goalService.calculateProgress(storedCommits, storedSettings);
      setProgress(calcProgress);

      chrome.storage.local.get(['github_token'], (result: Record<string, any>) => {
        if (result.github_token) {
          setToken(result.github_token);
          setTempToken(result.github_token);
        }
      });
    }
    loadData();
  }, []);

  const filteredResults = useMemo(() => {
    let result = query ? searchEngine.search(query, commits) : [...commits];

    if (selectedRepo !== 'all') {
      result = result.filter(c => c.repoName === selectedRepo);
    }

    if (visibilityFilter !== 'all') {
      const isPrivate = visibilityFilter === 'private';
      const visibleRepoNames = repos
        .filter(r => r.private === isPrivate)
        .map(r => r.full_name);
      result = result.filter(c => visibleRepoNames.includes(c.repoName));
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result.slice(0, 50);
  }, [query, commits, selectedRepo, visibilityFilter, sortOrder, repos]);

  const handleSaveSettings = async (newSettings: Partial<GoalSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await storageService.saveSettings(updated);
    const calcProgress = goalService.calculateProgress(commits, updated);
    setProgress(calcProgress);
  };

  const handleSaveToken = async () => {
    if (!tempToken) return;
    setToken(tempToken);
    chrome.storage.local.set({ github_token: tempToken });
    setStatus(t('tokenSuccess', settings.language));
    setTimeout(() => setStatus(''), 2000);
  };

  const handleSync = async () => {
    if (!token) {
      setShowSettings(true);
      setStatus(t('setTokenFirst', settings.language));
      return;
    }

    setIsSyncing(true);
    setStatus(t('syncing', settings.language));
    const github = new GitHubService(token);

    try {
      const fetchedRepos = await github.fetchUserRepositories();
      setRepos(fetchedRepos);
      await storageService.saveRepositories(fetchedRepos);

      let allNewCommits: Commit[] = [];
      for (const repo of fetchedRepos) {
        setStatus(`${t('syncing', settings.language)} ${repo.name}...`);
        const repoCommits = await github.fetchCommits(repo.full_name, 3); // Fetch 3 pages per repo
        allNewCommits = [...allNewCommits, ...repoCommits];
      }

      await storageService.saveCommits(allNewCommits);
      searchEngine.indexCommits(allNewCommits);
      setCommits(allNewCommits);
      
      const calcProgress = goalService.calculateProgress(allNewCommits, settings);
      setProgress(calcProgress);
      
      setStatus('Done!');
    } catch (err) {
      console.error(err);
      setStatus('Failed');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const GoalBar = ({ label, current, target, color }: { label: string, current: number, target: number, color: string }) => {
    const percent = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
    const isCount = settings.displayMode === 'count';

    return (
      <div className="goal-item" onClick={() => handleSaveSettings({ displayMode: isCount ? 'percentage' : 'count' })}>
        <div className="goal-info">
          <span>{label}</span>
          <span>{isCount ? `${current}/${target}` : `${percent}%`}</span>
        </div>
        <div className="goal-track">
          <motion.div 
            className="goal-fill" 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="search-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 className="search-title" style={{ margin: 0 }}>{t('title', settings.language)}</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
             <button className="icon-btn" onClick={() => handleSaveSettings({ language: settings.language === 'ko' ? 'en' : 'ko' })}>
               <Globe size={18} />
             </button>
             <button className="icon-btn" onClick={() => setShowSettings(!showSettings)}>
               <Target size={18} />
             </button>
          </div>
        </div>

        {progress && (
          <div className="goals-container">
            <GoalBar label={t('daily', settings.language)} current={progress.daily} target={progress.targets.daily} color="#3b82f6" />
            <GoalBar label={t('weekly', settings.language)} current={progress.weekly} target={progress.targets.weekly} color="#8b5cf6" />
            <GoalBar label={t('monthly', settings.language)} current={progress.monthly} target={progress.targets.monthly} color="#ec4899" />
            <GoalBar label={t('yearly', settings.language)} current={progress.yearly} target={progress.targets.yearly} color="#10b981" />
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="primary" onClick={handleSync} disabled={isSyncing} style={{ flex: 1 }}>
            {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <Github size={16} />}
            <span style={{ marginLeft: '8px' }}>{isSyncing ? t('syncing', settings.language) : t('sync', settings.language)}</span>
          </button>
        </div>
        {status && <div className="status-bar">{status}</div>}
      </header>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="settings-card"
          >
            <h3 className="settings-title">{t('tokenConfig', settings.language)}</h3>
            <div className="settings-input-wrapper">
              <input
                type="password"
                className="search-box"
                placeholder="ghp_xxxxxxxxxxxx"
                value={tempToken}
                onChange={(e) => setTempToken(e.target.value)}
              />
              <button className="primary" onClick={handleSaveToken} style={{ marginTop: '8px', width: '100%' }}>
                {t('saveToken', settings.language)}
              </button>
            </div>

            <h3 className="settings-title" style={{ marginTop: '20px' }}>{t('goalsTitle', settings.language)}</h3>
            <div className="goal-settings-grid">
              <div className="goal-input-group">
                <label>{t('daily', settings.language)}</label>
                <input type="number" value={settings.daily} onChange={(e) => handleSaveSettings({ daily: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="goal-input-group">
                <label>{t('weekly', settings.language)}</label>
                <input type="number" value={settings.weekly} onChange={(e) => handleSaveSettings({ weekly: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="goal-input-group">
                <label>{t('monthly', settings.language)}</label>
                <input type="number" value={settings.monthly} onChange={(e) => handleSaveSettings({ monthly: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="goal-input-group">
                <label>{t('yearly', settings.language)}</label>
                <input type="number" value={settings.yearly} onChange={(e) => handleSaveSettings({ yearly: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-box"
          placeholder={t('searchPlaceholder', settings.language)}
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
            <option value="all">{t('allRepos', settings.language)}</option>
            {repos.map(r => <option key={r.full_name} value={r.full_name}>{r.name}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value as any)} className="filter-select">
            <option value="all">{t('allVisibility', settings.language)}</option>
            <option value="public">{t('publicOnly', settings.language)}</option>
            <option value="private">{t('privateOnly', settings.language)}</option>
          </select>
        </div>

        <div className="filter-group" onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')} style={{ cursor: 'pointer' }}>
          {sortOrder === 'newest' ? <SortDesc size={14} /> : <SortAsc size={14} />}
          <span className="filter-label">{sortOrder === 'newest' ? t('newest', settings.language) : t('oldest', settings.language)}</span>
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
            <div>{t('noMatches', settings.language)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
