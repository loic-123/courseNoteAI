import Anthropic from '@anthropic-ai/sdk';
import { buildNotesGenerationPrompt } from './prompts';
import { TechnicalLevel, Length, QCMData } from '@/types';

export interface ClaudeGenerationResult {
  notesMarkdown: string;
  qcmJson: QCMData;
  visualPrompt: string;
}

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

  const prompt = buildNotesGenerationPrompt(
    extractedText,
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

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse the three sections
  const notesMatch = responseText.match(/---NOTES_START---([\s\S]*?)---NOTES_END---/);
  const qcmMatch = responseText.match(/---QCM_START---([\s\S]*?)---QCM_END---/);
  const visualMatch = responseText.match(/---VISUAL_PROMPT_START---([\s\S]*?)---VISUAL_PROMPT_END---/);

  if (!notesMatch || !qcmMatch || !visualMatch) {
    console.error('Failed to parse sections. Response preview:', responseText.substring(0, 500));
    console.error('notesMatch:', !!notesMatch, 'qcmMatch:', !!qcmMatch, 'visualMatch:', !!visualMatch);
    throw new Error(`Failed to parse Claude response. Missing sections: ${!notesMatch ? 'NOTES ' : ''}${!qcmMatch ? 'QCM ' : ''}${!visualMatch ? 'VISUAL' : ''}`);
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
