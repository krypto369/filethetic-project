import { Metadata } from "next";
import { Layout } from "@/components/layout/layout";
import { MarketplaceAnalytics } from "@/components/analytics/marketplace-analytics";

export const metadata: Metadata = {
  title: "Analytics Dashboard | Filethetic",
  description: "View marketplace analytics and dataset statistics on the Filethetic platform",
};

export default function AnalyticsPage() {
  return (
    <Layout>
      <div className="container max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                View marketplace analytics and dataset statistics
              </p>
            </div>
          </div>
          
          <MarketplaceAnalytics />
        </div>
      </div>
    </Layout>
  );
}
