import { createContext, ReactNode, useContext, useState } from "react";
import { Service } from "@shared/schema";

interface BookingContextType {
  selectedService: Service | null;
  isBookingModalOpen: boolean;
  openBookingModal: (service: Service) => void;
  closeBookingModal: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const openBookingModal = (service: Service) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };
  
  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setTimeout(() => {
      setSelectedService(null);
    }, 300); // Clear service after animation completes
  };
  
  return (
    <BookingContext.Provider
      value={{
        selectedService,
        isBookingModalOpen,
        openBookingModal,
        closeBookingModal,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
