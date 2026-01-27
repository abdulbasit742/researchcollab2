import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useCreateProject } from "@/hooks/useEarning";
import { cn } from "@/lib/utils";

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description must be less than 2000 characters"),
  budget_min: z.coerce.number().min(500, "Minimum budget is PKR 500"),
  budget_max: z.coerce.number().min(500, "Maximum budget is PKR 500"),
  deadline_days: z.coerce.number().min(1, "Deadline must be at least 1 day").max(365, "Deadline cannot exceed 365 days"),
  location: z.string().optional(),
}).refine((data) => data.budget_max >= data.budget_min, {
  message: "Maximum budget must be greater than or equal to minimum budget",
  path: ["budget_max"],
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface PostProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Enhanced input wrapper with validation state indicator
function ValidatedInput({ 
  children, 
  isValid, 
  isTouched, 
  error 
}: { 
  children: React.ReactNode; 
  isValid: boolean; 
  isTouched: boolean;
  error?: string;
}) {
  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {isTouched && !error && isValid && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Success state component
function SuccessState({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="mb-6 rounded-full bg-green-100 p-4 dark:bg-green-900/30"
      >
        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-2 text-xl font-semibold"
      >
        Project Posted Successfully! 🎉
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 text-muted-foreground"
      >
        Your project is now live and visible to freelancers.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button onClick={onClose}>View Projects</Button>
      </motion.div>
    </motion.div>
  );
}

export function PostProjectModal({ open, onOpenChange, onSuccess }: PostProjectModalProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { createProject, creating } = useCreateProject();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      budget_min: 5000,
      budget_max: 20000,
      deadline_days: 14,
      location: "Remote",
    },
    mode: "onChange", // Enable real-time validation
  });

  const { formState: { errors, touchedFields, dirtyFields } } = form;

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    form.reset();
    setTags([]);
    onOpenChange(false);
  };

  const onSubmit = async (data: ProjectFormData) => {
    const result = await createProject({
      title: data.title,
      description: data.description,
      budget_min: data.budget_min,
      budget_max: data.budget_max,
      deadline_days: data.deadline_days,
      tags: tags,
      location: data.location,
    });

    if (result.success) {
      setShowSuccess(true);
      onSuccess?.();
      // Auto-close after delay
      setTimeout(() => {
        handleClose();
      }, 3000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <SuccessState key="success" onClose={handleClose} />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle>Post a New Project</DialogTitle>
                <DialogDescription>
                  Describe your project to find talented freelancers. All budgets are in PKR.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <ValidatedInput
                            isValid={!fieldState.error && field.value.length >= 5}
                            isTouched={!!fieldState.isDirty}
                            error={fieldState.error?.message}
                          >
                            <Input 
                              placeholder="e.g., Data Analysis for Research Paper" 
                              className={cn(
                                "pr-10 transition-colors",
                                fieldState.error && "border-destructive focus-visible:ring-destructive",
                                !fieldState.error && fieldState.isDirty && field.value.length >= 5 && "border-green-500 focus-visible:ring-green-500"
                              )}
                              {...field} 
                            />
                          </ValidatedInput>
                        </FormControl>
                        <AnimatePresence>
                          {fieldState.error && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <FormMessage className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {fieldState.error.message}
                              </FormMessage>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the project scope, requirements, and deliverables..."
                            className={cn(
                              "min-h-[120px] resize-none transition-colors",
                              fieldState.error && "border-destructive focus-visible:ring-destructive",
                              !fieldState.error && fieldState.isDirty && field.value.length >= 20 && "border-green-500 focus-visible:ring-green-500"
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="flex justify-between">
                          <span>Be specific about what you need.</span>
                          <span className={cn(
                            "text-xs transition-colors",
                            field.value.length < 20 && fieldState.isDirty && "text-destructive",
                            field.value.length >= 20 && "text-green-600"
                          )}>
                            {field.value.length}/20 min
                          </span>
                        </FormDescription>
                        <AnimatePresence>
                          {fieldState.error && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <FormMessage className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {fieldState.error.message}
                              </FormMessage>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget_min"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Min Budget (PKR)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5000" 
                              className={cn(
                                "transition-colors",
                                fieldState.error && "border-destructive focus-visible:ring-destructive"
                              )}
                              {...field} 
                            />
                          </FormControl>
                          <AnimatePresence>
                            {fieldState.error && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <FormMessage className="flex items-center gap-1 text-xs">
                                  <AlertCircle className="h-3 w-3" />
                                  {fieldState.error.message}
                                </FormMessage>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budget_max"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Max Budget (PKR)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="20000" 
                              className={cn(
                                "transition-colors",
                                fieldState.error && "border-destructive focus-visible:ring-destructive"
                              )}
                              {...field} 
                            />
                          </FormControl>
                          <AnimatePresence>
                            {fieldState.error && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <FormMessage className="flex items-center gap-1 text-xs">
                                  <AlertCircle className="h-3 w-3" />
                                  {fieldState.error.message}
                                </FormMessage>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="deadline_days"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Deadline (Days)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="14" 
                            min={1} 
                            max={365} 
                            className={cn(
                              "transition-colors",
                              fieldState.error && "border-destructive focus-visible:ring-destructive"
                            )}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Number of days from today for project completion.
                        </FormDescription>
                        <AnimatePresence>
                          {fieldState.error && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <FormMessage className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {fieldState.error.message}
                              </FormMessage>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Preference</FormLabel>
                        <FormControl>
                          <Input placeholder="Remote" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Tags Input */}
                  <div className="space-y-2">
                    <FormLabel>Skills/Tags (up to 5)</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={tags.length >= 5}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={addTag}
                        disabled={tags.length >= 5 || !tagInput.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <AnimatePresence>
                      {tags.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-wrap gap-2 mt-2"
                        >
                          {tags.map((tag, index) => (
                            <motion.div
                              key={tag}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Badge variant="secondary" className="gap-1">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-1 hover:text-destructive transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onOpenChange(false)}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={creating}>
                      {creating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Post Project"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
