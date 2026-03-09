import { useState } from "react";
import { GlassNavigation } from "@/components/GlassNavigation";
import { PaymentCard } from "@/components/PaymentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface Card {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cardType: "visa" | "mastercard" | "amex";
  isDefault: boolean;
}

const cardSchema = z.object({
  cardNumber: z.string()
    .min(16, "Card number must be 16 digits")
    .max(16, "Card number must be 16 digits")
    .regex(/^\d+$/, "Card number must contain only digits"),
  cardHolder: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters"),
  expiryMonth: z.string().min(1, "Month is required"),
  expiryYear: z.string().min(1, "Year is required"),
  cvv: z.string()
    .min(3, "CVV must be 3-4 digits")
    .max(4, "CVV must be 3-4 digits")
    .regex(/^\d+$/, "CVV must contain only digits"),
  cardType: z.enum(["visa", "mastercard", "amex"]),
});

const initialCards: Card[] = [
  {
    id: "1",
    cardNumber: "4532123456781234",
    cardHolder: "Rangika Perera",
    expiryDate: "12/26",
    cardType: "visa",
    isDefault: true,
  },
  {
    id: "2",
    cardNumber: "5412345678901234",
    cardHolder: "Rangika Perera",
    expiryDate: "08/25",
    cardType: "mastercard",
    isDefault: false,
  },
];

const Cards = () => {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardType: "visa" as "visa" | "mastercard" | "amex",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSetDefault = (id: string) => {
    setCards(cards.map(card => ({
      ...card,
      isDefault: card.id === id,
    })));
    toast({
      title: "Default card updated",
      description: "Your default payment card has been changed.",
    });
  };

  const handleDelete = (id: string) => {
    const cardToDelete = cards.find(c => c.id === id);
    if (cardToDelete?.isDefault && cards.length > 1) {
      toast({
        title: "Cannot delete",
        description: "Please set another card as default before deleting.",
        variant: "destructive",
      });
      return;
    }
    setCards(cards.filter(card => card.id !== id));
    toast({
      title: "Card removed",
      description: "The card has been removed from your account.",
    });
  };

  const handleAddCard = () => {
    const result = cardSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const newCard: Card = {
      id: Date.now().toString(),
      cardNumber: formData.cardNumber,
      cardHolder: formData.cardHolder.toUpperCase(),
      expiryDate: `${formData.expiryMonth}/${formData.expiryYear.slice(-2)}`,
      cardType: formData.cardType,
      isDefault: cards.length === 0,
    };

    setCards([...cards, newCard]);
    setFormData({
      cardNumber: "",
      cardHolder: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      cardType: "visa",
    });
    setErrors({});
    setIsDialogOpen(false);
    toast({
      title: "Card added",
      description: "Your new card has been added successfully.",
    });
  };

  const months = Array.from({ length: 12 }, (_, i) => 
    String(i + 1).padStart(2, "0")
  );
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => 
    String(currentYear + i)
  );

  return (
    <div className="min-h-screen pb-28 relative">
      {/* Background gradient */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, hsl(191 100% 50% / 0.03) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cards</h1>
            <p className="text-sm text-muted-foreground">Manage your payment methods</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-border/50 max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Add New Card
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* Card Type */}
                <div className="space-y-2">
                  <Label>Card Type</Label>
                  <Select
                    value={formData.cardType}
                    onValueChange={(value: "visa" | "mastercard" | "amex") => 
                      setFormData({ ...formData, cardType: value })
                    }
                  >
                    <SelectTrigger className="glass border-border/50">
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent className="glass border-border/50">
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="amex">American Express</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.cardType && (
                    <p className="text-xs text-destructive">{errors.cardType}</p>
                  )}
                </div>

                {/* Card Number */}
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                    value={formData.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, cardNumber: value });
                    }}
                    className="glass border-border/50 font-mono"
                  />
                  {errors.cardNumber && (
                    <p className="text-xs text-destructive">{errors.cardNumber}</p>
                  )}
                </div>

                {/* Card Holder */}
                <div className="space-y-2">
                  <Label>Card Holder Name</Label>
                  <Input
                    type="text"
                    placeholder="JOHN DOE"
                    maxLength={50}
                    value={formData.cardHolder}
                    onChange={(e) => 
                      setFormData({ ...formData, cardHolder: e.target.value })
                    }
                    className="glass border-border/50 uppercase"
                  />
                  {errors.cardHolder && (
                    <p className="text-xs text-destructive">{errors.cardHolder}</p>
                  )}
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Select
                      value={formData.expiryMonth}
                      onValueChange={(value) => 
                        setFormData({ ...formData, expiryMonth: value })
                      }
                    >
                      <SelectTrigger className="glass border-border/50">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent className="glass border-border/50">
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.expiryMonth && (
                      <p className="text-xs text-destructive">{errors.expiryMonth}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select
                      value={formData.expiryYear}
                      onValueChange={(value) => 
                        setFormData({ ...formData, expiryYear: value })
                      }
                    >
                      <SelectTrigger className="glass border-border/50">
                        <SelectValue placeholder="YY" />
                      </SelectTrigger>
                      <SelectContent className="glass border-border/50">
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.expiryYear && (
                      <p className="text-xs text-destructive">{errors.expiryYear}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={formData.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, cvv: value });
                      }}
                      className="glass border-border/50"
                    />
                    {errors.cvv && (
                      <p className="text-xs text-destructive">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleAddCard} 
                  className="w-full mt-4"
                >
                  Add Card
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards List */}
        <div className="space-y-4">
          {cards.map((card) => (
            <PaymentCard
              key={card.id}
              id={card.id}
              cardNumber={card.cardNumber}
              cardHolder={card.cardHolder}
              expiryDate={card.expiryDate}
              cardType={card.cardType}
              isDefault={card.isDefault}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {cards.length === 0 && (
          <div className="text-center py-16">
            <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No cards yet</h3>
            <p className="text-muted-foreground mb-6">Add a payment card to get started</p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Card
            </Button>
          </div>
        )}
      </div>

      <GlassNavigation />
    </div>
  );
};

export default Cards;
