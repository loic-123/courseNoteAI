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

**Your task is to generate THREE outputs in the following EXACT format and order:**

IMPORTANT: Generate sections in THIS EXACT ORDER to ensure completion:
1. VISUAL_PROMPT (shortest - do this first)
2. QCM (quiz questions)
3. NOTES (longest - do this last)

---VISUAL_PROMPT_START---
[Generate a SHORT prompt (max 200 words) for AI image generation to create an EDUCATIONAL STUDY SHEET poster.
Extract 4-6 key concepts from the content and create a poster prompt like:
"Educational study sheet poster about [TOPIC]. A3 LANDSCAPE FORMAT. Dark blue gradient background.
Title: '[TOPIC]'. Key concepts in white rounded boxes: '[CONCEPT 1]', '[CONCEPT 2]', '[CONCEPT 3]', '[CONCEPT 4]'.
Simple icons, professional typography, minimalist style, high contrast."]
---VISUAL_PROMPT_END---

---QCM_START---
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 2,
      "explanation": "Brief explanation of why this is correct",
      "difficulty": "medium",
      "topic": "Topic name"
    }
  ],
  "metadata": {
    "total_questions": 10,
    "estimated_time_minutes": 8,
    "passing_score_percentage": 60
  }
}
Generate 8-12 questions total, mix of easy (30%), medium (50%), hard (20%).
---QCM_END---

---NOTES_START---
[Generate comprehensive markdown notes with:
- Clear hierarchical structure (# ## ### headers)
- Explanations at detail level ${detailLevel}/10
- ${useMetaphors ? 'Creative metaphors and analogies' : 'Direct explanations'}
- Code examples where relevant
- LaTeX math: $inline$ and $$blocks$$
- Key concepts highlighted]
---NOTES_END---

CRITICAL REQUIREMENTS:
- Language: ${language === 'en' ? 'English' : 'French'}
- You MUST include ALL THREE SECTIONS with EXACT delimiters
- Generate in order: VISUAL_PROMPT → QCM → NOTES
- Keep VISUAL_PROMPT under 200 words
- If running low on space, keep notes concise but ALWAYS complete all 3 sections`;
}

export function validateApiKey(apiKey: string): boolean {
  return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
}
