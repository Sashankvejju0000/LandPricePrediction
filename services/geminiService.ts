
import { GoogleGenAI, Type } from "@google/genai";
import { PropertyDetails, PredictionResult } from "../types";

// Main valuation engine: Flash for speed
export async function predictPropertyPrice(details: PropertyDetails): Promise<PredictionResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a "Real-Time Real Estate Strategist" for the Indian market.
    Location: "${details.location}" (Lat: ${details.lat}, Lng: ${details.lng}).
    Property Type: ${details.type}
    Size: ${details.size} ${details.unit}
    Age: ${details.age} years
    Condition: ${details.condition}
    Amenities: ${details.amenities.join(', ')}.

    VALUATION ENGINE NUANCES:
    - If APARTMENT: Consider floor number, parking, and super-built-up vs carpet area logic.
    - If INDIVIDUAL HOUSE: Value land and construction separately.
    - If COMMERCIAL: Consider frontage, visibility, and rental yield.
    - If EMPTY LAND: Focus on circle rates, zoning, and road width.

    TASK:
    1. Calculate Precise Valuation (₹) using current circle rates and market sentiment.
    2. Analyze Past (3 years), Present (2025), and Future (3 years) trends.
    3. For EVERY trend point, provide a 'high' and 'low' bound.
    4. Provide "buyerSellerAdvice" with deep reasoning.
    5. "nearbyInsights": A narrative "Market Brief".

    RESPONSE FORMAT: Strictly JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          predictedPrice: { type: Type.NUMBER },
          priceRange: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          confidenceScore: { type: Type.NUMBER },
          influencingFactors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                factor: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
                description: { type: Type.STRING }
              },
              required: ["factor", "impact", "description"]
            }
          },
          marketTrends: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                period: { type: Type.STRING },
                price: { type: Type.NUMBER },
                high: { type: Type.NUMBER },
                low: { type: Type.NUMBER }
              },
              required: ["period", "price", "high", "low"]
            }
          },
          nearbyInsights: { type: Type.STRING },
          buyerSellerAdvice: {
            type: Type.OBJECT,
            properties: {
              buyerAction: { type: Type.STRING },
              sellerAction: { type: Type.STRING },
              reasoning: { type: Type.STRING }
            },
            required: ["buyerAction", "sellerAction", "reasoning"]
          }
        },
        required: ["predictedPrice", "priceRange", "confidenceScore", "influencingFactors", "marketTrends", "nearbyInsights", "buyerSellerAdvice"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Valuation engine error", e);
    throw new Error("Valuation engine failed. Check connectivity.");
  }
}

// Advanced Chat Bot using Gemini 3 Pro Preview
export async function chatWithConsultant(message: string, context?: PredictionResult | null) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let systemContext = `You are "Consultant PS", a world-class AI Real Estate Analyst. 
  Your goal is to provide strategic, data-driven advice on property investment, valuation, and market trends. 
  Always use a professional, insightful, and helpful tone.
  If the user asks about a specific price or ROI, give detailed reasoning.`;

  if (context) {
    systemContext += `
    CURRENT PROPERTY CONTEXT:
    - Analyzed Valuation: ₹${context.predictedPrice}
    - Location Sentiment: ${context.nearbyInsights}
    - Strategic Advice: ${context.buyerSellerAdvice.reasoning}
    - Market Growth: ${context.marketTrends.map(t => `${t.period}: ₹${t.price}`).join(', ')}
    
    Refer to these numbers in your response to provide personalized consultation.`;
  } else {
    systemContext += `\nCurrently, no specific property has been analyzed yet. You can provide general market advice or guide the user on how to use the "Valuation Engine" to get a precise quote.`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2-flash",
    contents: message,
    config: {
      systemInstruction: systemContext
    }
  });

  return response.text;
}

// Maps and Search Grounding
export async function getDeepInsights(location: string, lat?: number, lng?: number) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2-flash",
    contents: `Analyze infrastructure and real estate scenario for ${location}. Find specific metro projects, schools, or industrial growth.`,
    config: {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined
        }
      }
    }
  });

  const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
    if (chunk.web) return { title: chunk.web.title || 'Web Result', uri: chunk.web.uri };
    if (chunk.maps) return { title: chunk.maps.title || 'Location Insight', uri: chunk.maps.uri };
    return null;
  }).filter((c: any) => c !== null) || [];

  return { text: response.text, links: grounding };
}

// AI Image Editing
export async function editPropertyImage(base64Image: string, prompt: string, propertyType: string = 'Property') {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imageData = base64Image.split(',')[1] || base64Image;
  const response = await ai.models.generateContent({
    model: 'gemini-2-flash',
    contents: {
      parts: [
        { inlineData: { data: imageData, mimeType: 'image/png' } },
        { text: `You are an architectural visualizer. Edit this ${propertyType} photo: "${prompt}". Improve visual appeal or show renovations relevant to a ${propertyType}. Keep the context of the property type consistent.` },
      ],
    },
  });
  const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);
  if (imagePart?.inlineData) return `data:image/png;base64,${imagePart.inlineData.data}`;
  throw new Error("Failed to edit image.");
}
