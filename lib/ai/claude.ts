import Anthropic from '@anthropic-ai/sdk';
import { buildNotesGenerationPrompt } from './prompts';
import { TechnicalLevel, Length, QCMData } from '@/types';

export interface ClaudeGenerationResult {
  notesMarkdown: string;
  qcmJson: QCMData;
  visualPrompt: string;
}

// Maximum characters for extracted text to ensure Claude has room for response
// Claude Sonnet has ~200k context, but we limit input to leave room for output
const MAX_EXTRACTED_TEXT_LENGTH = 50000;

export async function generateWithClaude(
  apiKey: string,
  extractedText: string,
  detailLevel: number,
  useMetaphors: boolean,
  technicalLevel: TechnicalLevel,
  length: Length,
  language: 'en' | 'fr',
  customPrompt?: string
): Promise<ClaudeGenerationResult> {
  const anthropic = new Anthropic({ apiKey });

  // Truncate extracted text if too long to ensure Claude can complete all sections
  let processedText = extractedText;
  if (extractedText.length > MAX_EXTRACTED_TEXT_LENGTH) {
    console.warn(`Extracted text truncated from ${extractedText.length} to ${MAX_EXTRACTED_TEXT_LENGTH} characters`);
    processedText = extractedText.substring(0, MAX_EXTRACTED_TEXT_LENGTH) +
      '\n\n[... Content truncated for processing. The above represents the main content of the document.]';
  }

  const prompt = buildNotesGenerationPrompt(
    processedText,
    detailLevel,
    useMetaphors,
    technicalLevel,
    length,
    language,
    customPrompt
  );

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 16000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Check if response was truncated due to max_tokens
  if (message.stop_reason === 'max_tokens') {
    console.error('Claude response was truncated due to max_tokens limit');
  }

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse the three sections
  const notesMatch = responseText.match(/---NOTES_START---([\s\S]*?)---NOTES_END---/);
  const qcmMatch = responseText.match(/---QCM_START---([\s\S]*?)---QCM_END---/);
  const visualMatch = responseText.match(/---VISUAL_PROMPT_START---([\s\S]*?)---VISUAL_PROMPT_END---/);

  if (!notesMatch || !qcmMatch || !visualMatch) {
    const missingSections = [];
    if (!notesMatch) missingSections.push('NOTES');
    if (!qcmMatch) missingSections.push('QCM');
    if (!visualMatch) missingSections.push('VISUAL');

    console.error('Failed to parse sections. Response length:', responseText.length);
    console.error('Stop reason:', message.stop_reason);
    console.error('Missing sections:', missingSections.join(', '));
    console.error('Response ends with:', responseText.substring(Math.max(0, responseText.length - 200)));

    // Provide more helpful error message
    let errorMsg = `Failed to generate complete study materials. Missing: ${missingSections.join(', ')}.`;
    if (message.stop_reason === 'max_tokens') {
      errorMsg += ' The response was cut off due to length limits. Try with a shorter document.';
    } else if (responseText.length < 500) {
      errorMsg += ' The AI response was unexpectedly short. Please try again.';
    } else {
      errorMsg += ' Please try again or use a shorter document.';
    }

    throw new Error(errorMsg);
  }

  const notesMarkdown = notesMatch[1].trim();
  const qcmJsonString = qcmMatch[1].trim();
  const visualPrompt = visualMatch[1].trim();

  let qcmJson: QCMData;
  try {
    qcmJson = JSON.parse(qcmJsonString);
  } catch (error) {
    throw new Error('Failed to parse QCM JSON: ' + error);
  }

  return {
    notesMarkdown,
    qcmJson,
    visualPrompt,
  };
}

export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    const anthropic = new Anthropic({ apiKey });
    await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }],
    });
    return true;
  } catch (error) {
    return false;
  }
}
