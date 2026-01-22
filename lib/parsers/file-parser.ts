import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse-fork';
import { ocrWithMistral } from '@/lib/ai/mistral-ocr';

export async function parseFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await parsePDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return await parseDOCX(file);
  } else if (fileType.startsWith('text/') || fileName.endsWith('.txt')) {
    return await parseTXT(file);
  } else if (fileType.startsWith('image/')) {
    return await parseImage(file);
  } else {
    throw new Error('Unsupported file type. Please upload PDF, DOCX, TXT, or image files.');
  }
}

async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Try standard text extraction first
  try {
    const data = await pdfParse(buffer);
    const text = data.text.trim();

    // If we have enough text, return it
    if (text.length > 50) {
      console.log('PDF parsed successfully with standard extraction');
      return text;
    }

    // PDF is likely a scanned document - try OCR
    console.log('PDF has little text, trying Mistral OCR...');
  } catch (error) {
    console.log('PDF parse failed, trying Mistral OCR...', error);
  }

  // Fallback to Mistral OCR for scanned PDFs
  return await parsePDFWithOCR(file);
}

async function parsePDFWithOCR(file: File): Promise<string> {
  // Check if Mistral API key is configured
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error(
      'This PDF appears to be a scanned document. OCR is not configured. ' +
      'Please upload the document as images (PNG, JPG) instead, or use a PDF with selectable text.'
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const text = await ocrWithMistral(base64, 'application/pdf');

    if (!text || text.length < 50) {
      throw new Error('OCR could not extract meaningful text from this document.');
    }

    return text;
  } catch (error) {
    console.error('Mistral OCR error:', error);
    throw new Error(
      'Failed to process this scanned PDF. ' +
      'Try uploading the document as images (PNG, JPG) instead.'
    );
  }
}

async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function parseTXT(file: File): Promise<string> {
  const text = await file.text();
  return text;
}

async function parseImage(file: File): Promise<string> {
  // Try Mistral OCR first if available (better accuracy)
  if (process.env.MISTRAL_API_KEY) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const text = await ocrWithMistral(base64, file.type);

      if (text && text.length > 10) {
        console.log('Image OCR completed with Mistral');
        return text;
      }
    } catch (error) {
      console.log('Mistral OCR failed for image, falling back to Tesseract...', error);
    }
  }

  // Fallback to Tesseract.js (slower but works offline)
  console.log('Using Tesseract.js for image OCR...');
  const {
    data: { text },
  } = await Tesseract.recognize(file, 'eng+fra', {
    logger: (m) => console.log(m),
  });
  return text;
}
