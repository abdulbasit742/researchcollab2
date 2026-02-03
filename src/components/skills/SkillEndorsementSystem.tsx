import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSkillEndorsements, SkillWithEndorsements } from "@/hooks/useSkillEndorsements";
import { Award, Users, CheckCircle, Clock, Send, Star, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface SkillEndorsementSystemProps {
  userId?: string;
}

export function SkillEndorsementSystem({ userId }: SkillEndorsementSystemProps) {
  const { 
    skillsWithEndorsements, 
    pendingRequests, 
    loading,
    getEndorsementStrength,
    totalVerifiedSkills 
  } = useSkillEndorsements(userId);

  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const getStrengthColor = (strength: "strong" | "moderate" | "weak") => {
    switch (strength) {
      case "strong": return "text-green-500 bg-green-500/10";
      case "moderate": return "text-yellow-500 bg-yellow-500/10";
      case "weak": return "text-orange-500 bg-orange-500/10";
    }
  };

  const getStrengthLabel = (strength: "strong" | "moderate" | "weak") => {
    switch (strength) {
      case "strong": return "Strongly Verified";
      case "moderate": return "Moderately Verified";
      case "weak": return "Needs More Verification";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-primary" />
            Skill Endorsements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{skillsWithEndorsements.length}</p>
              <p className="text-xs text-muted-foreground">Total Skills</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10">
              <p className="text-2xl font-bold text-green-600">{totalVerifiedSkills}</p>
              <p className="text-xs text-muted-foreground">Verified Through Work</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{pendingRequests.length}</p>
              <p className="text-xs text-muted-foreground">Pending Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills List */}
      <div className="space-y-3">
        {skillsWithEndorsements.map((skill) => {
          const strength = getEndorsementStrength(skill);
          const isExpanded = expandedSkill === skill.id;

          return (
            <motion.div
              key={skill.id}
              layout
              className="border rounded-lg bg-card overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getStrengthColor(strength)}`}>
                      {skill.isVerifiedThroughWork ? (
                        <Shield className="h-5 w-5" />
                      ) : (
                        <Star className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{skill.name}</h4>
                        {skill.isVerifiedThroughWork && (
                          <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Work Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{skill.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{skill.totalEndorsements}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {skill.verifiedEndorsements} verified
                    </p>
                  </div>
                </div>

                {/* Endorsement Strength Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Endorsement Strength</span>
                    <span className={strength === "strong" ? "text-green-500" : strength === "moderate" ? "text-yellow-500" : "text-orange-500"}>
                      {getStrengthLabel(strength)}
                    </span>
                  </div>
                  <Progress 
                    value={skill.overallWeight * 25} 
                    className="h-2"
                  />
                </div>
              </div>

              {/* Expanded Endorsements */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t bg-muted/20"
                >
                  <div className="p-4 space-y-4">
                    {/* Endorsers */}
                    {skill.endorsements.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Recent Endorsements</p>
                        {skill.endorsements.map((endorsement) => (
                          <div key={endorsement.id} className="flex items-center justify-between p-3 rounded-lg bg-background">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{endorsement.endorserName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{endorsement.endorserName}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="text-xs">
                                    Trust: {endorsement.endorserTrustScore}
                                  </Badge>
                                  {endorsement.projectName && (
                                    <span>via {endorsement.projectName}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant={endorsement.endorsementType === "verified_work" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {endorsement.endorsementType === "verified_work" ? "Work Verified" : "Peer Endorsed"}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                Weight: {endorsement.weight.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No endorsements yet for this skill
                      </p>
                    )}

                    {/* Request Endorsement */}
                    <Button className="w-full" variant="outline">
                      <Send className="h-4 w-4 mr-2" />
                      Request Endorsement from Collaborators
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Expiration Warning */}
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardContent className="flex items-center gap-3 py-4">
          <Clock className="h-5 w-5 text-orange-500" />
          <div>
            <p className="text-sm font-medium">Endorsement Validity</p>
            <p className="text-xs text-muted-foreground">
              Endorsements expire after 2 years without revalidation through new work
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
