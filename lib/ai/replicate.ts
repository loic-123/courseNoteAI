import Replicate from 'replicate';

export async function generateVisualWithReplicate(
  prompt: string,
  replicateApiToken: string
): Promise<string> {
  const replicate = new Replicate({ auth: replicateApiToken });

  console.log('Starting Replicate visual generation with Ideogram v3...');
  console.log('Prompt length:', prompt.length);

  try {
    const output = await replicate.run(
      'ideogram-ai/ideogram-v3-balanced',
      {
        input: {
          prompt: prompt,
          aspect_ratio: '3:4',
          style_type: 'Design',
          magic_prompt_option: 'Off',
        },
      }
    );

    console.log('Replicate output type:', typeof output);
    console.log('Replicate output:', JSON.stringify(output, null, 2).substring(0, 500));

    // Helper function to extract URL from various formats
    const extractUrl = (item: unknown): string | null => {
      if (!item) return null;

      // Direct string URL
      if (typeof item === 'string' && item.startsWith('http')) {
        return item;
      }

      // Object with url property
      if (typeof item === 'object') {
        const obj = item as Record<string, unknown>;

        // Try url property
        if (typeof obj.url === 'string' && obj.url.startsWith('http')) {
          return obj.url;
        }

        // Try href property
        if (typeof obj.href === 'string' && obj.href.startsWith('http')) {
          return obj.href;
        }

        // Try toString() - FileOutput objects convert to URL
        const str = String(item);
        if (str.startsWith('http')) {
          return str;
        }
      }

      return null;
    };

    // Try direct output
    let url = extractUrl(output);
    if (url) {
      console.log('SUCCESS: Extracted URL directly:', url);
      return url;
    }

    // Try array of outputs
    if (Array.isArray(output) && output.length > 0) {
      url = extractUrl(output[0]);
      if (url) {
        console.log('SUCCESS: Extracted URL from array[0]:', url);
        return url;
      }
    }

    // Try data array (some APIs return { data: [...] })
    if (output && typeof output === 'object' && !Array.isArray(output)) {
      const obj = output as Record<string, unknown>;

      if (Array.isArray(obj.data) && obj.data.length > 0) {
        url = extractUrl(obj.data[0]);
        if (url) {
          console.log('SUCCESS: Extracted URL from data[0]:', url);
          return url;
        }
      }

      // Try images array
      if (Array.isArray(obj.images) && obj.images.length > 0) {
        url = extractUrl(obj.images[0]);
        if (url) {
          console.log('SUCCESS: Extracted URL from images[0]:', url);
          return url;
        }
      }

      // Try output property
      if (obj.output) {
        url = extractUrl(obj.output);
        if (url) {
          console.log('SUCCESS: Extracted URL from output property:', url);
          return url;
        }

        if (Array.isArray(obj.output) && obj.output.length > 0) {
          url = extractUrl(obj.output[0]);
          if (url) {
            console.log('SUCCESS: Extracted URL from output[0]:', url);
            return url;
          }
        }
      }
    }

    console.error('Could not extract URL from Replicate output');
    console.error('Full output:', JSON.stringify(output, null, 2));
    throw new Error('Could not extract image URL from Replicate response');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Replicate API error:', errorMessage);
    throw new Error(`Failed to generate visual: ${errorMessage}`);
  }
}
