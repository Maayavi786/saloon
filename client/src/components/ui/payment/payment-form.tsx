import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { PaymentMethod } from "@/types";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "../card";
import { Button } from "../button";
import { MadaPaymentForm } from "./mada-payment-form";

export const PaymentForm = () => {
  const { isArabic } = useLanguage();
  const [method, setMethod] = React.useState<PaymentMethod>("mada");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isArabic ? "اختر طريقة الدفع" : "Choose Payment Method"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "طرق الدفع المتاحة" : "Available payment methods"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant={method === "mada" ? "default" : "outline"}
              onClick={() => setMethod("mada")}
            >
              Mada مدى
            </Button>
            <Button
              variant={method === "applepay" ? "default" : "outline"}
              onClick={() => setMethod("applepay")}
            >
              Apple Pay
            </Button>
            <Button
              variant={method === "stcpay" ? "default" : "outline"}
              onClick={() => setMethod("stcpay")}
            >
              STC Pay
            </Button>
          </div>

          {method === "mada" && <MadaPaymentForm />}
          {/* Add other payment forms as needed */}
        </div>
      </CardContent>
    </Card>
  );
};