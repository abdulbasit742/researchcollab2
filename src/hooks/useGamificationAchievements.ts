import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Feature Domain: Gamification & Achievement Systems

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "milestone" | "skill" | "social" | "career" | "special";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  points: number;
  unlockedAt?: string;
  progress?: number;
  requirement: number;
}

export interface Leaderboard {
  id: string;
  name: string;
  type: "global" | "weekly" | "monthly" | "category";
  category?: string;
  entries: LeaderboardEntry[];
  userRank?: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl?: string;
  score: number;
  change: number; // position change from last period
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "special";
  difficulty: "easy" | "medium" | "hard" | "expert";
  reward: { type: string; amount: number };
  progress: number;
  target: number;
  expiresAt: string;
  status: "active" | "completed" | "expired" | "claimed";
}

export interface UserLevel {
  level: number;
  currentXP: number;
  requiredXP: number;
  title: string;
  perks: string[];
  nextTitle: string;
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({ total: 50, unlocked: 25, points: 2500 });

  const fetchAchievements = useCallback(async () => {
    setAchievements([
      {
        id: "1",
        name: "First Project",
        description: "Complete your first project",
        icon: "trophy",
        category: "milestone",
        rarity: "common",
        points: 100,
        unlockedAt: "2024-06-15",
        progress: 1,
        requirement: 1,
      },
      {
        id: "2",
        name: "Trust Builder",
        description: "Reach a trust score of 80",
        icon: "shield",
        category: "career",
        rarity: "rare",
        points: 500,
        progress: 75,
        requirement: 80,
      },
    ]);
  }, []);

  const checkAchievements = useCallback(async (eventType: string, eventData: any) => {
    console.log("Checking achievements for event:", eventType, eventData);
    return { newAchievements: [], progress: [] };
  }, []);

  const claimReward = useCallback(async (achievementId: string) => {
    console.log("Claiming reward:", achievementId);
    return { success: true, reward: { type: "points", amount: 100 } };
  }, []);

  const shareAchievement = useCallback(async (achievementId: string, platform: string) => {
    console.log("Sharing achievement:", achievementId, platform);
    return { success: true, shareUrl: "https://..." };
  }, []);

  return { achievements, recentUnlocks, stats, fetchAchievements, checkAchievements, claimReward, shareAchievement };
}

export function useLeaderboards() {
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [userRankings, setUserRankings] = useState<any[]>([]);

  const fetchLeaderboard = useCallback(async (type: string, category?: string) => {
    console.log("Fetching leaderboard:", type, category);
    setLeaderboards([
      {
        id: "1",
        name: "Weekly Top Performers",
        type: "weekly",
        entries: [
          { rank: 1, userId: "1", userName: "Sarah Chen", score: 2500, change: 2 },
          { rank: 2, userId: "2", userName: "Mike Johnson", score: 2350, change: -1 },
          { rank: 3, userId: "3", userName: "Emily Wong", score: 2200, change: 0 },
        ],
        userRank: 15,
      },
    ]);
  }, []);

  const getUserRank = useCallback(async (leaderboardId: string) => {
    console.log("Getting user rank:", leaderboardId);
    return { rank: 15, percentile: 85, nearbyUsers: [] };
  }, []);

  const subscribeToUpdates = useCallback(async (leaderboardId: string) => {
    console.log("Subscribing to leaderboard updates:", leaderboardId);
    return { success: true };
  }, []);

  return { leaderboards, userRankings, fetchLeaderboard, getUserRank, subscribeToUpdates };
}

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);

  const fetchChallenges = useCallback(async () => {
    setChallenges([
      {
        id: "1",
        title: "Network Builder",
        description: "Connect with 5 new professionals this week",
        type: "weekly",
        difficulty: "easy",
        reward: { type: "points", amount: 250 },
        progress: 3,
        target: 5,
        expiresAt: "2024-12-15T23:59:59Z",
        status: "active",
      },
      {
        id: "2",
        title: "Proposal Master",
        description: "Submit 3 project proposals",
        type: "daily",
        difficulty: "medium",
        reward: { type: "badge", amount: 1 },
        progress: 1,
        target: 3,
        expiresAt: "2024-12-11T23:59:59Z",
        status: "active",
      },
    ]);
  }, []);

  const joinChallenge = useCallback(async (challengeId: string) => {
    console.log("Joining challenge:", challengeId);
    return { success: true };
  }, []);

  const updateProgress = useCallback(async (challengeId: string, progress: number) => {
    console.log("Updating challenge progress:", challengeId, progress);
    return { success: true, completed: progress >= 100 };
  }, []);

  const claimReward = useCallback(async (challengeId: string) => {
    console.log("Claiming challenge reward:", challengeId);
    return { success: true, reward: { type: "points", amount: 250 } };
  }, []);

  return { challenges, activeChallenges, completedChallenges, fetchChallenges, joinChallenge, updateProgress, claimReward };
}

