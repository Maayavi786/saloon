import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { Salon } from '@shared/schema';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Scissors, Shield, Users, Home } from 'lucide-react';

// Ensure we have the Mapbox token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
if (!MAPBOX_TOKEN) {
  console.error('Missing MAPBOX_TOKEN environment variable');
} else {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

// Type definitions
interface SalonMapProps {
  onSalonSelect?: (salon: Salon) => void;
  highlightedSalonId?: number;
  showPrivateOnly?: boolean;
  showOnlyFemaleStaff?: boolean;
  showHomeService?: boolean;
}

export function SalonMap({
  onSalonSelect,
  highlightedSalonId,
  showPrivateOnly = false,
  showOnlyFemaleStaff = false,
  showHomeService = false
}: SalonMapProps) {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [filterGender, setFilterGender] = useState<string | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [privacyFilter, setPrivacyFilter] = useState({
    privateRooms: showPrivateOnly,
    femaleStaffOnly: showOnlyFemaleStaff,
    homeService: showHomeService
  });

  // Query salons with privacy filters
  const { data: salons = [] } = useQuery<Salon[]>({
    queryKey: ['/api/salons', filterGender, privacyFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (filterGender) {
        queryParams.append('gender', filterGender);
      }
      
      if (privacyFilter.privateRooms) {
        queryParams.append('hasPrivateRooms', 'true');
      }
      
      if (privacyFilter.femaleStaffOnly) {
        queryParams.append('hasFemaleStaffOnly', 'true');
      }
      
      if (privacyFilter.homeService) {
        queryParams.append('providesHomeService', 'true');
      }
      
      const url = `/api/salons${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch salons');
      }
      return response.json();
    }
  });

  // Initialize map
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainer.current || map.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [46.6753, 24.7136], // Riyadh
      zoom: 10
    });
    
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }), 'top-right');
    
    map.current.on('load', () => {
      setMapInitialized(true);
    });
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when salons change
  useEffect(() => {
    if (!map.current || !mapInitialized || salons.length === 0) return;
    
    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());
    
    // Add new markers for each salon
    salons.forEach((salon) => {
      if (!salon.latitude || !salon.longitude) return;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'flex flex-col items-center cursor-pointer';
      
      // Marker dot
      const dot = document.createElement('div');
      dot.className = 'w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg';
      dot.style.backgroundColor = !salon.isActive 
        ? '#888888' 
        : salon.avgWaitTime === 0 
          ? '#10b981' 
          : salon.avgWaitTime && salon.avgWaitTime < 30 
            ? '#f59e0b' 
            : '#ef4444';
      
      // Icon inside the dot
      const icon = document.createElement('div');
      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>';
      
      dot.appendChild(icon);
      el.appendChild(dot);
      
      // Add label if highlighted
      if (salon.id === highlightedSalonId) {
        el.style.zIndex = '10';
        dot.style.transform = 'scale(1.25)';
        
        const label = document.createElement('div');
        label.className = 'mt-1 px-1 py-0.5 bg-white text-black text-[10px] rounded shadow-sm whitespace-nowrap';
        label.textContent = language === 'ar' ? salon.name : (salon.nameEn || salon.name);
        el.appendChild(label);
      }
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold text-base">${language === 'ar' ? salon.name : (salon.nameEn || salon.name)}</h3>
          <p class="text-sm">${language === 'ar' ? salon.address : (salon.addressEn || salon.address)}</p>
          <div class="mt-2 flex gap-1 flex-wrap">
            ${salon.hasPrivateRooms ? `<span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full">${language === 'ar' ? 'غرف خاصة' : 'Private Rooms'}</span>` : ''}
            ${salon.hasFemaleStaffOnly ? `<span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full">${language === 'ar' ? 'كادر نسائي فقط' : 'Female Staff Only'}</span>` : ''}
            ${salon.providesHomeService ? `<span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full">${language === 'ar' ? 'خدمة منزلية' : 'Home Service'}</span>` : ''}
          </div>
          <a href="/salons/${salon.id}" class="block mt-2 text-center bg-primary text-white text-sm py-1 px-2 rounded">
            ${language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
          </a>
        </div>
      `);
      
      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([salon.longitude, salon.latitude])
        .setPopup(popup)
        .addTo(map.current!);
      
      // Add click event
      el.addEventListener('click', () => {
        if (onSalonSelect) onSalonSelect(salon);
      });
    });
    
    // If a salon is highlighted, center the map on it
    if (highlightedSalonId && map.current) {
      const selectedSalon = salons.find(salon => salon.id === highlightedSalonId);
      if (selectedSalon && selectedSalon.latitude && selectedSalon.longitude) {
        map.current.flyTo({
          center: [selectedSalon.longitude, selectedSalon.latitude],
          zoom: 14
        });
      }
    }
  }, [salons, highlightedSalonId, language, onSalonSelect, mapInitialized]);

  // Set initial gender filter based on user preferences
  useEffect(() => {
    if (user?.gender === 'female' && user?.preferences === 'female_only') {
      setFilterGender('female_only');
    } else if (user?.gender === 'male' && user?.preferences === 'male_only') {
      setFilterGender('male_only');
    }
  }, [user]);
  
  // Update privacy filters from props
  useEffect(() => {
    setPrivacyFilter({
      privateRooms: showPrivateOnly,
      femaleStaffOnly: showOnlyFemaleStaff,
      homeService: showHomeService
    });
  }, [showPrivateOnly, showOnlyFemaleStaff, showHomeService]);

  // Privacy filter controls
  const renderPrivacyFilters = () => (
    <Card className="absolute bottom-4 left-4 z-10 p-3 max-w-xs">
      <CardHeader className="p-2 pb-0">
        <CardTitle className="text-sm">
          {language === 'ar' ? 'إعدادات الخصوصية' : 'Privacy Settings'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox 
              id="private-rooms" 
              checked={privacyFilter.privateRooms}
              onCheckedChange={(checked) => 
                setPrivacyFilter(prev => ({...prev, privateRooms: checked === true}))}
            />
            <Label htmlFor="private-rooms" className="text-xs cursor-pointer">
              {language === 'ar' ? 'غرف خاصة' : 'Private Rooms'}
            </Label>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox 
              id="female-staff" 
              checked={privacyFilter.femaleStaffOnly}
              onCheckedChange={(checked) => 
                setPrivacyFilter(prev => ({...prev, femaleStaffOnly: checked === true}))}
            />
            <Label htmlFor="female-staff" className="text-xs cursor-pointer">
              {language === 'ar' ? 'كادر نسائي فقط' : 'Female Staff Only'}
            </Label>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox 
              id="home-service" 
              checked={privacyFilter.homeService}
              onCheckedChange={(checked) => 
                setPrivacyFilter(prev => ({...prev, homeService: checked === true}))}
            />
            <Label htmlFor="home-service" className="text-xs cursor-pointer">
              {language === 'ar' ? 'خدمة منزلية' : 'Home Service'}
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Gender filter buttons
  const renderGenderFilter = () => (
    <Card className="absolute top-4 left-4 z-10 p-3">
      <CardContent className="p-2 flex space-x-2 rtl:space-x-reverse">
        <Button
          size="sm"
          variant={filterGender === null ? "default" : "outline"}
          onClick={() => setFilterGender(null)}
        >
          {language === 'ar' ? 'الكل' : 'All'}
        </Button>
        <Button
          size="sm"
          variant={filterGender === 'female_only' ? "default" : "outline"}
          onClick={() => setFilterGender('female_only')}
          className="text-pink-500 hover:text-pink-600"
        >
          {language === 'ar' ? 'للنساء' : 'Female'}
        </Button>
        <Button
          size="sm"
          variant={filterGender === 'male_only' ? "default" : "outline"}
          onClick={() => setFilterGender('male_only')}
          className="text-blue-500 hover:text-blue-600"
        >
          {language === 'ar' ? 'للرجال' : 'Male'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full"></div>
      
      {/* Render overlays only if map is present */}
      {MAPBOX_TOKEN && (
        <>
          {renderGenderFilter()}
          {renderPrivacyFilters()}
        </>
      )}
      
      {/* Show message if no token available */}
      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p>Mapbox API token is required to display the map</p>
        </div>
      )}
    </div>
  );
}