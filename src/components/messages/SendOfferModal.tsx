import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Loader2 } from "lucide-react";

interface SendOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    offerType: string;
    title: string;
    description?: string;
    price: number;
    currency: string;
    deliveryDays?: number;
    attachmentUrl?: string;
  }) => Promise<void>;
  isSending: boolean;
}

const offerTypes = [
  { value: "tool_subscription", label: "Tool Subscription" },
  { value: "fyp_service", label: "FYP Service" },
  { value: "research_task", label: "Research Task" },
  { value: "tutoring", label: "Tutoring" },
  { value: "other", label: "Other" },
];

export function SendOfferModal({ open, onOpenChange, onSubmit, isSending }: SendOfferModalProps) {
  const [offerType, setOfferType] = useState("research_task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !price) return;

    await onSubmit({
      offerType,
      title: title.trim(),
      description: description.trim() || undefined,
      price: parseFloat(price),
      currency,
      deliveryDays: deliveryDays ? parseInt(deliveryDays) : undefined,
      attachmentUrl: attachmentUrl.trim() || undefined,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPrice("");
    setDeliveryDays("");
    setAttachmentUrl("");
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Send Offer</DrawerTitle>
          <DrawerDescription>
            Create an offer for this user
          </DrawerDescription>
        </DrawerHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 space-y-4 overflow-y-auto max-h-[60vh]"
        >
          <div className="space-y-2">
            <Label>Offer Type</Label>
            <Select value={offerType} onValueChange={setOfferType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {offerTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              placeholder="e.g., Data Analysis for Research"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe what you're offering..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price (PKR) *</Label>
              <Input
                type="number"
                placeholder="5000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PKR">PKR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Delivery Days</Label>
            <Input
              type="number"
              placeholder="7"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachment URL (optional)</Label>
            <Input
              placeholder="https://..."
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
            />
          </div>
        </motion.div>

        <DrawerFooter className="flex-row gap-2">
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1">Cancel</Button>
          </DrawerClose>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !price || isSending}
            className="flex-1"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              "Send Offer"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
