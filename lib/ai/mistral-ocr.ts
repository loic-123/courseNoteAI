const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

interface MistralOCRPage {
  index: number;
  markdown: string;
  images?: Array<{
    id: string;
    base64: string;
  }>;
}

interface MistralOCRResponse {
  pages: MistralOCRPage[];
  model: string;
  usage_info: {
    pages_processed: number;
    doc_size_bytes: number;
  };
}

/**
 * Process a document with Mistral OCR API
 * Supports PDF files and images (PNG, JPG, etc.)
 * Cost: ~$0.001 per page
 */
export async function ocrWithMistral(
  documentBase64: string,
  mimeType: string = 'application/pdf'
): Promise<string> {
  if (!MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY is not configured');
  }

  // Determine document type based on mime type
  const isImage = mimeType.startsWith('image/');
  const documentType = isImage ? 'image_url' : 'document_url';
  const dataUrl = `data:${mimeType};base64,${documentBase64}`;

  const requestBody = {
    model: 'mistral-ocr-latest',
    document: {
      type: documentType,
      [isImage ? 'image_url' : 'document_url']: dataUrl,
    },
  };

  console.log('Calling Mistral OCR API...');

  const response = await fetch('https://api.mistral.ai/v1/ocr', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Mistral OCR error:', errorText);
    throw new Error(`Mistral OCR failed: ${response.status} ${response.statusText}`);
  }

  const data: MistralOCRResponse = await response.json();

  console.log(`Mistral OCR processed ${data.usage_info.pages_processed} pages`);

  // Extract markdown text from all pages
  const text = data.pages
    .map((page) => page.markdown)
    .join('\n\n---\n\n');

  return text;
}
