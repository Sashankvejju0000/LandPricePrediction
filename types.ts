
export interface PropertyDetails {
  location: string;
  lat?: number;
  lng?: number;
  size: number;
  unit: 'sqft' | 'acre';
  type: 'Apartment' | 'Individual House' | 'Commercial Space' | 'Empty Land' | 'Industrial Land' | 'Agricultural Land';
  amenities: string[];
  age: number;
  condition: 'New' | 'Good' | 'Fair' | 'Needs Renovation';
  image?: string; // Base64 image data
}

export interface PredictionResult {
  predictedPrice: number;
  priceRange: [number, number];
  confidenceScore: number;
  influencingFactors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  marketTrends: {
    period: string;
    price: number;
    high: number;
    low: number;
  }[];
  nearbyInsights: string;
  buyerSellerAdvice: {
    buyerAction: string;
    sellerAction: string;
    reasoning: string;
  };
  groundingLinks?: { title: string; uri: string }[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PREDICT = 'PREDICT',
  INSIGHTS = 'INSIGHTS',
  VISUALIZER = 'VISUALIZER',
  ABOUT = 'ABOUT'
}
