import { NextRequest, NextResponse } from 'next/server';
import { parseFile } from '@/lib/parsers/file-parser';
import { generateWithClaude } from '@/lib/ai/claude';
import { generateVisualWithReplicate } from '@/lib/ai/replicate';
import { supabase } from '@/lib/supabase/client';
import { uploadImageToStorage, generateVisualFileName } from '@/lib/supabase/storage';
import { TechnicalLevel, Length } from '@/types';

export const maxDuration = 300; // 5 minutes for generation

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract all parameters
    const files = formData.getAll('file') as File[];
    const userApiKey = formData.get('claudeApiKey') as string | null;
    const useServerKey = formData.get('useServerKey') === 'true';
    const institutionId = formData.get('institutionId') as string;
    const courseId = formData.get('courseId') as string | null;
    const courseCode = formData.get('courseCode') as string | null;
    const courseName = formData.get('courseName') as string | null;
    const moduleId = formData.get('moduleId') as string | null;
    const moduleName = formData.get('moduleName') as string | null;
    const creatorName = formData.get('creatorName') as string;
    const title = formData.get('title') as string;
    const detailLevel = parseInt(formData.get('detailLevel') as string);
    const useMetaphors = formData.get('useMetaphors') === 'true';
    const technicalLevel = formData.get('technicalLevel') as TechnicalLevel;
    const length = formData.get('length') as Length;
    const language = formData.get('language') as 'en' | 'fr';
    const customPrompt = formData.get('customPrompt') as string | null;

    // Determine which API key to use
    let claudeApiKey: string;
    if (useServerKey) {
      // Use server's API key (paid users)
      const serverKey = process.env.ANTHROPIC_API_KEY;
      if (!serverKey) {
        return NextResponse.json(
          { error: 'Server API key not configured' },
          { status: 500 }
        );
      }
      claudeApiKey = serverKey;
    } else {
      // Use user's own API key (free)
      if (!userApiKey) {
        return NextResponse.json(
          { error: 'API key is required' },
          { status: 400 }
        );
      }
      claudeApiKey = userApiKey;
    }

    // Validate required fields
    if (!files || files.length === 0 || !institutionId || !creatorName || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Parse all files and combine text
    console.log(`Parsing ${files.length} file(s)...`);
    const textParts: string[] = [];

    for (const file of files) {
      try {
        const text = await parseFile(file);
        textParts.push(`\n\n--- Content from ${file.name} ---\n\n${text}`);
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error);
        return NextResponse.json(
          { error: `Failed to parse file: ${file.name}` },
          { status: 400 }
        );
      }
    }

    const extractedText = textParts.join('\n\n');

    if (!extractedText || extractedText.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract meaningful text from file' },
        { status: 400 }
      );
    }

    // Step 2: Create or get course
    let finalCourseId = courseId;
    if (!finalCourseId && courseCode && courseName) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingCourse } = await (supabase as any)
        .from('courses')
        .select('id')
        .eq('institution_id', institutionId)
        .eq('code', courseCode)
        .single();

      if (existingCourse) {
        finalCourseId = existingCourse.id;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newCourse, error } = await (supabase as any)
          .from('courses')
          .insert({
            institution_id: institutionId,
            code: courseCode,
            name: courseName,
          })
          .select('id')
          .single();

        if (error) {
          return NextResponse.json(
            { error: 'Failed to create course: ' + error.message },
            { status: 500 }
          );
        }
        finalCourseId = newCourse.id;
      }
    }

    if (!finalCourseId) {
      return NextResponse.json(
        { error: 'Course ID is required or provide course details to create one' },
        { status: 400 }
      );
    }

    // Step 3: Create module if provided
    let finalModuleId = moduleId;
    if (!finalModuleId && moduleName) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newModule, error } = await (supabase as any)
        .from('modules')
        .insert({
          course_id: finalCourseId,
          name: moduleName,
          order_index: 0,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to create module:', error);
      } else {
        finalModuleId = newModule.id;
      }
    }

    // Step 4: Generate with Claude
    console.log('Generating with Claude...');
    const claudeResult = await generateWithClaude(
      claudeApiKey,
      extractedText,
      detailLevel,
      useMetaphors,
      technicalLevel,
      length,
      language,
      customPrompt || undefined
    );

    // Step 5: Generate visual with Replicate and upload to Supabase Storage
    console.log('Generating visual...');
    let visualUrl: string | null = null;
    try {
      const replicateToken = process.env.REPLICATE_API_TOKEN;
      if (replicateToken) {
        // Generate image with Replicate
        const replicateUrl = await generateVisualWithReplicate(
          claudeResult.visualPrompt,
          replicateToken
        );

        if (replicateUrl) {
          // Upload to Supabase Storage for permanent storage
          console.log('Uploading visual to Supabase Storage...');
          const fileName = generateVisualFileName(title);
          const permanentUrl = await uploadImageToStorage(replicateUrl, fileName);

          if (permanentUrl) {
            visualUrl = permanentUrl;
            console.log('Visual stored permanently:', visualUrl);
          } else {
            // Fallback to Replicate URL if upload fails
            console.warn('Failed to upload to storage, using Replicate URL');
            visualUrl = replicateUrl;
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate visual:', error);
      // Continue without visual
    }

    // Step 6: Store in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: note, error: insertError } = await (supabase as any)
      .from('notes')
      .insert({
        course_id: finalCourseId,
        module_id: finalModuleId,
        creator_name: creatorName,
        title,
        language,
        notes_markdown: claudeResult.notesMarkdown,
        qcm_json: claudeResult.qcmJson,
        visual_prompt: claudeResult.visualPrompt,
        visual_image_url: visualUrl,
      })
      .select('id')
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to store note: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      noteId: note.id,
      notesMarkdown: claudeResult.notesMarkdown,
      qcmJson: claudeResult.qcmJson,
      visualUrl,
    });
  } catch (error: unknown) {
    console.error('Generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
