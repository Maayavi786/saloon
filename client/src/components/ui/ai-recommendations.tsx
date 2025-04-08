import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { Service } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Sparkles } from "lucide-react";
import { useBooking } from "@/contexts/booking-context";
import { Skeleton } from "./skeleton";

interface ServiceRecommendation {
  serviceId: number;
  serviceName: string;
  score: number;
  reason: string;
  service?: Service;
}

interface RecommendationsResponse {
  recommendations: ServiceRecommendation[];
  message: string;
}

interface AIRecommendationsProps {
  salonId?: number;
  limit?: number;
  showReasons?: boolean;
}

export function AIRecommendations({ salonId, limit = 3, showReasons = true }: AIRecommendationsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { openBookingModal } = useBooking();
  const isArabic = language === "ar";
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ServiceRecommendation[]>([]);
  const [welcomeMessage, setWelcomeMessage] = useState<string>("");
  const [fallbackServices, setFallbackServices] = useState<Service[]>([]);

  // Load fallback services on component mount
  useEffect(() => {
    const loadFallbackServices = async () => {
      try {
        // Determine endpoint based on whether we have a salonId
        const endpoint = salonId 
          ? `/api/salons/${salonId}/featured-services` 
          : `/api/admin/debug-services?limit=10`;
          
        const res = await apiRequest("GET", endpoint);
        if (res.ok) {
          let services = await res.json();
          
          // Handle different response formats
          if (services.services && Array.isArray(services.services)) {
            services = services.services; // For debug endpoint
          }
          
          setFallbackServices(services || []);
        }
      } catch (error) {
        console.error("Error loading fallback services:", error);
      }
    };
    
    loadFallbackServices();
  }, [salonId]);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // Construct the correct URL with query parameters
        const params = new URLSearchParams();
        if (salonId) {
          params.append('salonId', salonId.toString());
        }
        if (limit) {
          params.append('limit', limit.toString());
        }
        
        const url = `/api/recommendations${params.toString() ? `?${params.toString()}` : ''}`;

        const res = await apiRequest("GET", url);
        if (!res.ok) {
          throw new Error("Failed to load recommendations");
        }

        const data: RecommendationsResponse = await res.json();
        setRecommendations(data.recommendations || []);

        // If no specific salon, also fetch a welcome message
        if (!salonId) {
          try {
            const welcomeRes = await apiRequest("GET", "/api/user/welcome-message");
            if (welcomeRes.ok) {
              const welcomeData = await welcomeRes.json();
              setWelcomeMessage(welcomeData.message || "");
            }
          } catch (err) {
            console.error("Failed to load welcome message:", err);
          }
        }
      } catch (error) {
        console.error("Error loading recommendations:", error);
        
        // Use fallback services if we have them
        if (fallbackServices.length > 0) {
          const fallbackRecommendations = fallbackServices.slice(0, limit).map((service, index) => ({
            serviceId: service.id,
            serviceName: service.nameEn || service.name,
            score: 90 - (index * 10),
            reason: isArabic 
              ? "بناءً على الخدمات الشائعة المتاحة" 
              : "Based on popular available services",
            service: service
          }));
          setRecommendations(fallbackRecommendations);
        } else {
          toast({
            title: isArabic ? "خطأ" : "Error",
            description: isArabic ? "تعذر تحميل التوصيات المخصصة" : "Could not load personalized recommendations",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadRecommendations();
    } else {
      setLoading(false);
    }
  }, [user, salonId, limit, toast, fallbackServices, isArabic]);

  const handleBookService = (recommendation: ServiceRecommendation) => {
    if (recommendation.service) {
      openBookingModal(recommendation.service);
    }
  };

  if (!user) {
    if (loading) return null;
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          {isArabic 
            ? "سجل دخول للحصول على توصيات مخصصة" 
            : "Sign in to see personalized recommendations"}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className={`flex items-center ${isArabic ? "space-x-reverse space-x-2" : "space-x-2"}`}>
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">{isArabic ? "توصيات مخصصة لك" : "AI Recommendations"}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(limit).fill(0).map((_, i) => (
            <Card key={i} className="border border-border">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col">
        <div className={`flex items-center ${isArabic ? "space-x-reverse space-x-2" : "space-x-2"}`}>
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">{isArabic ? "توصيات مخصصة لك" : "AI Recommendations"}</h2>
        </div>
        {welcomeMessage && (
          <p className="text-muted-foreground mt-2">{welcomeMessage}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.serviceId} className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle>
                {isArabic 
                  ? (recommendation.service?.name || recommendation.serviceName) 
                  : (recommendation.service?.nameEn || recommendation.service?.name || recommendation.serviceName)
                }
              </CardTitle>
              <CardDescription>
                {recommendation.service?.category} • {recommendation.service?.duration} {isArabic ? "دقيقة" : "minutes"} • {recommendation.service?.price} {isArabic ? "ريال" : "SAR"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showReasons && (
                <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleBookService(recommendation)}
                disabled={!recommendation.service}
              >
                {isArabic ? "احجز الآن" : "Book Now"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}