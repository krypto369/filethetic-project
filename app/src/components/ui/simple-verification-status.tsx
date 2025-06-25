"use client";

import { CheckCircle, XCircle, Shield } from "lucide-react";

interface SimpleVerificationStatusProps {
  isVerified: boolean;
  verifier?: string;
}

export function SimpleVerificationStatus({ isVerified, verifier }: SimpleVerificationStatusProps) {
  return (
    <div className="flex items-center space-x-2">
      {isVerified ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">Verified</span>
          {verifier && <span className="text-xs text-muted-foreground">by {verifier}</span>}
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-orange-500" />
          <span className="text-sm text-orange-600 font-medium">Not verified</span>
        </>
      )}
    </div>
  );
}
