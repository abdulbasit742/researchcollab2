import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Check, Smartphone, CreditCard, Building2, Copy, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  description: string;
  onSuccess?: () => void;
}

type PaymentMethod = "jazzcash" | "easypaisa" | "card" | "bank";

const PaymentMethodModal = ({
  open,
  onOpenChange,
  amount,
  description,
  onSuccess,
}: PaymentMethodModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<"select" | "details" | "processing" | "success">("select");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: "jazzcash" as const,
      name: "JazzCash",
      icon: Smartphone,
      color: "bg-[#ed1c24]",
      description: "Pay via JazzCash mobile wallet",
      accountNumber: "0300-1234567",
      accountTitle: "ResearchHub Pakistan",
    },
    {
      id: "easypaisa" as const,
      name: "EasyPaisa",
      icon: Smartphone,
      color: "bg-[#00a651]",
      description: "Pay via EasyPaisa mobile wallet",
      accountNumber: "0345-1234567",
      accountTitle: "ResearchHub Pakistan",
    },
    {
      id: "card" as const,
      name: "Credit/Debit Card",
      icon: CreditCard,
      color: "bg-gradient-to-r from-blue-600 to-blue-800",
      description: "Visa, Mastercard, UnionPay",
    },
    {
      id: "bank" as const,
      name: "Bank Transfer",
      icon: Building2,
      color: "bg-foreground",
      description: "Direct bank transfer",
      bankName: "HBL",
      accountNumber: "1234-5678-9012-3456",
      accountTitle: "ResearchHub Pakistan",
      iban: "PK36HABB0000123456789012",
    },
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const handlePaymentRequest = async () => {
    if ((selectedMethod === "jazzcash" || selectedMethod === "easypaisa") && !phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your mobile wallet phone number.",
        variant: "destructive",
      });
      return;
    }

    // Validate Pakistani phone number
    if (phoneNumber && !/^03\d{9}$/.test(phoneNumber.replace(/\D/g, ""))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Pakistani mobile number (03XX-XXXXXXX).",
        variant: "destructive",
      });
      return;
    }

    setStep("processing");
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setStep("success");

    setTimeout(() => {
      onSuccess?.();
      resetModal();
    }, 2000);
  };

  const resetModal = () => {
    setSelectedMethod(null);
    setStep("select");
    setPhoneNumber("");
    onOpenChange(false);
  };

  const selectedPaymentMethod = paymentMethods.find((m) => m.id === selectedMethod);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "select" && "Choose Payment Method"}
            {step === "details" && selectedPaymentMethod?.name}
            {step === "processing" && "Processing Payment"}
            {step === "success" && "Payment Successful"}
          </DialogTitle>
          <DialogDescription>
            {step === "select" && `Pay PKR ${amount.toLocaleString()} for ${description}`}
            {step === "details" && "Complete your payment using the details below"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount Display */}
          {step !== "success" && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Amount to Pay</p>
              <p className="text-3xl font-bold">PKR {amount.toLocaleString()}</p>
            </div>
          )}

          {/* Payment Method Selection */}
          {step === "select" && (
            <div className="grid gap-3">
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary",
                    selectedMethod === method.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={cn("p-2 rounded-lg text-white", method.color)}>
                      <method.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Payment Details */}
          {step === "details" && selectedPaymentMethod && (
            <div className="space-y-4">
              {/* JazzCash / EasyPaisa */}
              {(selectedMethod === "jazzcash" || selectedMethod === "easypaisa") && (
                <>
                  <div className="space-y-2">
                    <Label>Your Mobile Number</Label>
                    <Input
                      placeholder="03XX-XXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 11) {
                          setPhoneNumber(value);
                        }
                      }}
                      maxLength={11}
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll send a payment request to this number
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or pay manually to</span>
                    </div>
                  </div>

                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{selectedPaymentMethod.accountNumber}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(selectedPaymentMethod.accountNumber || "", "Account number")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Account Title</span>
                      <span className="font-medium">{selectedPaymentMethod.accountTitle}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Bank Transfer */}
              {selectedMethod === "bank" && (
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bank</span>
                    <span className="font-medium">{selectedPaymentMethod.bankName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{selectedPaymentMethod.accountNumber}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(selectedPaymentMethod.accountNumber || "", "Account number")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account Title</span>
                    <span className="font-medium">{selectedPaymentMethod.accountTitle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">IBAN</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{selectedPaymentMethod.iban}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(selectedPaymentMethod.iban || "", "IBAN")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Payment */}
              {selectedMethod === "card" && (
                <div className="text-center p-6 bg-muted rounded-lg">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    You'll be redirected to our secure payment gateway to complete your card payment.
                  </p>
                </div>
              )}

              <Badge variant="secondary" className="w-full justify-center py-2">
                After payment, your order will be processed within 24 hours
              </Badge>
            </div>
          )}

          {/* Processing State */}
          {step === "processing" && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">
                {selectedMethod === "jazzcash" || selectedMethod === "easypaisa"
                  ? "Sending payment request to your mobile..."
                  : "Processing your payment..."}
              </p>
            </div>
          )}

          {/* Success State */}
          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Payment Submitted!</h3>
              <p className="text-sm text-muted-foreground">
                Your payment is being verified. You'll receive a confirmation shortly.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {step === "select" && (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={!selectedMethod}
              onClick={() => setStep("details")}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {step === "details" && (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep("select")}>
              Back
            </Button>
            <Button className="flex-1" onClick={handlePaymentRequest}>
              {selectedMethod === "jazzcash" || selectedMethod === "easypaisa"
                ? "Send Payment Request"
                : selectedMethod === "card"
                ? "Pay with Card"
                : "I've Made the Transfer"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodModal;
