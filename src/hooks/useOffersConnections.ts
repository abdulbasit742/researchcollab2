import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Offer {
  id: string;
  thread_id: string;
  sender_id: string;
  recipient_id: string;
  offer_type: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  delivery_days: number | null;
  status: string;
  created_at: string;
}

export interface ConnectionRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
}

export function useOffers(threadId: string | undefined) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const sendOffer = async (data: {
    recipientId: string;
    offerType: string;
    title: string;
    description?: string;
    price: number;
    currency: string;
    deliveryDays?: number;
    attachmentUrl?: string;
    attachmentLabel?: string;
  }) => {
    if (!user || !threadId) return null;

    setIsSending(true);
    try {
      // Create offer
      const { data: offer, error: offerError } = await supabase
        .from("offers")
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          recipient_id: data.recipientId,
          offer_type: data.offerType,
          title: data.title,
          description: data.description,
          price: data.price,
          currency: data.currency,
          delivery_days: data.deliveryDays,
        })
        .select()
        .single();

      if (offerError) throw offerError;

      // Add attachment if provided
      if (data.attachmentUrl && offer) {
        await supabase.from("offer_attachments").insert({
          offer_id: offer.id,
          url: data.attachmentUrl,
          label: data.attachmentLabel || "Attachment",
        });
      }

      // Send system message about the offer
      await supabase.from("messages").insert({
        thread_id: threadId,
        sender_id: user.id,
        body: `Offer: ${data.title}`,
        type: "offer",
        metadata: { offer_id: offer.id },
      });

      // Update thread
      await supabase
        .from("message_threads")
        .update({
          last_message_at: new Date().toISOString(),
          last_message_text: `Offer sent: ${data.title}`,
        })
        .eq("id", threadId);

      toast({
        title: "Offer sent!",
        description: "Waiting for response.",
      });

      return offer;
    } catch (err) {
      toast({
        title: "Failed to send offer",
        description: "Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSending(false);
    }
  };

  const updateOfferStatus = async (offerId: string, status: "accepted" | "rejected" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("offers")
        .update({ status })
        .eq("id", offerId);

      if (error) throw error;

      toast({
        title: status === "accepted" ? "Offer accepted!" : status === "rejected" ? "Offer declined" : "Offer cancelled",
      });

      return true;
    } catch (err) {
      toast({
        title: "Failed to update offer",
        variant: "destructive",
      });
      return false;
    }
  };

  return { sendOffer, updateOfferStatus, isSending };
}

export function useConnections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const sendConnectionRequest = async (recipientId: string, threadId: string) => {
    if (!user) return null;

    setIsSending(true);
    try {
      // Check if request already exists
      const { data: existing } = await supabase
        .from("connection_requests")
        .select("id, status")
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        toast({
          title: existing.status === "accepted" ? "Already connected!" : "Request already sent",
        });
        return existing;
      }

      const { data: request, error } = await supabase
        .from("connection_requests")
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
        })
        .select()
        .single();

      if (error) throw error;

      // Send system message
      await supabase.from("messages").insert({
        thread_id: threadId,
        sender_id: user.id,
        body: "Connection request sent",
        type: "system",
        metadata: { connection_request_id: request.id },
      });

      // Update thread
      await supabase
        .from("message_threads")
        .update({
          last_message_at: new Date().toISOString(),
          last_message_text: "Connection request sent",
        })
        .eq("id", threadId);

      toast({
        title: "Connection request sent!",
      });

      return request;
    } catch (err) {
      toast({
        title: "Failed to send request",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSending(false);
    }
  };

  const updateConnectionStatus = async (requestId: string, status: "accepted" | "rejected") => {
    try {
      const { error } = await supabase
        .from("connection_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: status === "accepted" ? "Connected!" : "Request declined",
      });

      return true;
    } catch (err) {
      toast({
        title: "Failed to update",
        variant: "destructive",
      });
      return false;
    }
  };

  const getConnectionStatus = useCallback(async (otherUserId: string) => {
    if (!user) return null;

    const { data } = await supabase
      .from("connection_requests")
      .select("*")
      .or(`and(requester_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
      .maybeSingle();

    return data;
  }, [user]);

  return { sendConnectionRequest, updateConnectionStatus, getConnectionStatus, isSending };
}

export function useAttachments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadAttachment = async (file: File, threadId: string) => {
    if (!user) return null;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return null;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only images (JPG, PNG, WebP) and PDFs are allowed",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${threadId}/${user.id}/${timestamp}-${safeName}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from("chat_attachments")
        .upload(path, file);

      if (uploadError) throw uploadError;

      setUploadProgress(70);

      // Get signed URL
      const { data: urlData } = await supabase.storage
        .from("chat_attachments")
        .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days

      setUploadProgress(100);

      return {
        fileName: file.name,
        fileType: file.type,
        path,
        size: file.size,
        signedUrl: urlData?.signedUrl,
      };
    } catch (err) {
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getSignedUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from("chat_attachments")
      .createSignedUrl(path, 60 * 60); // 1 hour

    return data?.signedUrl;
  };

  return { uploadAttachment, getSignedUrl, isUploading, uploadProgress };
}
