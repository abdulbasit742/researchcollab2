import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Flame, Target, Gift, Zap } from "lucide-react";

export function AchievementShowcase() {
  const achievements = [
    { name: "First Project", rarity: "common", points: 100, unlocked: true },
    { name: "Trust Builder", rarity: "rare", points: 500, unlocked: true },
    { name: "Top Performer", rarity: "legendary", points: 2000, unlocked: false, progress: 75 },
  ];

  const rarityColors: Record<string, string> = {
    common: "bg-gray-500",
    uncommon: "bg-green-500",
    rare: "bg-blue-500",
    epic: "bg-purple-500",
    legendary: "bg-yellow-500",
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements.map((ach, i) => (
          <div key={i} className={`p-3 rounded-lg border ${!ach.unlocked ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${rarityColors[ach.rarity]}`} />
                <span className="font-medium">{ach.name}</span>
              </div>
              <Badge variant={ach.unlocked ? "default" : "secondary"}>
                {ach.points} pts
              </Badge>
            </div>
            {!ach.unlocked && ach.progress && (
              <Progress value={ach.progress} className="h-2" />
            )}
          </div>
        ))}
        <Button variant="outline" className="w-full">View All Achievements</Button>
      </CardContent>
    </Card>
  );
}

export function LeaderboardWidget() {
  const entries = [
    { rank: 1, name: "Sarah Chen", score: 2500, change: 2 },
    { rank: 2, name: "Mike Johnson", score: 2350, change: -1 },
    { rank: 3, name: "Emily Wong", score: 2200, change: 0 },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Weekly Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              entry.rank === 1 ? 'bg-yellow-500 text-white' :
              entry.rank === 2 ? 'bg-gray-400 text-white' :
              entry.rank === 3 ? 'bg-amber-600 text-white' : 'bg-muted'
            }`}>
              {entry.rank}
            </span>
            <div className="flex-1">
              <p className="font-medium text-sm">{entry.name}</p>
              <p className="text-xs text-muted-foreground">{entry.score.toLocaleString()} pts</p>
            </div>
            <span className={`text-xs ${
              entry.change > 0 ? 'text-green-600' : entry.change < 0 ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              {entry.change > 0 ? `↑${entry.change}` : entry.change < 0 ? `↓${Math.abs(entry.change)}` : '−'}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function StreakTracker() {
  const streak = { current: 15, best: 45, multiplier: 1.5 };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Activity Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <p className="text-4xl font-bold text-orange-600">{streak.current}</p>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-2 rounded border">
            <p className="text-lg font-bold">{streak.best}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="p-2 rounded border">
            <p className="text-lg font-bold text-green-600">{streak.multiplier}x</p>
            <p className="text-xs text-muted-foreground">XP Bonus</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DailyChallenges() {
  const challenges = [
    { title: "Network Builder", progress: 3, target: 5, reward: 250 },
    { title: "Proposal Master", progress: 1, target: 3, reward: 150 },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Daily Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((ch, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{ch.title}</span>
              <span className="text-xs text-muted-foreground">{ch.progress}/{ch.target}</span>
            </div>
            <Progress value={(ch.progress/ch.target)*100} className="h-2 mb-1" />
            <p className="text-xs text-muted-foreground">🎁 {ch.reward} points</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function LevelProgress() {
  const level = { current: 12, xp: 2500, required: 3000, title: "Research Associate" };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Level Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-4xl font-bold text-primary">{level.current}</p>
          <p className="text-sm text-muted-foreground">{level.title}</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>XP Progress</span>
            <span>{level.xp}/{level.required}</span>
          </div>
          <Progress value={(level.xp/level.required)*100} className="h-3" />
          <p className="text-xs text-center text-muted-foreground">
            {level.required - level.xp} XP to next level
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function RewardsStore() {
  const rewards = [
    { name: "Premium Badge", cost: 1000, type: "cosmetic" },
    { name: "Profile Boost", cost: 500, type: "feature" },
    { name: "$10 Credit", cost: 2500, type: "credit" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Rewards Store
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rewards.map((r, i) => (
          <div key={i} className="p-3 rounded-lg border flex justify-between items-center">
            <div>
              <p className="font-medium">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.type}</p>
            </div>
            <Button size="sm">{r.cost} pts</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
