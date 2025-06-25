import { Metadata } from "next";
import { VerificationDashboard } from "@/components/dashboard/verification-dashboard";
import { Layout } from "@/components/layout/layout";

export const metadata: Metadata = {
  title: "Verification Dashboard | Filethetic",
  description: "Manage and verify synthetic datasets on the Filethetic platform",
};

export default function VerificationDashboardPage() {
  return (
    <Layout>
      <div className="container max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Verification Dashboard</h1>
              <p className="text-muted-foreground">
                Manage and verify synthetic datasets on the Filethetic platform
              </p>
            </div>
          </div>
          
          <VerificationDashboard />
        </div>
      </div>
    </Layout>
  );
}
