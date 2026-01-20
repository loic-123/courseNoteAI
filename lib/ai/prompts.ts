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
[Generate a prompt for an AI image generator (FLUX). The prompt must be a DIRECT DESCRIPTION of the final image, NOT instructions to create it.

CRITICAL RULES FOR THE PROMPT:
1. START with the main subject and style: "Educational infographic poster about [TOPIC]"
2. DESCRIBE what is VISIBLE in the image, not what to do
3. Use descriptive adjectives: "clean", "modern", "minimalist", "professional"
4. Mention specific visual elements: "flowchart", "diagram", "icons", "color-coded sections"
5. Include color palette: "blue and white color scheme", "teal accents"
6. Add quality keywords: "high quality", "sharp text", "professional design", "vector style"
7. Keep it under 200 words - FLUX works better with concise prompts
8. NO instructions like "create", "use", "make" - only descriptions

GOOD EXAMPLE:
"Educational infographic poster about machine learning algorithms, clean modern design, white background with blue and teal accents. Large title at top. Left section showing decision tree diagram with branching nodes. Center area featuring neural network illustration with connected layers. Right column with key definitions in rounded boxes. Bottom summary panel with main takeaways. Minimalist icons, professional typography, vector style illustration, high quality render, sharp readable text"

BAD EXAMPLE (DO NOT DO THIS):
"Create a poster about ML. Use blue colors. Add a diagram. Make it educational."

Generate a prompt following the GOOD example format for the course content above.]
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
