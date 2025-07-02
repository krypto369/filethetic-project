'use client';

import { useState, useEffect, useCallback } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { Loader2, Database, Bot, ArrowRight } from 'lucide-react';
import { DATASET_TEMPLATES, DatasetTemplate, Model, GenerationResult, getModels, MODEL_PROVIDERS, GenerationConfig } from '@/lib/models';
import { generateSyntheticDataset } from '@/lib/generation';
import { TemplateList } from '@/components/ui/template-card';
import { useDataUpload } from '@/hooks/storage/useDataUpload';
import { useDatasetPublisher } from '@/hooks/blockchain/useDatasetPublisher';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Dataset name must be at least 3 characters",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters",
  }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Price must be a non-negative number",
  }),
  visibility: z.enum(["public", "private"], {
    required_error: "You must select a visibility option",
  }),
  allowNFTAccess: z.boolean().default(false),
  modelId: z.string().min(1, {
    message: "Model is required",
  }),
  datasetPath: z.string().min(1, {
    message: "Dataset path is required",
  }),
  datasetConfig: z.string().default("default"),
  datasetSplit: z.string().default("train"),
  inputFeature: z.string().min(1, {
    message: "Input feature is required",
  }),
  prompt: z.string().min(10, {
    message: "Prompt template must be at least 10 characters",
  }),
  maxTokens: z.number().min(1000, {
    message: "Max tokens must be at least 1000",
  }),
});

