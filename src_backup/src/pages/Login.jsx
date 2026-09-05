import React, { useState } from "react";
import { signInWithGoogle } from "@/lib/supabaseAuth"; // Using your actual file!
import { LogIn, Loader2, Sparkles } from "lucide-react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      // This calls the function from your supabaseAuth.js
      await signInWithGoogle();
      
      // Note: We don't manually redirect to "/" here because Supabase 
      // will automatically refresh the page/app when the login finishes.
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(`Sign-in failed: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="w-full max-w-sm rounded-3xl bg-card border border-border shadow-xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-pink-500 text-white grid place-items-center mx-auto mb-4 shadow-lg shadow-pink-500/30">
          <Sparkles className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-heading font-bold text-foreground mb-1">
          Schedul-Ulu
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to save your data.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full h-12 rounded-2xl border border-border flex items-center justify-center gap-2 font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}