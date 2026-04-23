import type { Commit } from './githubService';
import type { GoalSettings } from './storageService';

export interface GoalProgress {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    targets: GoalSettings;
}

export class GoalService {
    calculateProgress(commits: Commit[], settings: GoalSettings): GoalProgress {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        
        // Start of week (Monday)
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeekDate = new Date(now);
        startOfWeekDate.setDate(diff);
        const startOfWeek = startOfWeekDate.setHours(0, 0, 0, 0);
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

        let daily = 0, weekly = 0, monthly = 0, yearly = 0;

        for (const commit of commits) {
            const commitDate = new Date(commit.date).getTime();
            if (commitDate >= startOfDay) daily++;
            if (commitDate >= startOfWeek) weekly++;
            if (commitDate >= startOfMonth) monthly++;
            if (commitDate >= startOfYear) yearly++;
        }

        return {
            daily,
            weekly,
            monthly,
            yearly,
            targets: settings
        };
    }
}

export const goalService = new GoalService();
