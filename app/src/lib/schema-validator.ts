import Ajv from "ajv";
import addFormats from "ajv-formats";

// Create Ajv instance with options
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  $data: true,
});

// Add string formats like date, email, etc.
addFormats(ajv as any);

/**
 * Validates data against a JSON schema
 * @param schema The JSON schema to validate against
 * @param data The data to validate
 * @returns Validation result with errors if any
 */
export function validateAgainstSchema(schema: any, data: any) {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    
    return {
      valid,
      errors: validate.errors || [],
    };
  } catch (error) {
    console.error("Schema validation error:", error);
    return {
      valid: false,
      errors: [{ message: `Schema validation error: ${error instanceof Error ? error.message : String(error)}` }],
    };
  }
}

/**
 * Formats validation errors into a more readable format
 * @param errors Array of validation errors from AJV
 * @returns Formatted error messages
 */
export function formatValidationErrors(errors: any[]) {
  if (!errors || errors.length === 0) return [];
  
  return errors.map(error => {
    const { instancePath, keyword, message, params } = error;
    const path = instancePath ? instancePath.replace(/^\//, "") : "root";
    
    switch (keyword) {
      case "required":
        return `Missing required property: ${params.missingProperty}`;
      case "type":
        return `${path}: should be ${params.type}`;
      case "format":
        return `${path}: should match format "${params.format}"`;
      case "enum":
        return `${path}: should be one of [${params.allowedValues.join(", ")}]`;
      case "additionalProperties":
        return `${path}: has additional property "${params.additionalProperty}" which is not allowed`;
      default:
        return `${path}: ${message}`;
    }
  });
}

/**
 * Infers a JSON schema from sample data
 * @param data Sample data to infer schema from
 * @returns Inferred JSON schema
 */
export function inferSchema(data: any): any {
  if (data === null) return { type: "null" };
  
  switch (typeof data) {
    case "string":
      return { type: "string" };
    case "number":
      return { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "object":
      if (Array.isArray(data)) {
        if (data.length === 0) {
          return { type: "array", items: {} };
        }
        
        // Try to infer schema from the first few items
        const sampleSize = Math.min(10, data.length);
        const samples = data.slice(0, sampleSize).map(item => inferSchema(item));
        
        // Merge schemas if they're similar
        if (samples.every(s => s.type === samples[0].type)) {
          return {
            type: "array",
            items: samples[0],
          };
        }
        
        // Otherwise use anyOf for different types
        return {
          type: "array",
          items: {
            anyOf: samples.filter((s, i, arr) => 
              arr.findIndex(t => t.type === s.type) === i
            ),
          },
        };
      } else {
        const properties: Record<string, any> = {};
        const required: string[] = [];
        
        Object.entries(data).forEach(([key, value]) => {
          properties[key] = inferSchema(value);
          if (value !== undefined && value !== null) {
            required.push(key);
          }
        });
        
        return {
          type: "object",
          properties,
          required: required.length > 0 ? required : undefined,
        };
      }
    default:
      return {};
  }
}

/**
 * Validates a dataset against a schema and returns validation results
 * @param schema JSON schema to validate against
 * @param dataset Array of data objects to validate
 * @returns Validation results including overall validity and item-specific errors
 */
export function validateDataset(schema: any, dataset: any[]) {
  if (!Array.isArray(dataset)) {
    return {
      valid: false,
      message: "Dataset must be an array",
      itemResults: [],
    };
  }
  
  const itemResults = dataset.map((item, index) => {
    const result = validateAgainstSchema(schema, item);
    return {
      index,
      valid: result.valid,
      errors: formatValidationErrors(result.errors),
    };
  });
  
  const validItems = itemResults.filter(item => item.valid).length;
  
  return {
    valid: validItems === dataset.length,
    message: `${validItems}/${dataset.length} items valid`,
    itemResults,
  };
}
