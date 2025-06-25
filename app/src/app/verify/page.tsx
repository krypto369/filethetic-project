import { Metadata } from "next";
import { VerifyPageClient } from "@/components/pages/verify-page-client";

export const metadata: Metadata = {
  title: "Verify Dataset | Filethetic",
  description: "Verify the authenticity of synthetic datasets on Filethetic",
};

export default function VerifyPage() {
  return <VerifyPageClient />;
}
