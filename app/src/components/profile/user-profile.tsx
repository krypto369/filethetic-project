"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getAllDatasets } from "@/lib/web3";
import { Dataset } from "@/lib/types";
import { DatasetCard } from "@/components/ui/dataset-card";
import { toast } from "sonner";
import { Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { StorageManager } from "@/components/storage/StorageManager";

export function UserProfile() {
  const { address, isConnected } = useAccount();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("datasets");
  const [profileName, setProfileName] = useState("");
  const [notifications, setNotifications] = useState(true);

  // Load user datasets
  useEffect(() => {
    async function loadUserDatasets() {
      if (!isConnected || !address) return;
      
      try {
        setLoading(true);
        const userDatasets = await getAllDatasets({ ownedOnly: true });
        setDatasets(userDatasets);
      } catch (error) {
        console.error("Error loading user datasets:", error);
        toast.error("Failed to load your datasets");
      } finally {
        setLoading(false);
      }
    }
    
    loadUserDatasets();

    // Load profile name from local storage
    const savedName = localStorage.getItem("profileName");
    if (savedName) {
      setProfileName(savedName);
    }
  }, [address, isConnected]);

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Please connect your wallet to view your profile
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://avatar.vercel.sh/${address}`} />
              <AvatarFallback>
                {address ? address.slice(2, 4).toUpperCase() : "??"}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <CardTitle>{profileName ? profileName : "Your Profile"}</CardTitle>
              <div className="flex items-center gap-2">
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  {address ? formatAddress(address) : "No address"}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={copyAddress}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  asChild
                >
                  <Link 
                    href={`https://mumbai.polygonscan.com/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground">Datasets Created</div>
              <div className="text-2xl font-bold">{datasets.length}</div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground">Verified Datasets</div>
              <div className="text-2xl font-bold">
                {datasets.filter((d: any) => d.verified).length}
              </div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground">Total Rows</div>
              <div className="text-2xl font-bold">
                {datasets.reduce((acc, d) => acc + (d.numRows || 0), 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="datasets" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="datasets">Your Datasets</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Datasets Tab */}
        <TabsContent value="datasets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Datasets</h2>
            <Button asChild>
              <Link href="/create">Create New Dataset</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : datasets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasets.map((dataset) => (
                <DatasetCard 
                  key={dataset.id}
                  id={dataset.id}
                  name={dataset.name}
                  description={dataset.description}
                  price={dataset.price}
                  owner={dataset.owner}
                  locked={!dataset.isPublic}
                  verified={dataset.isVerified}
                  isOwner={address?.toLowerCase() === dataset.owner.toLowerCase()}
                  cid={dataset.cid}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Datasets Found</CardTitle>
                <CardDescription>
                  You haven't created any datasets yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get started by creating your first synthetic dataset
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/create">Create Dataset</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent actions on the Filethetic platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Activity items would go here - for now showing placeholder */}
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Created a new dataset</p>
                      <p className="text-sm text-muted-foreground">
                        Customer Reviews Dataset
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Today</Badge>
                </div>
                
                <p className="text-center text-muted-foreground">
                  Activity tracking coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Storage Tab */}
        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage Management</CardTitle>
              <CardDescription>
                Manage your storage payments for uploading and storing datasets on Filecoin CDN
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StorageManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Profile Name</Label>
                <Input 
                  id="profile-name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={() => setNotifications(prev => !prev)}
                />
                <label
                  htmlFor="notifications"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable Notifications
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                localStorage.setItem("profileName", profileName);
                toast.success("Profile settings saved!");
              }}>
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
