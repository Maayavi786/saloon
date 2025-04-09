
import React from 'react';
import { Salon } from '@shared/schema';
import { useLanguage } from '@/hooks/use-language';
import { Card } from '@/components/ui/card';

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
  const { language } = useLanguage();

  return (
    <Card className="w-full h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <p className="text-center text-muted-foreground">
        {language === 'ar' ? 'عرض القائمة فقط' : 'List view only'}
      </p>
    </Card>
  );
}
