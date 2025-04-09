
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/hooks/use-language';
import { AuthProvider } from '@/hooks/use-auth';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import HomePage from '@/pages/home-page';
import AuthPage from '@/pages/auth-page';
import MapExplorer from '@/pages/map-explorer';
import SalonDetailsPage from '@/pages/salon-details-page';
import MyBookingsPage from '@/pages/my-bookings-page';
import ProfilePage from '@/pages/profile-page';
import NotFound from '@/pages/not-found';
import ProtectedRoute from '@/lib/protected-route';

import { BookingProvider } from "@/contexts/booking-context";

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <BookingProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/map" element={<MapExplorer />} />
                <Route path="/salon/:id" element={<SalonDetailsPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/bookings" element={<MyBookingsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </BookingProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