export function GenerateDatasetForm() {
  const { isConnected, address } = useAccount();
  const {
    uploadDataMutation,
    progress: uploadProgress,
    status: uploadStatus,
    uploadedInfo,
    handleReset,
  } = useDataUpload();
  const { mutateAsync: uploadData, isPending: isUploading } = uploadDataMutation;
  const { publish, isPublishing } = useDatasetPublisher();

  const [activeTab, setActiveTab] = useState<string>("template");
  const [models, setModels] = useState<Model[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedData, setGeneratedData] = useState<GenerationResult[] | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  // Memoize resetUpload to stabilize useEffect dependencies
  const resetUpload = useCallback(() => {
    handleReset();
  }, [handleReset]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "public",
      price: "0",
      allowNFTAccess: false,
      modelId: "",
      prompt: "",
      maxTokens: 10000,
      inputFeature: "",
      datasetPath: "",
      datasetConfig: "",
      datasetSplit: "",
    },
  });

  useEffect(() => {
    loadModels();
  }, []);

  // Effect to upload data after it has been generated
  useEffect(() => {
    if (generatedData && !isUploading && !uploadedInfo) {
      const toastId = toast.loading("Uploading dataset to Filecoin...");
      uploadData(generatedData, {
        onSuccess: () => {
          toast.success("Dataset uploaded successfully!", { id: toastId });
        },
        onError: (error) => {
          toast.error(`Upload failed: ${error.message}`, { id: toastId });
        },
      });
    }
  }, [generatedData, isUploading, uploadedInfo, uploadData]);

  // Effect to publish dataset on-chain after it has been uploaded
  useEffect(() => {
    if (uploadedInfo?.commp && !isPublishing && !isPublished && generatedData) {
      if (!address) {
        toast.error("Wallet not connected. Cannot publish dataset.");
        return;
      }
      const formValues = form.getValues();
      console.log('Form values being passed to publish:', formValues);
      console.log('Generated data sample:', generatedData?.slice(0, 2));
      console.log('Upload info:', uploadedInfo);
      
      publish({
        ...formValues,
        generatedData,
        commp: uploadedInfo.commp,
        onSuccess: () => {
          toast.success("Dataset published successfully!");
          setIsPublished(true);
          form.reset();
          setGeneratedData(null);
          resetUpload();
        },
      });
    }
  }, [uploadedInfo, isPublishing, isPublished, generatedData, publish, form, address, resetUpload]);

  async function loadModels() {
    const toastId = toast.loading("Loading models...");
    try {
      const allModelsPromises = MODEL_PROVIDERS.map(provider => getModels(provider.id));
      const modelsByProvider = await Promise.all(allModelsPromises);
      const allModels = modelsByProvider.flat();
      setModels(allModels);
      toast.success("Models loaded successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Failed to load models:", error);
      toast.error(error.message || "Failed to load models.", { id: toastId });
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to generate a dataset.");
      return;
    }

    const toastId = toast.loading("Starting dataset generation...");
    setIsGenerating(true);
    setGeneratedData(null);
    setGenerationProgress(0);

    const generationConfig: GenerationConfig = {
      model: values.modelId,
      prompt: values.prompt,
      inputFeature: values.inputFeature,
      maxTokens: values.maxTokens,
      temperature: 0.7, // Default temperature
    };

    try {
      const { results } = await generateSyntheticDataset(
        values.datasetPath,
        values.datasetConfig,
        values.datasetSplit,
        generationConfig
      );
      setGeneratedData(results);
      setGenerationProgress(100);
      toast.success("Dataset generated successfully!", { id: toastId });
    } catch (error) {
      console.error("Generation failed:", error);
      toast.error("Dataset generation failed. Please check the console for details.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateSelect = (template: DatasetTemplate) => {
    form.reset({
      ...form.getValues(), // keep existing values
      prompt: template.prompt,
      inputFeature: template.inputFeature,
      maxTokens: template.maxTokens,
      datasetPath: template.datasetSource.path,
      datasetConfig: template.datasetSource.config,
      datasetSplit: template.datasetSource.split,
      modelId: template.recommendedModel,
      price: String(template.price),
      name: template.name,
      description: template.description,
    });
    setActiveTab("customize");
    toast.info(`Template "${template.name}" selected. Configure your model.`);
  };

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="template">Choose Template</TabsTrigger>
          <TabsTrigger value="customize">Customize & Generate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="template" className="space-y-6 pt-4">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Select a Template</h2>
            <p className="text-muted-foreground">
              Choose a predefined template to quickly generate a synthetic dataset
            </p>
            <TemplateList templates={DATASET_TEMPLATES} onSelect={handleTemplateSelect} />
          </div>
        </TabsContent>
        
        <TabsContent value="customize" className="space-y-6 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Dataset Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="My Synthetic Dataset" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="A detailed description of your dataset..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (USDFC)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              placeholder="0.00" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Set to 0 for a free dataset
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="visibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visibility</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select visibility" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="allowNFTAccess"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>NFT Access</FormLabel>
                            <FormDescription>
                              Allow access via NFT ownership
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Generation Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="modelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {models.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                  {model.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="datasetPath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dataset Path</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="HuggingFaceH4/ultrachat_200k" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            HuggingFace dataset path
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="datasetConfig"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Config</FormLabel>
                            <FormControl>
                              <Input placeholder="default" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="datasetSplit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Split</FormLabel>
                            <FormControl>
                              <Input placeholder="train" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="inputFeature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Input Feature</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 'messages'" {...field} />
                          </FormControl>
                          <FormDescription>
                            The feature in the dataset to use as input
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prompt Template</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Use {input} as a placeholder for the dataset value" 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Use {'{input}'} as a placeholder for the dataset value
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxTokens"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Tokens</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="1000" 
                              placeholder="10000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of tokens to generate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {(isGenerating || isUploading || isPublishing) && (
                <div className="mt-4 space-y-2">
                  <p className="text-center text-sm text-gray-500 mb-2">
                    {isGenerating 
                      ? `Generation Progress: ${generationProgress}%` 
                      : isUploading 
                      ? uploadStatus 
                      : 'Publishing dataset...'}
                  </p>
                  <Progress value={isGenerating ? generationProgress : (isUploading ? uploadProgress : undefined)} className="w-full" />
                </div>
              )}
              {generatedData && !isGenerating && !isUploading && (
                <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-semibold">Generated Data Preview:</h4>
                  <pre className="mt-2 text-xs overflow-auto max-h-48 bg-white dark:bg-gray-900 p-2 rounded">
                    {JSON.stringify(generatedData.slice(0, 5), null, 2)}
                  </pre>
                </div>
              )}
              {uploadedInfo && (
                <div className="mt-4 p-4 border rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                  <h4 className="font-semibold">Upload Complete!</h4>
                  {uploadedInfo.commp && <p className="text-xs font-mono break-all">Commp: {uploadedInfo.commp}</p>}
                  {uploadedInfo.txHash && <p className="text-xs font-mono break-all">Tx: {uploadedInfo.txHash}</p>}
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <Button 
                  type="submit" 
                  disabled={isGenerating || isUploading || isPublishing || !isConnected}
                  className="w-full"
                >
                  {isGenerating || isUploading || isPublishing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isGenerating ? "Generating..." : isUploading ? "Uploading..." : "Publishing..."}
                    </>
                  ) : (
                    "Generate & Publish"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
