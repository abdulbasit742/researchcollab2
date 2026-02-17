import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBlogPost, useUpdateBlogPost, useBlogPost } from "@/hooks/useBlog";

export default function BlogEditorPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!postId;

  const { data: existingPost, isLoading: postLoading } = useBlogPost(isEditing ? postId : undefined);
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  useEffect(() => {
    if (existingPost && isEditing) {
      setTitle(existingPost.title);
      setExcerpt(existingPost.excerpt || "");
      setContent(existingPost.content);
      setCategory(existingPost.category || "");
      setTagsInput(existingPost.tags?.join(", ") || "");
      setCoverImageUrl(existingPost.cover_image_url || "");
    }
  }, [existingPost, isEditing]);

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in Required</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to write blog posts.</p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const parseTags = () => tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

  const handleSave = async (status: string) => {
    if (!title.trim() || !content.trim()) return;

    const data = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || undefined,
      category: category.trim() || undefined,
      tags: parseTags().length > 0 ? parseTags() : undefined,
      cover_image_url: coverImageUrl.trim() || undefined,
      status,
    };

    if (isEditing && postId) {
      await updatePost.mutateAsync({ postId, data });
    } else {
      await createPost.mutateAsync(data);
    }
    navigate("/blog");
  };

  const isSaving = createPost.isPending || updatePost.isPending;

  return (
    <MainLayout>
      <SEOHead title={isEditing ? "Edit Post" : "Write a Post"} description="Create or edit a blog post." />
      <div className="container py-8 max-w-3xl">
        <Button variant="ghost" asChild className="gap-2 mb-6">
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Post" : "Write a New Post"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="Your article title..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input id="excerpt" placeholder="A brief summary of your article..." value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown) *</Label>
              <Textarea
                id="content"
                placeholder="Write your article in Markdown..."
                className="min-h-[300px] font-mono text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g. AI Tools, Writing..." value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" placeholder="research, AI, tips..." value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover">Cover Image URL</Label>
              <Input id="cover" placeholder="https://..." value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
            </div>

            {tagsInput && (
              <div className="flex flex-wrap gap-1">
                {parseTags().map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => handleSave("draft")} disabled={isSaving || !title.trim() || !content.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={() => handleSave("published")} disabled={isSaving || !title.trim() || !content.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
