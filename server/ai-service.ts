import OpenAI from "openai";
import { Service, User, Booking } from "@shared/schema";

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Structure for recommendation request
interface RecommendationRequest {
  user: User;
  bookingHistory?: Booking[];
  salonId?: number;
  preferences?: string[];
  gender?: string;
  city?: string;
}

// Structure for recommendation response
export interface ServiceRecommendation {
  serviceId: number;
  serviceName: string;
  score: number;
  reason: string;
}

/**
 * Get personalized service recommendations for a user
 */
export async function getRecommendations(
  request: RecommendationRequest,
  availableServices: Service[],
  limit: number = 3
): Promise<ServiceRecommendation[]> {
  try {
    // Extract relevant user information
    const { user, bookingHistory = [], salonId, preferences = [], gender, city } = request;

    // Build the prompt for OpenAI
    const systemPrompt = `You are an AI assistant for a salon booking application in Saudi Arabia. 
Your task is to recommend salon services based on user preferences, booking history, and available services. 
Provide culturally appropriate recommendations, respecting gender-specific preferences.
`;

    // Prepare context information
    const userInfo = `
User profile:
- Name: ${user.name}
- Gender: ${user.gender || "Not specified"}
- Preferences: ${user.preferences || "Not specified"}
- Previous bookings: ${bookingHistory.length} services booked
${bookingHistory.length > 0 ? 
  "- Recent bookings: " + bookingHistory.map(b => 
    `${b.serviceId} (${new Date(b.date).toLocaleDateString()})`).join(", ") 
  : ""}
- Additional preferences: ${preferences.join(", ") || "None specified"}
`;

    const servicesInfo = `
Available services to recommend from:
${availableServices.map((service, index) => 
  `${index + 1}. ID: ${service.id}, Name: ${service.nameEn || service.name}, Category: ${service.category}, 
   Price: ${service.price} SAR, Duration: ${service.duration} minutes, 
   Description: ${service.descriptionEn || service.description}`
).join("\n")}
`;

    const constraints = `
Constraints:
${salonId ? `- Only recommend services from salon ID: ${salonId}` : ""}
${gender ? `- Consider user gender: ${gender}` : ""}
${city ? `- Consider user location: ${city}` : ""}
- Return recommendations in JSON format
- Prioritize services that match the user's preferences and past bookings
- Consider cultural relevance for Saudi Arabian context
`;

    const userQuery = `Please recommend ${limit} salon services for this user. For each recommendation, include the service ID, service name, a score from 0 to 100 indicating relevance, and a brief reason for the recommendation.`;

    let recommendations: ServiceRecommendation[] = [];
    
    try {
      // Make API call to OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInfo + servicesInfo + constraints + userQuery }
        ],
        response_format: { type: "json_object" }
      });

      // Parse the response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in the AI response");
      }
      
      try {
        const parsed = JSON.parse(content);
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          recommendations = parsed.recommendations.map((rec: any) => ({
            serviceId: parseInt(rec.serviceId),
            serviceName: rec.serviceName,
            score: parseInt(rec.score),
            reason: rec.reason
          }));
        } else {
          // Alternative parsing if the structure is different
          recommendations = Object.values(parsed).filter(item => 
            typeof item === 'object' && item !== null && 'serviceId' in item
          ).map((rec: any) => ({
            serviceId: parseInt(rec.serviceId),
            serviceName: rec.serviceName,
            score: parseInt(rec.score),
            reason: rec.reason
          }));
        }
      } catch (err) {
        console.error("Error parsing AI recommendations:", err);
        throw new Error("Failed to parse AI recommendations");
      }
    } catch (error) {
      console.error("OpenAI API error, using fallback recommendations:", error);
      
      // Use fallback recommendations based on available services
      recommendations = availableServices.slice(0, limit).map(service => ({
        serviceId: service.id,
        serviceName: service.nameEn || service.name,
        score: 90 - (availableServices.indexOf(service) * 10),
        reason: "Based on your preferences and popular services in your area"
      }));
    }

    // Sort by score (highest first) and limit the results
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error: any) {
    console.error("Error getting AI recommendations:", error);
    throw new Error(`Failed to get AI recommendations: ${error.message}`);
  }
}

/**
 * Generate a personalized welcome message with service suggestions
 */
export async function generateWelcomeMessage(
  user: User,
  recommendations: ServiceRecommendation[]
): Promise<string> {
  try {
    // Check if user prefers Arabic language
    const prefersArabic = user.preferences?.includes("arabic") || false;
    
    const systemPrompt = `You are a welcoming virtual assistant for a salon booking app in Saudi Arabia.
Generate a personalized welcome message for the user that is warm, culturally appropriate, and mentions recommended services.
${prefersArabic ? "The message should be in Arabic." : "The message should be in English."}
Keep the message concise (maximum 2 sentences).`;

    const userInfo = `
User: ${user.name}
Gender: ${user.gender || "Not specified"}
Recommendations: ${recommendations.map(r => r.serviceName).join(", ")}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInfo }
      ],
      max_tokens: 150
    });

    return response.choices[0].message.content || "Welcome to our salon app!";
  } catch (error: any) {
    console.error("Error generating welcome message:", error);
    return user.preferences?.includes("arabic")
      ? "أهلاً بك في تطبيق الصالون!" 
      : "Welcome to our salon app!";
  }
}

/**
 * Generate suggested appointment times based on user preferences and salon availability
 */
export async function suggestAppointmentTimes(
  service: Service,
  user: User
): Promise<string[]> {
  try {
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday in Saudi Arabia
    const prefersArabic = user.preferences?.includes("arabic") || false;
    
    const systemPrompt = `You are a scheduling assistant for a salon in Saudi Arabia.
Suggest 3 appropriate appointment times for a user booking a salon service.
Consider the time of day, day of week, and cultural norms in Saudi Arabia.
Today is ${new Date().toLocaleDateString()}, which is a ${isWeekend ? "weekend" : "weekday"}.
Return only the times as a JSON array of strings formatted as "HH:MM AM/PM".`;

    const userInfo = `
Service: ${service.nameEn || service.name}
Service duration: ${service.duration} minutes
User gender: ${user.gender || "Not specified"}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInfo }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in the AI response");
    }

    try {
      const parsed = JSON.parse(content);
      if (parsed.times && Array.isArray(parsed.times)) {
        return parsed.times;
      } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        return parsed.suggestions;
      } else {
        // Try to extract any array from the response
        const anyArray = Object.values(parsed).find(item => Array.isArray(item));
        if (anyArray) return anyArray as string[];
      }
    } catch (error) {
      console.error("Error parsing suggested times:", error);
    }

    // Default times if parsing fails
    return ["10:00 AM", "02:00 PM", "05:30 PM"];
    
  } catch (error: any) {
    console.error("Error suggesting appointment times:", error);
    return ["10:00 AM", "02:00 PM", "05:30 PM"];
  }
}