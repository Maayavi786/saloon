import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { apiRequest } from "@/lib/queryClient";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Make sure to call loadStripe outside of a component's render to avoid recreating the Stripe object
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

// The checkout form component that collects payment details
const CheckoutForm = ({ 
  amount, 
  serviceId, 
  bookingDetails, 
  onSuccess,
  onCancel
}: { 
  amount: number;
  serviceId: number;
  bookingDetails: any;
  onSuccess: (result: any) => void;
  onCancel: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { language, isRTL } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Confirm the payment with Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/payment-success",
      },
      redirect: "if_required"
    });

    if (error) {
      setErrorMessage(error.message || 
        language === 'ar' ? 'حدث خطأ أثناء معالجة الدفع' : 'There was an error processing your payment');
      toast({
        variant: "destructive",
        title: language === 'ar' ? 'فشل الدفع' : 'Payment Failed',
        description: error.message
      });
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment was successful, now confirm the booking
      try {
        const response = await apiRequest('POST', '/api/payment/confirm-booking', {
          paymentIntentId: paymentIntent.id,
          serviceId,
          bookingDetails
        });
        
        const result = await response.json();
        
        toast({
          title: language === 'ar' ? 'تم الدفع بنجاح' : 'Payment Successful',
          description: language === 'ar' ? 'تم تأكيد الحجز' : 'Your booking has been confirmed'
        });
        
        onSuccess(result);
      } catch (confirmError: any) {
        console.error('Error confirming booking:', confirmError);
        toast({
          variant: "destructive",
          title: language === 'ar' ? 'خطأ في تأكيد الحجز' : 'Booking Confirmation Error',
          description: confirmError.message || (language === 'ar' ? 'حدث خطأ أثناء تأكيد الحجز' : 'There was an error confirming your booking')
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Payment requires additional action or is processing
      toast({
        title: language === 'ar' ? 'الدفع معلق' : 'Payment Pending',
        description: language === 'ar' ? 'يتم معالجة الدفع' : 'Your payment is being processed'
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="bg-destructive/20 p-4 rounded-md text-destructive text-sm">
          {errorMessage}
        </div>
      )}
      
      <PaymentElement options={{
        layout: {
          type: 'tabs',
          defaultCollapsed: false
        },
        defaultValues: {
          billingDetails: {
            name: bookingDetails?.customerName || '',
            email: bookingDetails?.customerEmail || '',
            phone: bookingDetails?.customerPhone || '',
          }
        }
      }} />
      
      <div className="flex justify-between space-x-4 rtl:space-x-reverse">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isProcessing}
        >
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
        
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="min-w-[120px]"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          ) : language === 'ar' ? 'إتمام الدفع' : 'Pay Now'}
        </Button>
      </div>
    </form>
  );
};

// Main payment form component with Stripe wrapper
export function PaymentForm({
  amount,
  serviceId,
  bookingDetails,
  onSuccess,
  onCancel
}: {
  amount: number;
  serviceId: number;
  bookingDetails: any;
  onSuccess: (result: any) => void;
  onCancel: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiRequest('POST', '/api/payment/create-intent', {
          amount,
          serviceId,
          bookingDetails
        });
        
        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error(data.message || 'Could not get payment details');
        }
      } catch (err: any) {
        console.error('Error creating payment intent:', err);
        setError(err.message || 'Failed to initialize payment');
        toast({
          variant: "destructive",
          title: language === 'ar' ? 'خطأ في إعداد الدفع' : 'Payment Setup Error',
          description: err.message || (language === 'ar' ? 'حدث خطأ أثناء إعداد الدفع' : 'There was an error setting up your payment')
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [amount, serviceId, bookingDetails, toast, language]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'جاري إعداد الدفع...' : 'Setting up payment...'}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'حدث خطأ' : 'Error'}</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onCancel} className="w-full">
            {language === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!stripePromise) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'خطأ في التكوين' : 'Configuration Error'}</CardTitle>
          <CardDescription>{language === 'ar' ? 'لم يتم تكوين بوابة الدفع بشكل صحيح' : 'Payment gateway is not properly configured'}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onCancel} className="w-full">
            {language === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {language === 'ar' ? 'الدفع باستخدام البطاقة الائتمانية' : 'Pay with Credit Card'}
        </CardTitle>
        <CardDescription>
          {language === 'ar' 
            ? `المبلغ: ${amount.toFixed(2)} ريال سعودي` 
            : `Amount: SAR ${amount.toFixed(2)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm 
              amount={amount}
              serviceId={serviceId}
              bookingDetails={bookingDetails}
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </Elements>
        )}
      </CardContent>
    </Card>
  );
}