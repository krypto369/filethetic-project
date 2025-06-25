import { Metadata } from "next";
import { Layout } from "@/components/layout/layout";
import { UserProfile } from "@/components/profile/user-profile";

export const metadata: Metadata = {
  title: "User Profile | Filethetic",
  description: "View and manage your profile on the Filethetic platform",
};

export default function ProfilePage() {
  return (
    <Layout>
      <div className="container max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
              <p className="text-muted-foreground">
                View and manage your profile on the Filethetic platform
              </p>
            </div>
          </div>
          
          <UserProfile />
        </div>
      </div>
    </Layout>
  );
}
