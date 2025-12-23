import { useState } from "react";
import { Plus, Send, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

interface ChatActionsMenuProps {
  onSendOffer: () => void;
  onRequestConnect: () => void;
  disabled?: boolean;
}

export function ChatActionsMenu({ onSendOffer, onRequestConnect, disabled }: ChatActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          disabled={disabled}
          className="h-10 w-10 rounded-full shrink-0"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Plus className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-48">
        <DropdownMenuItem onClick={() => { onSendOffer(); setIsOpen(false); }}>
          <Send className="h-4 w-4 mr-2" />
          Send Offer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { onRequestConnect(); setIsOpen(false); }}>
          <UserPlus className="h-4 w-4 mr-2" />
          Request Connect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
