
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Service, Staff } from '@shared/schema';
import { StepIndicator } from '../components/ui/StepIndicator';
import { ServiceSelector } from '../components/booking/ServiceSelector';
import { StaffSelector } from '../components/booking/StaffSelector';
import { DateTimeSelector } from '../components/booking/DateTimeSelector';
import { PaymentSelector } from '../components/booking/PaymentSelector';
import { Button } from '../components/ui/Button';

export default function BookingFlowScreen({ route, navigation }) {
  const { salon } = route.params;
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const steps = [
    { title: isArabic ? 'اختيار الخدمة' : 'Select Service' },
    { title: isArabic ? 'اختيار الموظف' : 'Select Staff' },
    { title: isArabic ? 'اختيار الموعد' : 'Select Date & Time' },
    { title: isArabic ? 'الدفع' : 'Payment' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle booking confirmation
      handleConfirmBooking();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleConfirmBooking = async () => {
    try {
      const bookingData = {
        salonId: salon.id,
        serviceId: selectedService?.id,
        staffId: selectedStaff?.id,
        date: selectedDate,
        time: selectedTime,
        paymentMethod: selectedPayment,
      };

      // Make API call to create booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        navigation.navigate('BookingConfirmation', { booking: await response.json() });
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <StepIndicator steps={steps} currentStep={currentStep} />
      
      <ScrollView style={styles.content}>
        {currentStep === 0 && (
          <ServiceSelector
            salonId={salon.id}
            onSelect={setSelectedService}
            selected={selectedService}
          />
        )}
        
        {currentStep === 1 && (
          <StaffSelector
            salonId={salon.id}
            serviceId={selectedService?.id}
            onSelect={setSelectedStaff}
            selected={selectedStaff}
          />
        )}
        
        {currentStep === 2 && (
          <DateTimeSelector
            salonId={salon.id}
            serviceId={selectedService?.id}
            staffId={selectedStaff?.id}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        )}
        
        {currentStep === 3 && (
          <PaymentSelector
            amount={selectedService?.price || 0}
            onSelect={setSelectedPayment}
            selected={selectedPayment}
          />
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <Button onPress={handleBack} variant="outline">
          {isArabic ? 'رجوع' : 'Back'}
        </Button>
        <Button 
          onPress={handleNext}
          disabled={!selectedService || 
            (currentStep >= 1 && !selectedStaff) ||
            (currentStep >= 2 && (!selectedDate || !selectedTime)) ||
            (currentStep >= 3 && !selectedPayment)
          }
        >
          {currentStep === steps.length - 1 
            ? (isArabic ? 'تأكيد الحجز' : 'Confirm Booking')
            : (isArabic ? 'التالي' : 'Next')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
