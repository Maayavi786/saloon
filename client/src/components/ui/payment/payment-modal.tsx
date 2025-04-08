import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PaymentForm } from './payment-form';
import { Service, User } from '@shared/schema';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  bookingDetails: {
    date: string;
    time: string;
    notes?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    salonId: number;
  };
  onPaymentSuccess: (result: any) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  service,
  bookingDetails,
  onPaymentSuccess
}: PaymentModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');

  // Prepare booking details with user info if available
  const fullBookingDetails = {
    ...bookingDetails,
    serviceId: service.id,
    date: new Date(bookingDetails.date),
    time: bookingDetails.time,
    salonId: service.salonId,
    status: 'pending',
    paymentStatus: 'pending',
    customerName: bookingDetails.customerName || user?.name || '',
    customerEmail: bookingDetails.customerEmail || user?.email || '',
    customerPhone: bookingDetails.customerPhone || user?.phoneNumber || '',
  };

  const handlePaymentSuccess = (result: any) => {
    onPaymentSuccess(result);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {language === 'ar' ? 'إتمام عملية الدفع' : 'Complete Payment'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar'
              ? `الخدمة: ${service.name} - ${service.price} ريال سعودي`
              : `Service: ${service.nameEn || service.name} - SAR ${service.price}`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <PaymentForm
            amount={service.price}
            serviceId={service.id}
            bookingDetails={fullBookingDetails}
            onSuccess={handlePaymentSuccess}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}