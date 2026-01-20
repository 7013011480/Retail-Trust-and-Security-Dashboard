import { Toaster } from "@/app/components/ui/sonner";
import { Dashboard } from "@/app/components/dashboard";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // Enable dark mode
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      <Dashboard />
      <Toaster theme="dark" />
    </>
  );
}