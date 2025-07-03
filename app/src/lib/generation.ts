'use server';

import { z } from 'zod';
import { GenerationConfig, GenerationResult } from './models';

// Initialize model providers based on environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

/**
 * Sleep for a specified number of milliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get HuggingFace read token from environment
const huggingFaceToken = process.env.HUGGING_FACE_READ_TOKEN;

/**
 * Get rows from a dataset
 */
export async function getDatasetRows(
  datasetPath: string,
  config: string,
  split: string,
  offset: number,
  length: number
): Promise<any[]> {
  console.log(`[Dataset Fetch] Starting fetch for ${datasetPath}, config: ${config}, split: ${split}, offset: ${offset}, length: ${length}`);
  
  const url = `https://datasets-server.huggingface.co/rows?dataset=${datasetPath}&config=${config}&split=${split}&offset=${offset}&length=${length}`;
  
  console.log(`[Dataset Fetch] Fetching rows from ${url}`);
  // Get the HuggingFace read token from environment variables
  const hfToken = process.env.HUGGING_FACE_READ_TOKEN;
  if (hfToken) {
    console.log(`[Dataset Fetch] Using HuggingFace authentication token`);
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if token is available
  if (hfToken) {
    headers['Authorization'] = `Bearer ${hfToken}`;
  }
  
  const maxRetries = 5;
  let retryCount = 0;
  let lastError: Error | null = null;
  
  while (retryCount < maxRetries) {
    try {
      retryCount++;
      console.log(`[Dataset Fetch] Attempt ${retryCount}/${maxRetries}`);
      
      const response = await fetch(url, { headers });
      console.log(`[Dataset Fetch] Response status: ${response.status} ${response.statusText}`);
      
      if (response.status === 429) {
        // Rate limited, implement exponential backoff
        const backoffTime = Math.pow(2, retryCount - 1) * 1000; // 1s, 2s, 4s, 8s, 16s
        console.log(`[Dataset Fetch] Rate limited by HuggingFace API. Retrying after ${backoffTime}ms (Attempt ${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[Dataset Fetch] Success! Retrieved ${data.rows.length} rows`);
      
      // If we've successfully fetched rows but we're at a high offset and getting rate limited,
      // let's return what we have rather than failing completely
      if (offset > 0 && retryCount > 1) {
        console.log(`[Dataset Fetch] Successfully retrieved rows after retries at offset ${offset}`);
      }
      
      // Check for 'transcript' field if the specified input feature is missing
      const rowsWithTranscript = data.rows.map((row: any) => {
        if (!row.transcript) {
          row.transcript = '';
        }
        return row;
      });
      
      return rowsWithTranscript;
    } catch (error) {
      lastError = error as Error;
      if (retryCount >= maxRetries) {
        // If we're at a high offset and getting errors, we might have enough data already
        // Instead of failing completely, we'll return an empty array to signal end of data
        if (offset > 100) {
          console.log(`[Dataset Fetch] Reached rate limit at high offset (${offset}). Treating as end of available data.`);
          return [];
        }
        break;
      }
      
      // For non-rate-limit errors, also implement backoff
      const backoffTime = Math.pow(2, retryCount - 1) * 1000;
      console.log(`[Dataset Fetch] Error: ${(error as Error).message}. Retrying after ${backoffTime}ms (Attempt ${retryCount}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  
  // If we've exhausted all retries
  throw lastError || new Error('Failed to fetch dataset rows after multiple retries');
}

/**
 * Generate content using OpenAI API
 */
async function generateWithOpenAI(
  modelId: string,
  prompt: string,
  maxTokens: number,
  temperature: number,
  jsonSchema?: any
): Promise<GenerationResult> {
  if (!openaiApiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${openaiApiKey}`
  };

  let body: any = {
    modelId: modelId,
    model: modelId,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens
  };

  if (jsonSchema) {
    // Add function calling for structured output
    body.functions = [{
      name: 'generate_structured_output',
      parameters: jsonSchema
    }];
    body.function_call = { name: 'generate_structured_output' };
  }

  let providerApiUrl = 'https://api.openai.com/v1/chat/completions';
  let providerApiKey = process.env.OPENAI_API_KEY;

  if (modelId.startsWith('claude-')) {
    // Anthropic models - this part of the code is simplified and might need adjustment based on actual Anthropic API structure
    providerApiUrl = 'https://api.anthropic.com/v1/messages'; // Example URL, adjust if needed
    providerApiKey = process.env.ANTHROPIC_API_KEY;
    console.log(`[Generation] Routing to Anthropic for model: ${modelId}`);
  } else if (modelId.startsWith('gemini-')) {
    // Google Gemini models
    // Note: The Gemini API has a different request/response structure.
    // This is a simplified implementation.
    providerApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    console.log(`[Generation] Routing to Google Gemini for model: ${modelId}`);
    // For Gemini, the API key is in the URL, and the body is different.
    // We will handle this in the fetch call.
    providerApiKey = 'dummy-key'; // Set a dummy key to pass the check, real key is in URL
    body = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };
    headers = { 'Content-Type': 'application/json' }; // Reset headers for Gemini
  } else if (modelId.startsWith('Infermatic/')) {
    // Infermatic models (now deprecated, but keeping for reference)
    providerApiUrl = 'https://api.infermatic.ai/v1/chat/completions';
    providerApiKey = process.env.INFERMATIC_API_KEY;
    console.log(`[Generation] Routing to Infermatic for model: ${modelId}`);
  } else {
    console.log(`[Generation] Routing to OpenAI for model: ${modelId}`);
  }

  if (!providerApiKey) {
    throw new Error(`API key for model ${modelId} is not configured.`);
  }

  headers['Authorization'] = `Bearer ${providerApiKey}`;

  const response = await fetch(providerApiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error for model ${modelId}: ${errorText}`);
  }

  const data = await response.json();

  let output;
  if (modelId.startsWith('gemini-')) {
    // Extraction for Gemini
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      output = data.candidates[0].content.parts[0].text;
    } else {
      output = 'Error: No content found in Gemini response';
    }
  } else if (modelId.startsWith('claude-')) {
    // Simplified extraction for Anthropic
    output = data.content[0]?.text;
  } else if (jsonSchema && data.choices[0]?.message?.function_call) {
    try {
      output = JSON.parse(data.choices[0].message.function_call.arguments);
    } catch (e) {
      output = data.choices[0].message.function_call.arguments;
    }
  } else {
    output = data.choices[0]?.message?.content;
  }

  return {
    input: prompt,
    output,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    }
  };
}

/**
 * Generate content using Atoma API - will not using atoma
 */
// async function generateWithAtoma(
//   modelId: string,
//   prompt: string,
//   maxTokens: number,
//   jsonSchema?: any
// ): Promise<GenerationResult> {
//   if (!atomaApiKey) {
//     throw new Error('Atoma API key is not configured');
//   }

//   const headers = {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${atomaApiKey}`
//   };

//   let body: any = {
//     model: modelId,
//     messages: [{ role: 'user', content: prompt }],
//     max_tokens: maxTokens
//   };

//   if (jsonSchema) {
//     // Add function calling for structured output
//     body.functions = [{
//       name: 'generate_structured_output',
//       parameters: jsonSchema
//     }];
//     body.function_call = { name: 'generate_structured_output' };
//   }

//   const response = await fetch('https://api.atoma.network/v1/chat/completions', {
//     method: 'POST',
//     headers,
//     body: JSON.stringify(body)
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`Atoma API error: ${errorText}`);
//   }

//   const data = await response.json();
  
//   let output;
//   if (jsonSchema && data.choices[0]?.message?.function_call) {
//     try {
//       output = JSON.parse(data.choices[0].message.function_call.arguments);
//     } catch (e) {
//       output = data.choices[0].message.function_call.arguments;
//     }
//   } else {
//     output = data.choices[0]?.message?.content;
//   }

//   // Atoma provides signature and response hash for verification
//   return {
//     input: prompt,
//     output,
//     usage: {
//       promptTokens: data.usage.prompt_tokens,
//       completionTokens: data.usage.completion_tokens,
//       totalTokens: data.usage.total_tokens
//     },
//     signature: data.signature,
//     responseHash: data.response_hash
//   };
// }

/**
 * Generate content using Anthropic API
 */
async function generateWithAnthropic(
  modelId: string,
  prompt: string,
  maxTokens: number,
  jsonSchema?: any
): Promise<GenerationResult> {
  if (!anthropicApiKey) {
    throw new Error('Anthropic API key is not configured');
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': anthropicApiKey,
    'anthropic-version': '2023-06-01'
  };

  let body: any = {
    model: modelId,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }]
  };

  if (jsonSchema) {
    body.system = "Please provide your response as a valid JSON object matching the specified schema.";
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${errorText}`);
  }

  const data = await response.json();
  
  let output = data.content[0]?.text;
  
  // If JSON schema was requested, try to parse the output as JSON
  if (jsonSchema && output) {
    try {
      // Extract JSON from the response if it's wrapped in markdown code blocks
      const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : output;
      output = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse JSON from Anthropic response:', e);
    }
  }

  return {
    input: prompt,
    output,
    usage: {
      promptTokens: data.usage?.input_tokens || 0,
      completionTokens: data.usage?.output_tokens || 0,
      totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
    }
  };
}

/**
 * Generate a single row of synthetic data
 */
export async function generateRow(
  input: string,
  config: GenerationConfig
): Promise<GenerationResult> {
  console.log(`[Generation] Generating row with input: ${input.substring(0, 50)}${input.length > 50 ? '...' : ''}`);
  console.log(`[Generation] Using model: ${config.model}, max tokens: ${config.maxTokens}`);
  
  const prompt = config.prompt.replace('{input}', input);
  const modelId = config.model;
  const maxTokens = config.maxTokens;
  
  // Convert zod schema to JSON schema if provided
  let jsonSchema;
  if (config.jsonSchema) {
    console.log('[Generation] Using JSON schema for structured output');
    // This is a simplified approach - in a real implementation,
    // you would need to convert the Zod schema to a JSON schema
    jsonSchema = {
      type: 'object',
      properties: {}
      // Add properties based on the Zod schema
    };
  }
  
  try {
    // Route generation request to the appropriate provider via generateWithOpenAI
    console.log(`[Generation] Generating row with model: ${modelId}`);
    const result = await generateWithOpenAI(modelId, prompt, maxTokens, config.temperature, jsonSchema);
    console.log(`[Generation] Successfully generated output, tokens used: ${result.usage.totalTokens}`);
    return result;
  } catch (error) {
    console.error(`[Generation] Error generating with OpenAI: ${(error as Error).message}`);
    throw error;
  }
}

/**
 * Generate a synthetic dataset
 */
export async function generateSyntheticDataset(
  datasetPath: string,
  config: string,
  split: string,
  generationConfig: GenerationConfig
): Promise<{ results: GenerationResult[], progress: number }> {
  console.log('==================================================');
  console.log(`[Dataset Generation] Starting synthetic dataset generation`);
  console.log(`[Dataset Generation] Dataset path: ${datasetPath}`);
  console.log(`[Dataset Generation] Config: ${config}, Split: ${split}`);
  console.log(`[Dataset Generation] Model: ${generationConfig.model}`);
  console.log(`[Dataset Generation] Input feature: ${generationConfig.inputFeature}`);
  console.log(`[Dataset Generation] Max tokens: ${generationConfig.maxTokens}`);
  console.log('==================================================');
  
  const startTime = Date.now();
  const results: GenerationResult[] = [];
  let totalTokensUsed = 0;
  const maxTokens = generationConfig.maxTokens;
  
  let offset = 0;
  const batchSize = 10;
  let batchCount = 0;
  let fetchFailed = false;
  
  // Continue until we've used all tokens or can't fetch more rows
  while (totalTokensUsed < maxTokens && !fetchFailed) {
    batchCount++;
    console.log(`[Dataset Generation] Processing batch #${batchCount}, offset: ${offset}`);
    
    // Fetch a batch of rows
    console.log(`[Dataset Generation] Fetching ${batchSize} rows from dataset`);
    let rows: any[] = [];
    
    try {
      rows = await getDatasetRows(datasetPath, config, split, offset, batchSize);
      offset += batchSize;
      
      console.log(`[Dataset Generation] Retrieved ${rows.length} rows`);
      if (rows.length === 0) {
        console.log(`[Dataset Generation] No more rows available, ending generation`);
        break;
      }
    } catch (error) {
      console.error(`[Dataset Generation] Error fetching rows: ${(error as Error).message}`);
      console.log(`[Dataset Generation] Will continue with ${results.length} samples already fetched`);
      fetchFailed = true;
      
      // If we haven't generated any results yet, we need to re-throw the error
      if (results.length === 0) {
        throw new Error(`Failed to fetch any dataset rows: ${(error as Error).message}`);
      }
      
      // Otherwise, we'll continue with the results we have
      break;
    }
    
    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const fullRow = rows[i];
      const rowData = fullRow.row; // The actual data is in the 'row' property
      
      console.log(`[Dataset Generation] Processing row ${i + 1}/${rows.length} in batch #${batchCount}`);

      if (!rowData) {
        console.log(`[Dataset Generation] Skipping row ${i + 1} because it's missing the 'row' property.`);
        continue;
      }
      
      if (totalTokensUsed >= maxTokens) {
        console.log(`[Dataset Generation] Reached max token limit (${maxTokens}), stopping generation`);
        break;
      }
      
      try {
        // 1. Try to get the specified input feature from the nested 'row' object
        let input = rowData[generationConfig.inputFeature];

        // 2. If not found, try the 'transcript' field from the top-level object
        if (!input) {
          console.log(`[Dataset Generation] Input feature '${generationConfig.inputFeature}' not found in nested 'row' object. Trying 'transcript' from top-level.`);
          input = fullRow['transcript'];
        }

        // 3. If still not found, search for the first available string in the nested 'row' object
        if (!input) {
          console.log(`[Dataset Generation] Fallback 'transcript' is also missing or empty. Searching for any available text field in the nested 'row' object.`);
          for (const key in rowData) {
            if (typeof rowData[key] === 'string' && rowData[key].trim().length > 0) {
              console.log(`[Dataset Generation] Found text in nested field '${key}'. Using it as input.`);
              input = rowData[key];
              break;
            }
          }
        }

        if (!input) {
          console.log(`[Dataset Generation] Skipping row, because no usable text field could be found.`);
          continue;
        }
        
        // Generate synthetic data for this row
        console.log(`[Dataset Generation] Generating synthetic data for row...`);
        const result = await generateRow(input, generationConfig);
        results.push(result);
        
        // Update token usage
        totalTokensUsed += result.usage.totalTokens;
        const currentProgress = Math.min(100, Math.round((totalTokensUsed / maxTokens) * 100));
        
        console.log(`[Dataset Generation] Row complete, tokens used: ${result.usage.totalTokens}`);
        console.log(`[Dataset Generation] Total tokens used: ${totalTokensUsed}/${maxTokens} (${currentProgress}%)`);
      } catch (error) {
        console.error(`[Dataset Generation] Error generating row: ${(error as Error).message}`);
      }
    }
  }
  
  // If we have no results after processing all available rows, throw an error
  if (results.length === 0) {
    throw new Error(`Failed to generate any samples. Check if the input feature '${generationConfig.inputFeature}' exists in the dataset.`);
  }
  
  // Calculate final progress
  const progress = Math.min(100, Math.round((totalTokensUsed / maxTokens) * 100));
  const elapsedTime = (Date.now() - startTime) / 1000;
  
  console.log('==================================================');
  console.log(`[Dataset Generation] Generation complete!`);
  console.log(`[Dataset Generation] Generated ${results.length} samples`);
  console.log(`[Dataset Generation] Total tokens used: ${totalTokensUsed}/${maxTokens} (${progress}%)`);
  console.log(`[Dataset Generation] Time taken: ${elapsedTime.toFixed(2)} seconds`);
  console.log('==================================================');
  
  return { results, progress };
}
