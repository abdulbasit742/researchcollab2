import { Navigate, useParams } from "react-router-dom";

export default function OfferRedirectPage() {
  const { id } = useParams();
  return <Navigate to={`/earn/projects/${id}`} replace />;
}
