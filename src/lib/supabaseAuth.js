import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { supabase } from "@/lib/supabaseClient";

export async function signInWithGoogle() {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      // 1. Use native plugin to get the ID token
      const user = await GoogleAuth.signIn();
      
      // 2. Hand that token to Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: user.authentication.idToken,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Native Google Sign-in failed:", error);
      throw error;
    }
  } else {
    // Web fallback: Use OAuth redirect
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/",
        scopes: "https://www.googleapis.com/auth/drive.file",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) throw error;
    if (data?.url) {
      window.location.href = data.url;
    }
  }
}

export async function signOut() {
  if (Capacitor.isNativePlatform()) {
    await GoogleAuth.signOut();
  }
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Failed to get session:", error);
    return null;
  }
  return data.session;
}

export function getStoredUser(session) {
  const user = session?.user;
  if (!user) return null;

  return {
    id: user.id,
    name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email,
    email: user.email,
    picture: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  };
}

export function onAuthStateChange(callback) {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session);
    }
  );
  return () => listener.subscription.unsubscribe();
}
