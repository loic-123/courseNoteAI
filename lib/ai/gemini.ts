import { GoogleGenAI } from '@google/genai';

// Custom error class for quota exceeded errors
export class GeminiQuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiQuotaExceededError';
  }
}

export async function generateVisualWithGemini(
  prompt: string,
  apiKey: string
): Promise<string> {
  console.log('Starting Gemini visual generation with gemini-3-pro-image-preview...');
  console.log('Prompt length:', prompt.length);

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: prompt,
      config: {
        responseModalities: ['image', 'text'],
      },
    });

    console.log('Gemini response received');

    // Extract image from response
    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
      throw new Error('No content in Gemini response');
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        // Return as base64 data URL
        const mimeType = part.inlineData.mimeType || 'image/png';
        const base64Data = part.inlineData.data;
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        console.log('SUCCESS: Got image from Gemini (base64 data URL)');
        return dataUrl;
      }
    }

    throw new Error('No image found in Gemini response');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Gemini API error:', errorMessage);

    // Check if it's a quota exceeded error (429)
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      console.log('Gemini quota exceeded, will fallback to Ideogram');
      throw new GeminiQuotaExceededError(`Gemini quota exceeded: ${errorMessage}`);
    }

    throw new Error(`Failed to generate visual with Gemini: ${errorMessage}`);
  }
}
