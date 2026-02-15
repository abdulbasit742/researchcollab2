import { MainLayout } from "@/components/layout/MainLayout";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Smartphone, Share, Plus, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function InstallPage() {
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();

  return (
    <MainLayout>
      <div className="container max-w-lg mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Smartphone className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Install the App</h1>
          <p className="text-muted-foreground">
            Get the full experience — faster access, offline support, and no browser chrome.
          </p>
        </motion.div>

        {isInstalled ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-8">
              <CheckCircle2 className="h-12 w-12 text-primary" />
              <p className="text-lg font-semibold">Already Installed!</p>
              <p className="text-sm text-muted-foreground">You're using the app version.</p>
            </CardContent>
          </Card>
        ) : canInstall ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <p className="text-sm text-muted-foreground">Tap below to install</p>
              <Button size="lg" onClick={install} className="gap-2">
                <Download className="h-5 w-5" />
                Install Now
              </Button>
            </CardContent>
          </Card>
        ) : isIOS ? (
          <Card>
            <CardContent className="py-6 space-y-4">
              <p className="font-semibold text-center">Install on iPhone / iPad</p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Share className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                  <span>Tap the <strong>Share</strong> button in Safari's toolbar</span>
                </div>
                <div className="flex items-start gap-3">
                  <Plus className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                  <span>Tap <strong>"Add"</strong> to install</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              <p>Open this page in Chrome or Safari to install the app.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
