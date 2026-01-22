import { TechnicalLevel, Length } from '@/types';

export function buildNotesGenerationPrompt(
  extractedText: string,
  detailLevel: number,
  useMetaphors: boolean,
  technicalLevel: TechnicalLevel,
  length: Length,
  language: 'en' | 'fr',
  customPrompt?: string
): string {
  const lengthGuide = {
    short: 'Brief and concise (~3-5 key sections)',
    medium: 'Comprehensive coverage (~5-8 sections)',
    long: 'Detailed and exhaustive (~8-12 sections)',
  };

  const levelGuide = {
    beginner: 'Explain concepts from scratch, use simple language, avoid jargon',
    intermediate: 'Assume basic knowledge, explain advanced concepts clearly',
    advanced: 'Use technical terminology, dive deep into complex topics',
  };

  return `You are an expert educational content generator. Your task is to create comprehensive study materials from the provided course content.

**Input Content:**
${extractedText}

**Generation Parameters:**
- Detail Level: ${detailLevel}/10 (${detailLevel >= 8 ? 'very detailed' : detailLevel >= 5 ? 'moderate detail' : 'concise'})
- Use Metaphors: ${useMetaphors ? 'Yes - include creative analogies to explain concepts' : 'No'}
- Technical Level: ${technicalLevel} (${levelGuide[technicalLevel]})
- Target Length: ${lengthGuide[length]}
- Language: ${language === 'en' ? 'English' : 'French'}
${customPrompt ? `\n**Custom Instructions from User:**\n${customPrompt}` : ''}

**Your task is to generate THREE outputs in the following EXACT format:**

---NOTES_START---
[Generate comprehensive markdown notes here with:
- Clear hierarchical structure (# ## ### headers)
- Detailed explanations at the specified detail level
- ${useMetaphors ? 'Creative metaphors and analogies to clarify concepts' : 'Direct explanations'}
- Code examples where relevant
- LaTeX math notation using $...$ for inline and $$...$$ for blocks
- Key concepts highlighted
- Summaries at the end of each major section]
---NOTES_END---

---QCM_START---
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 2,
      "explanation": "Detailed 2-3 line explanation of why this is correct and others are wrong",
      "difficulty": "medium",
      "topic": "Topic name"
    }
    // Generate 10-15 questions total, mix of easy (30%), medium (50%), hard (20%)
  ],
  "metadata": {
    "total_questions": 15,
    "estimated_time_minutes": 10,
    "passing_score_percentage": 60
  }
}
---QCM_END---

---VISUAL_PROMPT_START---
[Generate a prompt for AI image generation to create an EDUCATIONAL STUDY SHEET / CHEAT SHEET poster.

YOUR TASK:
1. Extract the 4-6 MOST IMPORTANT concepts/terms from the course content
2. Create a prompt that describes a clean study poster with these exact terms

PROMPT FORMAT (follow this structure exactly):
"Educational study sheet poster about [TOPIC]. A3 LANDSCAPE FORMAT (horizontal orientation, wide aspect ratio 297x420mm). Clean modern design with dark blue gradient background.

Title at top: '[MAIN TOPIC TITLE]'

Key concepts displayed in white rounded boxes arranged horizontally across the wide format:
- '[CONCEPT 1]' with brief definition
- '[CONCEPT 2]' with brief definition
- '[CONCEPT 3]' with brief definition
- '[CONCEPT 4]' with brief definition

Include simple icons next to each concept. Professional typography, minimalist style, high contrast, easy to read text. Wide landscape layout optimized for A3 horizontal printing."

RULES:
- MUST specify A3 LANDSCAPE FORMAT (horizontal/wide) in the prompt
- Use SHORT words/phrases (2-4 words max per concept)
- Maximum 6 concepts total
- Keep all text in the same language as the course
- Style: clean, modern, educational poster design, wide horizontal layout
- Colors: dark background with light text for readability]
---VISUAL_PROMPT_END---

CRITICAL REQUIREMENTS:
- Write ALL content in ${language === 'en' ? 'English' : 'French'}
- You MUST include ALL THREE SECTIONS with their EXACT delimiters
- ALL sections are REQUIRED: NOTES, QCM, and VISUAL_PROMPT
- Ensure QCM JSON is valid
- Keep notes focused and well-structured
- If you need to cut content, prioritize completing all three sections over adding more detail

REMINDER: End your response with ---VISUAL_PROMPT_END--- to ensure all sections are complete!`;
}

export function validateApiKey(apiKey: string): boolean {
  return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
}
