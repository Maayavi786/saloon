import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { SalonMap } from '@/components/salons/salon-map';
import { Salon } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { MapPin, Shield, Users, Home, List, Map as MapIcon } from 'lucide-react';
import { Link } from 'wouter';

export default function MapExplorer() {
  const { language, isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);
  const [view] = useState<'list'>('list');
  const [privacySettings, setPrivacySettings] = useState({
    privateRooms: false,
    femaleStaffOnly: false,
    homeService: false
  });

  // Query for salons
  const { data: salons = [] } = useQuery<Salon[]>({
    queryKey: ['/api/salons'],
  });

  // Reset to most appropriate view on mobile/desktop switch
  useEffect(() => {
    if (isMobile && view === 'map') {
      setView('list');
    }
  }, [isMobile]);

  // Handle selecting a salon from the list
  const handleSalonSelect = (salon: Salon) => {
    setSelectedSalonId(salon.id);
    if (isMobile) {
      setView('map');
    }
  };

  // Toggle privacy settings
  const togglePrivacySetting = (setting: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Render the list of salons
  const renderSalonList = () => (
    <div className="space-y-4 p-4 md:p-6 overflow-auto max-h-[calc(100vh-12rem)]">
      <div className="flex flex-wrap gap-2 mb-4">
        <Toggle 
          pressed={privacySettings.privateRooms}
          onPressedChange={() => togglePrivacySetting('privateRooms')}
          className="flex items-center gap-1"
        >
          <Shield size={14} />
          {language === 'ar' ? 'غرف خاصة' : 'Private Rooms'}
        </Toggle>
        <Toggle 
          pressed={privacySettings.femaleStaffOnly}
          onPressedChange={() => togglePrivacySetting('femaleStaffOnly')}
          className="flex items-center gap-1"
        >
          <Users size={14} />
          {language === 'ar' ? 'كادر نسائي فقط' : 'Female Staff Only'}
        </Toggle>
        <Toggle 
          pressed={privacySettings.homeService}
          onPressedChange={() => togglePrivacySetting('homeService')}
          className="flex items-center gap-1"
        >
          <Home size={14} />
          {language === 'ar' ? 'خدمة منزلية' : 'Home Service'}
        </Toggle>
      </div>
      
      {salons.map((salon) => (
        <Card 
          key={salon.id} 
          className={`cursor-pointer transition hover:shadow-md ${
            selectedSalonId === salon.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleSalonSelect(salon)}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                {language === 'ar' ? salon.name : (salon.nameEn || salon.name)}
              </CardTitle>
              <div className="flex items-center gap-1 text-sm">
                <MapPin size={16} className="text-primary" />
                <span>{language === 'ar' ? salon.city : (salon.cityEn || salon.city)}</span>
              </div>
            </div>
            <CardDescription className="line-clamp-2">
              {language === 'ar' 
                ? salon.description 
                : (salon.descriptionEn || salon.description)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-1 mt-2">
              {salon.hasPrivateRooms && (
                <div className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                  <Shield size={10} />
                  {language === 'ar' ? 'غرف خاصة' : 'Private Rooms'}
                </div>
              )}
              {salon.hasFemaleStaffOnly && (
                <div className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                  <Users size={10} />
                  {language === 'ar' ? 'كادر نسائي فقط' : 'Female Staff Only'}
                </div>
              )}
              {salon.providesHomeService && (
                <div className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                  <Home size={10} />
                  {language === 'ar' ? 'خدمة منزلية' : 'Home Service'}
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-end">
              <Link href={`/salons/${salon.id}`}>
                <Button size="sm" variant="outline">
                  {language === 'ar' ? 'عرض' : 'View'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Mobile view switcher
  const renderViewSwitcher = () => (
    isMobile && (
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-10 bg-background shadow-lg rounded-full">
        <div className="flex p-1">
          <Button
            size="sm"
            variant={view === 'list' ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => setView('list')}
          >
            <List size={16} />
          </Button>
          <Button
            size="sm"
            variant={view === 'map' ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => setView('map')}
          >
            <MapIcon size={16} />
          </Button>
        </div>
      </div>
    )
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className={`
          ${isMobile && view === 'map' ? 'hidden' : 'block'}
          ${isMobile ? 'w-full' : 'w-1/3'}
        `}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>
                {language === 'ar' ? 'استكشاف الصالونات' : 'Explore Salons'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'اكتشف الصالونات بناءً على احتياجاتك وموقعك' 
                  : 'Discover salons based on your needs and location'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderSalonList()}
            </CardContent>
          </Card>
        </div>
        
        <div className={`
          ${isMobile && view === 'list' ? 'hidden' : 'block'}
          ${isMobile ? 'w-full' : 'w-2/3'}
        `}>
          <Card className="h-full">
            <CardContent className="p-4">
              <SalonMap 
                highlightedSalonId={selectedSalonId || undefined}
                onSalonSelect={(salon) => setSelectedSalonId(salon.id)}
                showPrivateOnly={privacySettings.privateRooms}
                showOnlyFemaleStaff={privacySettings.femaleStaffOnly}
                showHomeService={privacySettings.homeService}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {renderViewSwitcher()}
    </div>
  );
}