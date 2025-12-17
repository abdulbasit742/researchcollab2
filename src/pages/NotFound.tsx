import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/5 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center"
      >
        <div className="text-[150px] md:text-[200px] font-extrabold text-gradient leading-none">
          404
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-4">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button size="lg">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link to="/tools">
            <Button variant="outline" size="lg">
              <Search className="h-4 w-4" />
              Explore Tools
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
