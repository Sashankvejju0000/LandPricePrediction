import { GoogleGenAI } from "@google/genai";

interface PropertyDetails {
  location: string;
  lat?: number;
  lng?: number;
  size: number;
  unit: 'sqft' | 'acre';
  type: string;
  amenities: string[];
  age: number;
  condition: string;
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // Enable CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Content-Type': 'application/json',
    };

    try {
      if (request.method === 'POST' && new URL(request.url).pathname === '/api/predict') {
        const details: PropertyDetails = await request.json();

        const ai = new GoogleGenAI({ 
          apiKey: env.GEMINI_API_KEY 
        });

        const prompt = `
          Act as a "Real-Time Real Estate Strategist" for the Indian market.
          Location: "${details.location}" (Lat: ${details.lat}, Lng: ${details.lng}).
          Property Type: ${details.type}
          Size: ${details.size} ${details.unit}
          Age: ${details.age} years
          Condition: ${details.condition}
          Amenities: ${details.amenities.join(', ')}.

          Provide a detailed valuation in JSON format with:
          - predictedPrice: Estimated price in ₹
          - priceRange: [min, max]
          - confidenceScore: 0-100
          - marketTrends: Array of past 3 years to future 3 years
          - buyerSellerAdvice: Strategic recommendations
        `;

        const response = await ai.models.generateContent({
          model: "gemini-2-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        return new Response(response.text, {
          headers: corsHeaders,
        });
      }

      return new Response(
        JSON.stringify({ error: 'Not Found' }),
        { status: 404, headers: corsHeaders }
      );
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error', details: String(error) }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
