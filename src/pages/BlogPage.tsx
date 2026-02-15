import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Calendar, User, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: 1,
    title: "10 Tips for Successful Research Collaboration",
    excerpt: "Learn how to effectively collaborate with researchers from different institutions and backgrounds.",
    author: "Dr. Sarah Chen",
    date: "Dec 15, 2025",
    readTime: "5 min read",
    category: "Collaboration",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    title: "How AI is Transforming Academic Research",
    excerpt: "Explore the latest AI tools and how they're revolutionizing the way researchers work.",
    author: "Prof. James Wilson",
    date: "Dec 12, 2025",
    readTime: "8 min read",
    category: "AI Tools",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    title: "Writing Your First Research Paper: A Complete Guide",
    excerpt: "Step-by-step guide for students writing their first academic paper.",
    author: "Dr. Emily Rodriguez",
    date: "Dec 10, 2025",
    readTime: "12 min read",
    category: "Writing",
    image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400&h=250&fit=crop",
  },
  {
    id: 4,
    title: "Top Grant Opportunities for 2026",
    excerpt: "A comprehensive list of funding opportunities for researchers and students.",
    author: "Dr. Michael Park",
    date: "Dec 8, 2025",
    readTime: "6 min read",
    category: "Funding",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop",
  },
  {
    id: 5,
    title: "Building Your Research Portfolio as a Student",
    excerpt: "How to showcase your work and attract collaboration opportunities.",
    author: "Alex Thompson",
    date: "Dec 5, 2025",
    readTime: "7 min read",
    category: "Career",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
  },
  {
    id: 6,
    title: "Data Analysis Best Practices for Researchers",
    excerpt: "Essential techniques and tools for analyzing research data effectively.",
    author: "Maria Garcia",
    date: "Dec 3, 2025",
    readTime: "10 min read",
    category: "Data Science",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
  },
];

const categories = ["All", "Collaboration", "AI Tools", "Writing", "Funding", "Career", "Data Science"];

export default function BlogPage() {
  return (
    <MainLayout>
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
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={cat === "All" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {cat}
              </Badge>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-6 sm:py-16">
        {/* Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Card variant="interactive" className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="aspect-video md:aspect-auto">
                <img
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <Badge variant="secondary" className="w-fit mb-4">
                  Featured
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {blogPosts[0].author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {blogPosts[0].date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {blogPosts[0].readTime}
                  </div>
                </div>
                <Button className="w-fit" asChild>
                  <Link to={`/blog/${blogPosts[0].id}`}>
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/blog/${post.id}`} className="block h-full">
                <Card variant="interactive" className="h-full flex flex-col overflow-hidden cursor-pointer">
                  <div className="aspect-video">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <Badge variant="secondary" className="w-fit mb-2">
                      {post.category}
                    </Badge>
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
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
