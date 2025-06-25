import { Metadata } from "next";
import { Layout } from "@/components/layout/layout";
import { DatasetBrowser } from "@/components/ui/dataset-browser";

export const metadata: Metadata = {
  title: "My Datasets | Filethetic",
  description: "Manage your created and purchased datasets on Filethetic",
};

export default function MyDatasetsPage() {
  return (
    <Layout>
      <div className="container max-w-7xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Datasets</h1>
            <p className="text-muted-foreground">
              Manage datasets you've created or purchased
            </p>
          </div>
          {/* Using the DatasetBrowser with filter for owned datasets */}
          <DatasetBrowser />
        </div>
      </div>
    </Layout>
  );
}
