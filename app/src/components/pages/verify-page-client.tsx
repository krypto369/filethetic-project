"use client";

import { VerifyDatasetForm } from "@/components/forms/verify-dataset-form";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export function VerifyPageClient() {
  return (
    <Layout>
      <div className="container max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-3xl font-bold tracking-tight">Verify Dataset</h1>
              <p className="text-muted-foreground">
                Cryptographically verify the authenticity of synthetic datasets
              </p>
            </div>
            <Button asChild>
              <Link href="/verify/dashboard" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Verification Dashboard
              </Link>
            </Button>
          </div>
          <Suspense fallback={<div className="p-6 text-center">Loading verification form...</div>}>
            <VerifyDatasetForm />
          </Suspense>
        </div>
      </div>
    </Layout>
  );
}
