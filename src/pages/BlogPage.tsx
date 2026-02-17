import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { BookOpen, Search, Calendar, User, ArrowRight, Clock, PenLine } from "lucide-react";
import { Link } from "react-router-dom";
import { useBlogPosts, useBlogCategories, useFeaturedBlogPosts } from "@/hooks/useBlog";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export default function BlogPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { data: categoriesData } = useBlogCategories();
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedBlogPosts();
  const {
    data: postsData,
    isLoading: postsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBlogPosts({ category: selectedCategory, search: search || undefined });

  const categories = categoriesData ?? [];
  const featured = featuredData?.[0];
  const allPosts = postsData?.pages.flatMap((p) => p.posts) ?? [];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try { return format(new Date(dateStr), "MMM d, yyyy"); } catch { return dateStr; }
  };

  const jsonLdPosts = allPosts.slice(0, 10).map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author?.full_name || "Unknown" },
    datePublished: post.published_at,
    image: post.cover_image_url,
  }));

  return (
    <MainLayout>
      <SEOHead
        title="Blog"
        description="Insights, tips, and guides on research collaboration, academic tools, and earning opportunities for students and researchers."
        canonicalPath="/blog"
        keywords="research blog, academic tips, collaboration guides, student earning"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "ResearchCollabPro Blog",
          blogPost: jsonLdPosts,
        }}
      />
      <div className="gradient-hero py-8 sm:py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <BookOpen className="h-3 w-3 mr-1" />
              Research Blog
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold md:text-5xl lg:text-6xl">
              Insights for{" "}
              <span className="text-gradient">Research Excellence</span>
            </h1>
            <p className="mt-4 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Tips, guides, and insights to help you succeed in your research journey.
            </p>
            {user && (
              <Button asChild className="mt-6">
                <Link to="/blog/new">
                  <PenLine className="h-4 w-4 mr-2" />
                  Write a Post
                </Link>
              </Button>
            )}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 max-w-xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex flex-wrap justify-center gap-2"
          >
            <Badge
              variant={!selectedCategory ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setSelectedCategory(undefined)}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-6 sm:py-16">
        {/* Featured Post */}
        {featuredLoading ? (
          <div className="mb-12">
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        ) : featured ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <Card variant="interactive" className="overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="aspect-video md:aspect-auto">
                  {featured.cover_image_url ? (
                    <OptimizedImage
                      src={featured.cover_image_url}
                      alt={featured.title}
                      widths={[600, 900, 1200]}
                      priority
                      fill
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <Badge variant="secondary" className="w-fit mb-4">
                    Featured
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {featured.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {featured.author?.full_name || "Unknown"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(featured.published_at)}
                    </div>
                  </div>
                  <Button className="w-fit" asChild>
                    <Link to={`/blog/${featured.slug || featured.id}`}>
                      Read Article
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : null}

        {/* Blog Grid */}
        {postsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : allPosts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              {search ? "Try a different search term." : "No blog posts published yet."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link to={`/blog/${post.slug || post.id}`} className="block h-full">
                  <Card variant="interactive" className="h-full flex flex-col overflow-hidden cursor-pointer">
                    <div className="aspect-video">
                      {post.cover_image_url ? (
                        <OptimizedImage
                          src={post.cover_image_url}
                          alt={post.title}
                          widths={[400, 600, 800]}
                          fill
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      {post.category && (
                        <Badge variant="secondary" className="w-fit mb-2">
                          {post.category}
                        </Badge>
                      )}
                      <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <CardDescription className="line-clamp-2">
                        {post.excerpt}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author?.full_name || "Unknown"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(post.published_at)}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasNextPage && (
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading..." : "Load More Articles"}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
