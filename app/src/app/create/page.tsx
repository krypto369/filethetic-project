"use client";

import { useState } from 'react';
// import { Metadata } from "next";
import { CreateDatasetForm } from "@/components/forms/create-dataset-form";
import { GenerateDatasetForm } from "@/components/forms/generate-dataset-form";
import { Layout } from "@/components/layout/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/storage/FileUploader";
import { UploadedInfo } from '@/hooks/storage/useFileUpload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// export const metadata: Metadata = {
//   title: "Create Dataset | Filethetic",
//   description: "Create and publish synthetic datasets on Filethetic",
// };

export default function CreatePage() {
  const [uploadStep, setUploadStep] = useState<'upload' | 'publish'>('upload');
  const [cid, setCid] = useState<string>('');
  const [fileData, setFileData] = useState<any>(null);

  const handleUploadComplete = (uploadedInfo: UploadedInfo, parsedData: any) => {
    if (uploadedInfo.cid) {
      setCid(uploadedInfo.cid);
      setFileData(parsedData);
      setUploadStep('publish');
    }
  };

  const handleBack = () => {
    setUploadStep('upload');
    setCid('');
    setFileData(null);
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create Synthetic Dataset</h1>
            <p className="text-muted-foreground">
              Generate or upload synthetic data to IPFS and publish it on the blockchain
            </p>
          </div>
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate Dataset</TabsTrigger>
              <TabsTrigger value="upload">Upload Dataset</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generate" className="pt-6">
              <Card className="bg-card rounded-lg border shadow-sm">
                <CardHeader>
                  <CardTitle>Generate Synthetic Dataset</CardTitle>
                  <CardDescription>
                    Generate a synthetic dataset using AI models and predefined templates
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <GenerateDatasetForm />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="upload" className="pt-6">
              <Card className="bg-card shadow-sm">
                <CardHeader>
                  <CardTitle>Create a New Dataset</CardTitle>
                  <CardDescription>
                    {uploadStep === 'upload'
                      ? 'Publish your dataset to the blockchain in two simple steps.'
                      : 'Review the details and publish your dataset.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {uploadStep === 'upload' ? (
                    <div className="space-y-4 pt-6">
                      <h3 className="text-xl font-semibold">Step 1: Upload Dataset File</h3>
                      <p className="text-muted-foreground">
                        Upload your synthetic dataset in JSON or CSV format. This will upload it to a decentralized CDN and generate a Content ID (CID).
                      </p>
                      <FileUploader onUploadComplete={handleUploadComplete} />
                    </div>
                  ) : (
                    <CreateDatasetForm cid={cid} fileData={fileData} onBack={handleBack} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
