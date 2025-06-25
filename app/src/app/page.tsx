"use client";

import { Layout } from '@/components/layout/layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle, Database, ExternalLink, FileText, Layers, LockKeyhole, Shield, Store } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';
import { Suspense } from 'react';

export default function Home() {
  const isMobile = useIsMobile();
  return (
    <Layout>
      <div className="flex flex-col">
        {/* Announcement Banner */}
        <div className="w-full pt-2 text-center">
          <div className="container mx-auto flex items-center justify-center px-4">
            <div className="inline-flex items-center rounded-full bg-primary/20 p-1 text-primary shadow-sm">
              <Link href="#features" className="flex items-center gap-2 px-3 py-1">
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                  New
                </span>
                <span className="text-sm font-medium">
                  Filethetic v1.0 is here! Explore it now 🥳
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-[85vh] w-full flex items-center bg-gradient-to-br from-background to-primary/5">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    Decentralized Synthetic Data Ecosystem
                  </h1>
                  <p className="max-w-[600px] text-xl text-muted-foreground">
                    Filethetic is a decentralized service to create, verify, and trade synthetic datasets on Filecoin blockchain using Filecoin CDN, IPFS and Verifiable LLMs.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="bg-primary text-white" asChild>
                    <Link href="/marketplace" className="flex items-center text-white dark:text-black">
                      Explore Marketplace <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/create" className="flex items-center">
                      Create Dataset <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="relative w-full max-w-[500px] h-[500px] flex items-center justify-center">
                  {/* Central icon */}
                  <div className="absolute z-30 w-36 h-36 rounded-full bg-primary/80 flex items-center justify-center border-2 border-primary shadow-lg shadow-primary/20">
                    <Database className="h-16 w-16 text-white" strokeWidth={1.5} />
                  </div>

                  {/* Rotating circle */}
                  <div className="absolute w-96 h-96 rounded-full border-4 border-dashed border-primary/40 animate-[spin_20s_linear_infinite]"></div>

                  {/* Orbiting elements */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-16 h-16 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md"
                      style={{
                        transform: `rotate(${i * 45}deg) translateX(180px) rotate(-${i * 45}deg)`,
                        animation: `pulse 3s infinite ease-in-out ${i * 0.2}s`,
                      }}
                    >
                      {i % 4 === 0 && <Database className="h-8 w-8 text-primary" />}
                      {i % 4 === 1 && <LockKeyhole className="h-8 w-8 text-primary" />}
                      {i % 4 === 2 && <BarChart3 className="h-8 w-8 text-primary" />}
                      {i % 4 === 3 && <Shield className="h-8 w-8 text-primary" />}
                    </div>
                  ))}

                  {/* Connecting lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    {Array.from({ length: 8 }).map((_, i) => {
                      const angle = i * 45 * (Math.PI / 180)
                      const x = 250 + 180 * Math.cos(angle)
                      const y = 250 + 180 * Math.sin(angle)
                      return (
                        <line
                          key={i}
                          x1="250"
                          y1="250"
                          x2={x}
                          y2={y}
                          stroke="url(#lineGradient)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="animate-pulse"
                        />
                      )
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating JSON snippet */}
          <div className="absolute bottom-8 right-8 md:right-16 bg-background/90 backdrop-blur-md p-4 rounded-lg border border-primary/30 shadow-xl z-10 hidden md:block">
            <div className="text-sm font-mono text-primary">
              {"{"}
              <br />
              &nbsp;&nbsp;"decentralized": true,
              <br />
              &nbsp;&nbsp;"verified": true,
              <br />
              &nbsp;&nbsp;"source": "filethetic"
              <br />
              {"}"}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium mb-4">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Why Choose Filethetic?
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Our platform combines the best of blockchain, decentralized storage, and synthetic data generation
                to create a powerful ecosystem for data creators and consumers.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm bg-background hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Decentralized Storage</h3>
                  <p className="text-muted-foreground">
                    All datasets are stored on IPFS/Filecoin for resilient, censorship-resistant access with guaranteed availability.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm bg-background hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <LockKeyhole className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Access Control</h3>
                  <p className="text-muted-foreground">
                    NFT-based dataset ownership with granular access control mechanisms and secure permission management.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm bg-background hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Cryptographic Verification</h3>
                  <p className="text-muted-foreground">
                    Verify dataset authenticity through our network of authorized verifiers with tamper-proof certification.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm bg-background hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Immutable Records</h3>
                  <p className="text-muted-foreground">
                    All dataset transactions and metadata permanently recorded on-chain with complete audit trails.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm bg-background hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Marketplace</h3>
                  <p className="text-muted-foreground">
                    Buy and sell synthetic datasets with secure payment and delivery through our decentralized marketplace.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm bg-background hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Data Standardization</h3>
                  <p className="text-muted-foreground">
                    Standardized data formats and schemas ensure compatibility and ease of use across different applications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium mb-4">
                Process
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                How Filethetic Works
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Our platform streamlines the creation, verification, and trading of synthetic datasets
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-primary/5 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5"></div>
                <div className="relative z-10 p-8">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">1</div>
                      <div className="h-0.5 flex-1 bg-primary/30"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">2</div>
                      <div className="h-0.5 flex-1 bg-primary/30"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">3</div>
                      <div className="h-0.5 flex-1 bg-primary/30"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">4</div>
                      <div className="h-0.5 flex-1 bg-primary/30"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">1. Create Synthetic Data</h3>
                      <p className="text-muted-foreground">
                        Generate structured synthetic datasets using our intuitive creation tools and templates,
                        designed for various use cases and industries.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">2. Store on IPFS/Filecoin</h3>
                      <p className="text-muted-foreground">
                        Your datasets are automatically stored on the decentralized IPFS/Filecoin network,
                        ensuring permanent availability and censorship resistance.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">3. Verify & Certify</h3>
                      <p className="text-muted-foreground">
                        Submit your dataset for verification by our network of trusted verifiers,
                        who cryptographically certify the quality and authenticity of your data.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">4. Trade & Monetize</h3>
                      <p className="text-muted-foreground">
                        List your verified datasets on our marketplace, set your own pricing,
                        and earn revenue from data consumers who need high-quality synthetic data.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="w-full py-16 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium mb-4">
                Applications
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Transforming Industries with Synthetic Data
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Discover how Filethetic is revolutionizing data usage across multiple sectors
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "AI Training",
                  description: "High-quality synthetic data for training machine learning and AI models with reduced bias.",
                  icon: <Layers className="h-10 w-10 text-primary" />,
                },
                {
                  title: "Financial Services",
                  description: "Generate market data and financial models with complete audit trails for compliance.",
                  icon: <BarChart3 className="h-10 w-10 text-primary" />,
                },
                {
                  title: "Healthcare",
                  description: "Create synthetic patient data for research while maintaining privacy and compliance.",
                  icon: <Shield className="h-10 w-10 text-primary" />,
                },
              ].map((useCase, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-4 rounded-lg border p-6 text-center shadow-sm bg-background hover:shadow-md transition-shadow"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">{useCase.icon}</div>
                  <h3 className="text-xl font-bold">{useCase.title}</h3>
                  <p className="text-muted-foreground">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to Get Started?
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Join the Filethetic platform and revolutionize how you create and share synthetic datasets
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="bg-primary text-white" asChild>
                  <Link href="/marketplace" className="flex items-center">
                    Explore Marketplace <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/create" className="flex items-center">
                    Create Dataset <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
