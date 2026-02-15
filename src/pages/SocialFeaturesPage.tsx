import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Stories, ReelsViewer, ExploreGrid, LiveStreamsBar } from "@/components/social";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Grid3X3, 
  Radio, 
  Sparkles,
  Camera,
  Film,
  Search,
  Heart
} from "lucide-react";

export default function SocialFeaturesPage() {
  const [activeTab, setActiveTab] = useState("stories");

  return (
    <MainLayout>
      <div className="container max-w-4xl px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Social Features</h1>
            <Badge variant="secondary" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
              NEW
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Instagram, Facebook & TikTok-inspired social features for the academic community
          </p>
        </div>

        {/* Live Streams Bar */}
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-red-500/5 via-pink-500/5 to-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-500" />
              Live Now
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <LiveStreamsBar />
          </CardContent>
        </Card>

        {/* Main Features Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="stories" className="gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger value="reels" className="gap-2">
              <Film className="h-4 w-4" />
              <span className="hidden sm:inline">Reels</span>
            </TabsTrigger>
            <TabsTrigger value="explore" className="gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Explore</span>
            </TabsTrigger>
            <TabsTrigger value="interactions" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Reactions</span>
            </TabsTrigger>
          </TabsList>

          {/* Stories Tab */}
          <TabsContent value="stories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-pink-500" />
                  Stories
                </CardTitle>
                <CardDescription>
                  24-hour ephemeral content like Instagram Stories. Click on a story to view!
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t">
                <Stories />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/5 to-purple-500/5">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Story Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Gradient ring for unviewed stories</li>
                  <li>• Progress bars for multiple story items</li>
                  <li>• Tap navigation (left/right areas)</li>
                  <li>• View counts and like reactions</li>
                  <li>• Direct message replies</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reels Tab */}
          <TabsContent value="reels" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-red-500" />
                  Reels / Short-Form Videos
                </CardTitle>
                <CardDescription>
                  TikTok-style vertical swipe feed. Swipe up to see the next reel!
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t pt-4">
                <ReelsViewer />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Reel Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Vertical swipe navigation</li>
                  <li>• Double-tap to like with heart animation</li>
                  <li>• Single-tap to pause/play</li>
                  <li>• Rotating music disc indicator</li>
                  <li>• Follow button on user avatars</li>
                  <li>• Share, comment, and bookmark actions</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Explore Tab */}
          <TabsContent value="explore" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5 text-blue-500" />
                  Explore Grid
                </CardTitle>
                <CardDescription>
                  Instagram-style discovery page with search, trending topics, and suggested accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t pt-4">
                <ExploreGrid />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Social Interactions
                </CardTitle>
                <CardDescription>
                  Enhanced engagement features inspired by major social platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t pt-4 space-y-6">
                {/* Double Tap Demo */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Double-Tap to Like</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Double-tap anywhere on posts to like with a heart animation
                  </p>
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-8 text-center text-white cursor-pointer select-none">
                    <p className="text-xl font-bold">Double-tap me!</p>
                    <p className="text-sm opacity-70 mt-2">Try it on the Reels viewer above</p>
                  </div>
                </div>

                <Separator />

                {/* Emoji Reactions Demo */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Emoji Reactions</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Facebook-style reaction picker with animated emojis
                  </p>
                  <div className="flex gap-2">
                    {["❤️", "😂", "😮", "😢", "😡", "👍"].map((emoji, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl hover:scale-125 transition-transform cursor-pointer"
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Floating Hearts Demo */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Floating Hearts</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    TikTok Live-style floating heart animations
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Available in the Live Stream viewer - hearts float up when users react!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Feature Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 px-4">
                <div className="grid grid-cols-4 gap-4 text-center text-sm min-w-[400px]">
                  <div className="font-semibold">Feature</div>
                  <div className="text-pink-500 font-semibold">Instagram</div>
                  <div className="text-blue-500 font-semibold">Facebook</div>
                  <div className="text-black dark:text-white font-semibold">TikTok</div>
                  
                  <div className="text-left">Stories</div>
                  <div>✓</div>
                  <div>✓</div>
                  <div>-</div>
                  
                  <div className="text-left">Reels/Shorts</div>
                  <div>✓</div>
                  <div>✓</div>
                  <div>✓</div>
                  
                  <div className="text-left">Explore Grid</div>
                  <div>✓</div>
                  <div>-</div>
                  <div>✓</div>
                  
                  <div className="text-left">Double-tap Like</div>
                  <div>✓</div>
                  <div>-</div>
                  <div>✓</div>
                  
                  <div className="text-left">Emoji Reactions</div>
                  <div>-</div>
                  <div>✓</div>
                  <div>-</div>
                  
                  <div className="text-left">Live Streams</div>
                  <div>✓</div>
                  <div>✓</div>
                  <div>✓</div>
                </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
