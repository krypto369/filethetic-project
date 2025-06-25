import { Metadata } from "next";
import { DatasetBrowser } from "@/components/ui/dataset-browser";
import { Layout } from "@/components/layout/layout";

export const metadata: Metadata = {
  title: "Marketplace | Filethetic",
  description: "Browse and purchase synthetic datasets on the Filethetic marketplace",
};

export default function MarketplacePage() {
  return (
    <Layout>
      <div className="container max-w-7xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dataset Marketplace</h1>
            <p className="text-muted-foreground">
              Browse, purchase, and access synthetic datasets from the decentralized marketplace.
            </p>
          </div>
          <DatasetBrowser />
        </div>
      </div>
    </Layout>
  );
}
