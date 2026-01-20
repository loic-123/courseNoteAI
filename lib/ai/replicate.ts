import Replicate from 'replicate';

export async function generateVisualWithReplicate(
  prompt: string,
  replicateApiToken: string
): Promise<string> {
  const replicate = new Replicate({ auth: replicateApiToken });

  console.log('Starting Replicate visual generation...');
  console.log('Prompt length:', prompt.length);

  try {
    // Use Ideogram v3 for superior text rendering and infographic quality
    // Ideogram is specifically designed for accurate text in images
    const output = await replicate.run(
      'ideogram-ai/ideogram-v3-balanced',
      {
        input: {
          prompt: prompt,
          aspect_ratio: '3:4',
          style_type: 'design',
          magic_prompt_option: 'on',
          negative_prompt: 'blurry, low quality, distorted text, misspelled words, illegible, pixelated',
        },
      }
    );

    console.log('Replicate output type:', typeof output);
    console.log('Replicate output is array:', Array.isArray(output));

    // Debug: log all properties of output
    if (output && typeof output === 'object') {
      console.log('Output keys:', Object.keys(output));
      console.log('Output prototype:', Object.getPrototypeOf(output)?.constructor?.name);
    }

    // FLUX returns an array of FileOutput objects
    if (Array.isArray(output) && output.length > 0) {
      const firstItem = output[0];
      console.log('First item type:', typeof firstItem);
      console.log('First item constructor:', firstItem?.constructor?.name);

      // Try toString first - FileOutput objects convert to URL string
      const urlString = String(firstItem);
      console.log('First item as string:', urlString.substring(0, 200));

      if (urlString.startsWith('http')) {
        console.log('SUCCESS: Got URL from String(FileOutput):', urlString);
        return urlString;
      }

      // Check if it has a url method (FileOutput)
      if (firstItem && typeof firstItem === 'object') {
        const fileObj = firstItem as Record<string, unknown>;

        console.log('FileObj properties:', Object.keys(fileObj));
        console.log('FileObj.url type:', typeof fileObj.url);

        // Try calling url() if it's a function
        if (typeof fileObj.url === 'function') {
          try {
            const urlResult = await fileObj.url();
            console.log('SUCCESS: URL from url() method:', urlResult);
            return urlResult;
          } catch (e) {
            console.log('url() method failed:', e);
          }
        }

        // Try getting url as property
        if (typeof fileObj.url === 'string') {
          console.log('SUCCESS: URL from url property:', fileObj.url);
          return fileObj.url;
        }

        // Try href property
        if (typeof fileObj.href === 'string') {
          console.log('SUCCESS: URL from href property:', fileObj.href);
          return fileObj.href;
        }

        // Check for Symbol.toStringTag or other hidden properties
        const symbols = Object.getOwnPropertySymbols(fileObj);
        console.log('FileObj symbols:', symbols.length);

        // Try using for...in to find enumerable properties
        for (const key in fileObj) {
          console.log(`FileObj[${key}]:`, typeof fileObj[key], fileObj[key]);
        }
      }

      // If firstItem is directly a string URL
      if (typeof firstItem === 'string' && firstItem.startsWith('http')) {
        console.log('SUCCESS: Direct string URL:', firstItem);
        return firstItem;
      }
    }

    // If output is directly a string URL
    if (typeof output === 'string' && (output as string).startsWith('http')) {
      console.log('SUCCESS: Output is direct string URL:', output);
      return output;
    }

    // Last resort: check if output has url property
    if (output && typeof output === 'object' && !Array.isArray(output)) {
      const obj = output as Record<string, unknown>;
      console.log('Non-array object keys:', Object.keys(obj));
      if (obj.url) {
        const url = typeof obj.url === 'function' ? await obj.url() : obj.url;
        console.log('SUCCESS: URL from output object:', url);
        return url as string;
      }
    }

    console.error('Could not extract URL from output');
    console.error('Output raw:', output);
    console.error('Output JSON:', JSON.stringify(output, (_key, value) => {
      if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
      return value;
    }, 2));
    throw new Error('Could not extract image URL from Replicate response');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Replicate API error:', errorMessage);
    throw new Error(`Failed to generate visual: ${errorMessage}`);
  }
}
