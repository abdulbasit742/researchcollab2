import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ReelsViewer } from "@/components/social/ReelsViewer";

export default function ReelsPage() {
  const { user, isLoading } = useAuth();

  if (!isLoading && !user) return <Navigate to="/" replace />;

  return (
    <MainLayout>
      <div className="container max-w-lg py-4 px-4">
        <h1 className="text-2xl font-bold mb-4">Reels</h1>
        <ReelsViewer />
      </div>
    </MainLayout>
  );
}
