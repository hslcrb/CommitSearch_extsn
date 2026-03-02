import axios from 'axios';

export interface Commit {
  sha: string;
  message: string;
  url: string;
  date: string;
  author: string;
  repoName: string;
}

export interface Repository {
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
}

export class GitHubService {
  private token: string;
  private baseUrl = 'https://api.github.com';

  constructor(token: string) {
    this.token = token;
  }

  private get headers() {
    return {
      Authorization: `token ${this.token}`,
      Accept: 'application/vnd.github.v3+json',
    };
  }

  async fetchUserRepositories(): Promise<Repository[]> {
    let repos: Repository[] = [];
    let page = 1;
    while (true) {
      const response = await axios.get(`${this.baseUrl}/user/repos`, {
        headers: this.headers,
        params: { page, per_page: 100, affiliation: 'owner' },
      });
      if (response.data.length === 0) break;
      repos = [...repos, ...response.data];
      page++;
      if (page > 10) break; // Safety limit for now
    }
    return repos;
  }

  async fetchCommits(repoFullName: string): Promise<Commit[]> {
    let commits: Commit[] = [];
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${repoFullName}/commits`, {
        headers: this.headers,
        params: { per_page: 100 },
      });
      commits = response.data.map((item: any) => ({
        sha: item.sha,
        message: item.commit.message,
        url: item.html_url,
        date: item.commit.author.date,
        author: item.commit.author.name,
        repoName: repoFullName,
      }));
    } catch (error) {
      console.error(`Error fetching commits for ${repoFullName}:`, error);
    }
    return commits;
  }
}
