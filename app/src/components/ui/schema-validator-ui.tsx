"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonViewer } from "@/components/ui/json-viewer";
import { validateAgainstSchema, inferSchema, formatValidationErrors } from "@/lib/schema-validator";
import { CheckCircle, AlertCircle, RefreshCw, Code } from "lucide-react";
import { toast } from "sonner";

interface SchemaValidatorUIProps {
  initialData?: any;
  initialSchema?: any;
  onValidationComplete?: (isValid: boolean, errors: string[]) => void;
  className?: string;
}

export function SchemaValidatorUI({
  initialData,
  initialSchema,
  onValidationComplete,
  className,
}: SchemaValidatorUIProps) {
  const [schemaText, setSchemaText] = useState(
    initialSchema ? JSON.stringify(initialSchema, null, 2) : ""
  );
  const [dataText, setDataText] = useState(
    initialData ? JSON.stringify(initialData, null, 2) : ""
  );
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: any[];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  // Parse JSON safely
  const parseJson = (text: string) => {
    try {
      return JSON.parse(text);
    } catch (error) {
      return null;
    }
  };

  // Validate data against schema
  const validateData = () => {
    setIsValidating(true);
    
    try {
      const schema = parseJson(schemaText);
      const data = parseJson(dataText);
      
      if (!schema) {
        toast.error("Invalid JSON schema");
        setIsValidating(false);
        return;
      }
      
      if (!data) {
        toast.error("Invalid JSON data");
        setIsValidating(false);
        return;
      }
      
      const result = validateAgainstSchema(schema, data);
      setValidationResult(result as { valid: boolean; errors: any[]; });
      
      if (onValidationComplete) {
        onValidationComplete(
          result.valid as boolean, 
          formatValidationErrors(result.errors)
        );
      }
      
      if (result.valid) {
        toast.success("Validation successful");
      } else {
        toast.error(`Validation failed with ${result.errors.length} errors`);
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsValidating(false);
    }
  };

  // Infer schema from data
  const handleInferSchema = () => {
    try {
      const data = parseJson(dataText);
      
      if (!data) {
        toast.error("Invalid JSON data");
        return;
      }
      
      const schema = inferSchema(data);
      setSchemaText(JSON.stringify(schema, null, 2));
      toast.success("Schema inferred from data");
    } catch (error) {
      console.error("Schema inference error:", error);
      toast.error(`Schema inference error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Format JSON
  const formatJson = (text: string, setter: (value: string) => void) => {
    try {
      const parsed = JSON.parse(text);
      setter(JSON.stringify(parsed, null, 2));
      toast.success("JSON formatted");
    } catch (error) {
      toast.error("Invalid JSON");
    }
  };

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "editor" | "preview")}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={validateData}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Validate"
              )}
            </Button>
          </div>
        </div>
        
        <TabsContent value="editor" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Schema Editor */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>JSON Schema</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatJson(schemaText, setSchemaText)}
                    >
                      <Code className="h-4 w-4 mr-1" />
                      Format
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleInferSchema}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Infer
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Define the structure your data should follow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={schemaText}
                  onChange={(e) => setSchemaText(e.target.value)}
                  placeholder='{"type": "object", "properties": {...}}'
                  className="font-mono h-[300px]"
                />
              </CardContent>
            </Card>
            
            {/* Data Editor */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>JSON Data</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatJson(dataText, setDataText)}
                  >
                    <Code className="h-4 w-4 mr-1" />
                    Format
                  </Button>
                </div>
                <CardDescription>
                  Enter the data to validate against the schema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={dataText}
                  onChange={(e) => setDataText(e.target.value)}
                  placeholder='{"property": "value"}'
                  className="font-mono h-[300px]"
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Validation Results */}
          {validationResult && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {validationResult.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <CardTitle>
                    Validation Results
                    <Badge
                      variant={validationResult.valid ? "outline" : "destructive"}
                      className="ml-2"
                    >
                      {validationResult.valid ? "Valid" : "Invalid"}
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {validationResult.valid ? (
                  <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                      Data is valid according to the schema
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertTitle>Validation Failed</AlertTitle>
                      <AlertDescription>
                        Found {validationResult.errors.length} errors
                      </AlertDescription>
                    </Alert>
                    
                    <div className="mt-4 space-y-2">
                      {formatValidationErrors(validationResult.errors).map((error, index) => (
                        <div
                          key={index}
                          className="p-2 border border-red-200 dark:border-red-900 rounded bg-red-50 dark:bg-red-950/30 text-sm"
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="preview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Schema Preview</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-auto">
                {schemaText ? (
                  (() => {
                    const schema = parseJson(schemaText);
                    return schema ? (
                      <JsonViewer data={schema} rootName="schema" expandLevel={2} />
                    ) : (
                      <div className="text-red-500">Invalid JSON schema</div>
                    );
                  })()
                ) : (
                  <div className="text-muted-foreground">No schema defined</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-auto">
                {dataText ? (
                  (() => {
                    const data = parseJson(dataText);
                    return data ? (
                      <JsonViewer data={data} rootName="data" expandLevel={2} />
                    ) : (
                      <div className="text-red-500">Invalid JSON data</div>
                    );
                  })()
                ) : (
                  <div className="text-muted-foreground">No data provided</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
