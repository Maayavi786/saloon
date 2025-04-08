import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import SalonDetailsPage from "@/pages/salon-details-page";
import MyBookingsPage from "@/pages/my-bookings-page";
import ProfilePage from "@/pages/profile-page";
import { ProtectedRoute } from "./lib/protected-route";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider } from "@/hooks/use-auth";
import { BookingProvider } from "@/contexts/booking-context";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BookingProvider>
          <Switch>
            <Route path="/auth">
              <AuthPage />
            </Route>
            <Route path="/">
              <HomePage />
            </Route>
            <Route path="/salon/:id">
              <SalonDetailsPage />
            </Route>
            <ProtectedRoute path="/bookings" component={MyBookingsPage} />
            <ProtectedRoute path="/profile" component={ProfilePage} />
            <Route>
              <NotFound />
            </Route>
          </Switch>
          <Toaster />
        </BookingProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
