import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/layout';
import { Database, LockKeyhole, Shield, CheckCircle, Store } from 'lucide-react';

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Decentralized Synthetic Data
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Filethetic is an EVM-compatible platform for creating, verifying, and trading
                    synthetic datasets powered by IPFS/Filecoin storage.  
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/marketplace">
                    <Button size="lg" className="bg-primary text-white">
                      Explore Marketplace
                    </Button>
                  </Link>
                  <Link href="/create">
                    <Button size="lg" variant="outline">
                      Create Dataset
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[300px] w-[300px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px] bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                  <Database className="h-32 w-32 text-primary" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 bg-muted/50 dark:bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Why Choose Filethetic?
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform combines the best of blockchain, decentralized storage, and synthetic data generation
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Database className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Decentralized Storage</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  All datasets are stored on IPFS/Filecoin for resilient, censorship-resistant access
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <LockKeyhole className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Access Control</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  NFT-based dataset ownership with granular access control mechanisms
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Cryptographic Verification</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Verify dataset authenticity through our network of authorized verifiers
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Immutable Records</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  All dataset transactions and metadata permanently recorded on-chain
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Store className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Marketplace</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Buy and sell synthetic datasets with secure payment and delivery
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to Get Started?
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Join the Filethetic platform and revolutionize how you create and share synthetic datasets
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/marketplace">
                  <Button size="lg">
                    Explore Datasets
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
