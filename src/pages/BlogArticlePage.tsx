import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Clock, Eye } from "lucide-react";

// Static blog data (same as BlogPage for now)
const blogPosts = [
  {
    id: 1,
    title: "10 Tips for Successful Research Collaboration",
    excerpt: "Learn how to effectively collaborate with researchers from different institutions and backgrounds.",
    content: `
      <p>Research collaboration has become increasingly important in today's interconnected academic world. Whether you're working across departments or across continents, effective collaboration can significantly enhance the quality and impact of your research.</p>
      
      <h2>1. Establish Clear Communication Channels</h2>
      <p>Set up regular meetings and choose communication tools that work for everyone. Consider time zones and availability when scheduling.</p>
      
      <h2>2. Define Roles and Responsibilities Early</h2>
      <p>Clearly outline who is responsible for what aspects of the project. This prevents confusion and ensures accountability.</p>
      
      <h2>3. Create a Shared Project Timeline</h2>
      <p>Develop milestones and deadlines that all team members agree upon. Use project management tools to track progress.</p>
      
      <h2>4. Document Everything</h2>
      <p>Keep detailed records of decisions, data, and methodologies. This is crucial for reproducibility and future reference.</p>
      
      <h2>5. Embrace Different Perspectives</h2>
      <p>Collaborators from different backgrounds bring unique insights. Be open to new approaches and ideas.</p>
      
      <h2>6. Address Conflicts Promptly</h2>
      <p>Don't let disagreements fester. Address issues as they arise through open and respectful dialogue.</p>
      
      <h2>7. Share Credit Fairly</h2>
      <p>Discuss authorship and acknowledgment early in the project to avoid conflicts later.</p>
      
      <h2>8. Leverage Each Other's Strengths</h2>
      <p>Identify what each team member does best and assign tasks accordingly.</p>
      
      <h2>9. Stay Flexible</h2>
      <p>Research rarely goes exactly as planned. Be prepared to adapt your approach as needed.</p>
      
      <h2>10. Celebrate Successes Together</h2>
      <p>Acknowledge milestones and achievements. This builds team morale and strengthens working relationships.</p>
      
      <p>By following these tips, you can create productive and enjoyable research collaborations that lead to groundbreaking discoveries.</p>
    `,
    author: "Dr. Sarah Chen",
    date: "Dec 15, 2025",
    readTime: "5 min read",
    category: "Collaboration",
    views: 1234,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop",
  },
  {
    id: 2,
    title: "How AI is Transforming Academic Research",
    excerpt: "Explore the latest AI tools and how they're revolutionizing the way researchers work.",
    content: `
      <p>Artificial Intelligence is reshaping the landscape of academic research in unprecedented ways. From data analysis to literature reviews, AI tools are helping researchers work more efficiently and make discoveries that would have been impossible just a few years ago.</p>
      
      <h2>AI in Literature Reviews</h2>
      <p>AI-powered tools can now analyze thousands of papers in minutes, helping researchers identify relevant literature and spot trends in their field.</p>
      
      <h2>Data Analysis and Pattern Recognition</h2>
      <p>Machine learning algorithms excel at finding patterns in large datasets, making them invaluable for fields ranging from genomics to climate science.</p>
      
      <h2>Writing Assistance</h2>
      <p>AI writing tools can help researchers draft, edit, and polish their papers, though human oversight remains essential.</p>
      
      <h2>Ethical Considerations</h2>
      <p>As AI becomes more prevalent in research, questions about transparency, bias, and attribution must be carefully addressed.</p>
      
      <p>The future of research will undoubtedly be shaped by AI, and researchers who embrace these tools while maintaining rigorous standards will be best positioned for success.</p>
    `,
    author: "Prof. James Wilson",
    date: "Dec 12, 2025",
    readTime: "8 min read",
    category: "AI Tools",
    views: 2567,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop",
  },
  {
    id: 3,
    title: "Writing Your First Research Paper: A Complete Guide",
    excerpt: "Step-by-step guide for students writing their first academic paper.",
    content: `
      <p>Writing your first research paper can feel overwhelming, but with the right approach and preparation, you can produce work you're proud of. This guide will walk you through the entire process.</p>
      
      <h2>Choosing Your Topic</h2>
      <p>Select a topic that genuinely interests you and has enough existing literature to provide context, but still has room for your contribution.</p>
      
      <h2>Conducting a Literature Review</h2>
      <p>Read widely in your field to understand what's already been done and identify gaps your research can fill.</p>
      
      <h2>Developing Your Methodology</h2>
      <p>Choose research methods appropriate for your questions and justify your choices clearly.</p>
      
      <h2>Structuring Your Paper</h2>
      <p>Follow the standard format: Introduction, Methods, Results, Discussion, and Conclusion (IMRAD).</p>
      
      <h2>Writing and Revising</h2>
      <p>Write your first draft without worrying too much about perfection. Revise multiple times, focusing on clarity and logic.</p>
      
      <h2>Getting Feedback</h2>
      <p>Share your work with peers and mentors before final submission. Fresh eyes can catch issues you might miss.</p>
      
      <p>Remember, every published researcher started with their first paper. Take it one step at a time, and don't be afraid to ask for help along the way.</p>
    `,
    author: "Dr. Emily Rodriguez",
    date: "Dec 10, 2025",
    readTime: "12 min read",
    category: "Writing",
    views: 3891,
    image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&h=600&fit=crop",
  },
  {
    id: 4,
    title: "Top Grant Opportunities for 2026",
    excerpt: "A comprehensive list of funding opportunities for researchers and students.",
    content: `
      <p>Securing funding is crucial for research success. Here's a roundup of the top grant opportunities available for 2026.</p>
      
      <h2>National Science Foundation (NSF) Grants</h2>
      <p>NSF offers a wide range of funding opportunities across all scientific disciplines.</p>
      
      <h2>Private Foundation Grants</h2>
      <p>Many private foundations offer substantial funding for specific research areas.</p>
      
      <h2>International Funding Opportunities</h2>
      <p>Consider applying for grants from international organizations for global research projects.</p>
      
      <p>Start your applications early and tailor each proposal to the specific requirements of each funder.</p>
    `,
    author: "Dr. Michael Park",
    date: "Dec 8, 2025",
    readTime: "6 min read",
    category: "Funding",
    views: 1876,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=600&fit=crop",
  },
  {
    id: 5,
    title: "Building Your Research Portfolio as a Student",
    excerpt: "How to showcase your work and attract collaboration opportunities.",
    content: `
      <p>A strong research portfolio is essential for students looking to advance their academic careers. Here's how to build one that stands out.</p>
      
      <h2>Document Your Work</h2>
      <p>Keep records of all your research projects, including failed experiments and works in progress.</p>
      
      <h2>Create an Online Presence</h2>
      <p>Set up profiles on academic platforms and consider maintaining a personal website.</p>
      
      <h2>Present at Conferences</h2>
      <p>Even student conferences count. Presenting your work helps you gain visibility and feedback.</p>
      
      <p>Building a portfolio is an ongoing process. Start early and update regularly.</p>
    `,
    author: "Alex Thompson",
    date: "Dec 5, 2025",
    readTime: "7 min read",
    category: "Career",
    views: 2134,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop",
  },
  {
    id: 6,
    title: "Data Analysis Best Practices for Researchers",
    excerpt: "Essential techniques and tools for analyzing research data effectively.",
    content: `
      <p>Proper data analysis is the backbone of credible research. Follow these best practices to ensure your analysis is rigorous and reproducible.</p>
      
      <h2>Clean Your Data First</h2>
      <p>Before any analysis, ensure your data is properly formatted and free of errors.</p>
      
      <h2>Choose Appropriate Methods</h2>
      <p>Match your statistical methods to your research questions and data types.</p>
      
      <h2>Document Everything</h2>
      <p>Keep detailed records of all analytical decisions for reproducibility.</p>
      
      <h2>Visualize Your Results</h2>
      <p>Good visualizations can reveal patterns and communicate findings effectively.</p>
      
      <p>Investing time in proper data analysis pays dividends in the quality and impact of your research.</p>
    `,
    author: "Maria Garcia",
    date: "Dec 3, 2025",
    readTime: "10 min read",
    category: "Data Science",
    views: 1567,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop",
  },
];

export default function BlogArticlePage() {
  const { slug } = useParams();
  
  // Find article by ID (slug is actually the ID for now)
  const article = blogPosts.find(post => post.id.toString() === slug);
  
  if (!article) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mt-6"
      >
        <div className="aspect-[21/9] rounded-xl overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

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
            <Badge variant="secondary">{article.category}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {article.readTime}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              {article.views?.toLocaleString()} views
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
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{article.date}</span>
            </div>
          </div>

          {/* Article Body */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

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
