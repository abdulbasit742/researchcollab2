import { Link } from "react-router-dom";

interface HashtagLinkProps {
  tag: string;
}

export function HashtagLink({ tag }: HashtagLinkProps) {
  const cleanTag = tag.startsWith("#") ? tag.slice(1) : tag;

  return (
    <Link
      to={`/feed?tag=${encodeURIComponent(cleanTag)}`}
      className="text-primary hover:underline font-medium"
      onClick={(e) => e.stopPropagation()}
    >
      #{cleanTag}
    </Link>
  );
}
