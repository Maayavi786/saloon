import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { LanguageProvider } from './hooks/useLanguage';
import { BookingProvider } from './contexts/BookingContext';
import HomeScreen from './screens/HomeScreen';
import SalonDetailsScreen from './screens/SalonDetailsScreen';
import BookingsScreen from './screens/BookingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';
import BookingFlowScreen from './screens/BookingFlowScreen';
import SalonManagementScreen from './screens/SalonManagementScreen';
import AddServiceScreen from './screens/AddServiceScreen';
import ManageStaffScreen from './screens/ManageStaffScreen';
import SalonSettingsScreen from './screens/SalonSettingsScreen';
import BookingConfirmationScreen from './screens/BookingConfirmationScreen';
import EditServiceScreen from './screens/EditServiceScreen'; // Added
import AddStaffScreen from './screens/AddStaffScreen';     // Added
import EditStaffScreen from './screens/EditStaffScreen';   // Added
import ManageServicesScreen from './screens/ManageServicesScreen'; // Added
import ReviewsScreen from './screens/ReviewsScreen'; // Added
import NotificationsScreen from './screens/NotificationsScreen'; //Added


const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <BookingProvider>
            <NavigationContainer>
              <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="SalonDetails" component={SalonDetailsScreen} />
                <Stack.Screen name="Bookings" component={BookingsScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen name="AddService" component={AddServiceScreen} />
                <Stack.Screen name="EditService" component={EditServiceScreen} />
                <Stack.Screen name="AddStaff" component={AddStaffScreen} />
                <Stack.Screen name="EditStaff" component={EditStaffScreen} />
                <Stack.Screen name="ManageServices" component={ManageServicesScreen} />
                <Stack.Screen name="ManageStaff" component={ManageStaffScreen} />
                <Stack.Screen name="Reviews" component={ReviewsScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen 
                  name="BookingFlow" 
                  component={BookingFlowScreen}
                  options={{ title: language === 'ar' ? 'حجز موعد' : 'Book Appointment' }}
                />
                <Stack.Screen 
                  name="SalonManagement" 
                  component={SalonManagementScreen}
                  options={{ title: language === 'ar' ? 'إدارة الصالون' : 'Salon Management' }}
                />
                <Stack.Screen 
                  name="SalonSettings" 
                  component={SalonSettingsScreen}
                  options={{ title: language === 'ar' ? 'إعدادات الصالون' : 'Salon Settings' }}
                />
                <Stack.Screen 
                  name="BookingConfirmation" 
                  component={BookingConfirmationScreen}
                  options={{ title: language === 'ar' ? 'تأكيد الحجز' : 'Booking Confirmation' }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </BookingProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}