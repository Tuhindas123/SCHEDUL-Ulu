import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { supabase } from "@/lib/supabaseClient";

export async function signInWithGoogle() {
  const isNative = Capacitor.isNativePlatform();

  const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: isNative
      ? "com.flowtracker.app://login-callback"
      : window.location.origin + "/",
    skipBrowserRedirect: isNative,
    scopes: "https://www.googleapis.com/auth/drive.file",
    queryParams: {
      access_type: "offline",
      prompt: "consent",
    },
  },
});
  if (error) throw error;

  if (isNative && data?.url) {
    await Browser.open({ url: data.url });
  }
}

export async function signOut() {
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