import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ArrowLeft, Calendar, User, Clock, Eye, BookOpen } from "lucide-react";
import { useBlogPost } from "@/hooks/useBlog";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

export default function BlogArticlePage() {
  const { slug } = useParams();
  const { data: article, isLoading, error } = useBlogPost(slug);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try { return format(new Date(dateStr), "MMM d, yyyy"); } catch { return dateStr; }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container pt-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="aspect-[21/9] w-full rounded-xl mb-8" />
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!article) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEOHead
        title={article.title}
        description={article.excerpt || `Read ${article.title} on RCollab Blog`}
        canonicalPath={`/blog/${article.slug || article.id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.excerpt,
          author: { "@type": "Person", name: article.author?.full_name || "Unknown" },
          datePublished: article.published_at,
          image: article.cover_image_url,
        }}
      />

      {/* Back Navigation */}
      <div className="container pt-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>

      {/* Hero Image */}
      {article.cover_image_url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mt-6"
        >
          <div className="aspect-[21/9] rounded-xl overflow-hidden">
            <OptimizedImage
              src={article.cover_image_url}
              alt={article.title}
              widths={[800, 1200, 1920]}
              priority
              fill
            />
          </div>
        </motion.div>
      )}

      {/* Article Content */}
      <div className="container py-8 md:py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {article.category && <Badge variant="secondary">{article.category}</Badge>}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              {article.views_count?.toLocaleString()} views
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {article.title}
          </h1>

          {/* Author & Date */}
          <div className="flex items-center gap-4 text-muted-foreground mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.author?.full_name || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(article.published_at)}</span>
            </div>
          </div>

          {/* Article Body */}
          <div className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-semibold prose-headings:text-foreground
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4"
          >
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Back to Blog CTA */}
          <div className="mt-12 pt-8 border-t text-center">
            <p className="text-muted-foreground mb-4">Enjoyed this article?</p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Read More Articles
              </Link>
            </Button>
          </div>
        </motion.article>
      </div>
    </MainLayout>
  );
}
