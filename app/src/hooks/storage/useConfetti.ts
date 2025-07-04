import { useContext } from "react";
import { ConfettiContext } from "@/config/ConfettiProvider";

export const useConfetti = () => {
  const context = useContext(ConfettiContext);
  if (context === undefined) {
    throw new Error("useConfetti must be used within a ConfettiProvider");
  }
  return context;
}