export function useUserLeveling() {
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [xpHistory, setXpHistory] = useState<any[]>([]);

  const fetchLevel = useCallback(async () => {
    setLevel({
      level: 12,
      currentXP: 2500,
      requiredXP: 3000,
      title: "Research Associate",
      perks: ["Priority matching", "Extended proposal limits"],
      nextTitle: "Senior Associate",
    });
  }, []);

  const addXP = useCallback(async (amount: number, source: string) => {
    console.log("Adding XP:", amount, source);
    return { success: true, newTotal: 2750, leveledUp: false };
  }, []);

  const getLevelBenefits = useCallback(async (level: number) => {
    console.log("Getting level benefits:", level);
    return { perks: [], unlocks: [] };
  }, []);

  const getXPBreakdown = useCallback(async (period: string) => {
    console.log("Getting XP breakdown:", period);
    return { total: 1500, sources: [], timeline: [] };
  }, []);

  return { level, xpHistory, fetchLevel, addXP, getLevelBenefits, getXPBreakdown };
}

export function useStreak() {
  const [streak, setStreak] = useState({ current: 15, best: 45, lastActivity: "2024-12-10" });
  const [streakBonuses, setStreakBonuses] = useState<any[]>([]);

  const fetchStreak = useCallback(async () => {
    return { current: 15, best: 45, multiplier: 1.5 };
  }, []);

  const recordActivity = useCallback(async () => {
    console.log("Recording activity for streak");
    return { success: true, newStreak: 16, bonusEarned: 50 };
  }, []);

  const getStreakMilestones = useCallback(async () => {
    return { 
      milestones: [
        { days: 7, reward: { type: "badge", name: "Week Warrior" } },
        { days: 30, reward: { type: "badge", name: "Monthly Master" } },
      ] 
    };
  }, []);

  const protectStreak = useCallback(async () => {
    console.log("Using streak protection");
    return { success: true, protectionsRemaining: 2 };
  }, []);

  return { streak, streakBonuses, fetchStreak, recordActivity, getStreakMilestones, protectStreak };
}

export function useRewards() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [rewardBalance, setRewardBalance] = useState({ points: 5000, credits: 25 });
  const [rewardHistory, setRewardHistory] = useState<any[]>([]);

  const fetchRewards = useCallback(async () => {
    setRewards([
      { id: "1", name: "Premium Badge", cost: 1000, type: "cosmetic", available: true },
      { id: "2", name: "Profile Boost (7 days)", cost: 500, type: "feature", available: true },
      { id: "3", name: "$10 Credit", cost: 2500, type: "credit", available: true },
    ]);
  }, []);

  const redeemReward = useCallback(async (rewardId: string) => {
    console.log("Redeeming reward:", rewardId);
    return { success: true, remaining: 4000 };
  }, []);

  const giftReward = useCallback(async (rewardId: string, recipientId: string) => {
    console.log("Gifting reward:", rewardId, recipientId);
    return { success: true };
  }, []);

  return { rewards, rewardBalance, rewardHistory, fetchRewards, redeemReward, giftReward };
}
