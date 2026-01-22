import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse-fork';

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

  try {
    const data = await pdfParse(buffer);
    const text = data.text.trim();

    // If we have enough text, return it
    if (text.length > 50) {
      return text;
    }

    // PDF is likely a scanned document (image-only)
    throw new Error(
      'This PDF appears to be a scanned document with no extractable text. ' +
      'Please upload the document as images (PNG, JPG) instead, or use a PDF with selectable text.'
    );
  } catch (error) {
    // Re-throw our custom error
    if (error instanceof Error && error.message.includes('scanned document')) {
      throw error;
    }

    // Handle other parsing errors
    console.error('PDF parse error:', error);
    throw new Error(
      'Failed to parse this PDF. The file may be corrupted, password-protected, or in an unsupported format. ' +
      'Try uploading as images instead.'
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
  const {
    data: { text },
  } = await Tesseract.recognize(file, 'eng', {
    logger: (m) => console.log(m),
  });
  return text;
}
