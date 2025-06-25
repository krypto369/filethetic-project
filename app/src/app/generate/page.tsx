import { Metadata } from "next";
import { GenerateDatasetForm } from "@/components/forms/generate-dataset-form";
import { Layout } from "@/components/layout/layout";

export const metadata: Metadata = {
  title: "Generate Dataset | Filethetic",
  description: "Generate synthetic datasets using AI models on Filethetic",
};

export default function GeneratePage() {
  return (
    <Layout>
      <div className="container max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Generate Synthetic Dataset</h1>
            <p className="text-muted-foreground">
              Create synthetic datasets using AI models and predefined templates
            </p>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <GenerateDatasetForm />
          </div>
        </div>
      </div>
    </Layout>
  );
}
