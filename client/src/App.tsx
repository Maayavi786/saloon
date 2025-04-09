
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home-page";
import AuthPage from "./pages/auth-page";
import SalonDetailsPage from "./pages/salon-details-page";
import ProfilePage from "./pages/profile-page";
import MyBookingsPage from "./pages/my-bookings-page";
import MapExplorer from "./pages/map-explorer";
import NotFound from "./pages/not-found";
import ProtectedRoute from "./lib/protected-route";
import { LanguageProvider } from "./hooks/use-language";

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/salon/:id" element={<SalonDetailsPage />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bookings" 
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/map" element={<MapExplorer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}
