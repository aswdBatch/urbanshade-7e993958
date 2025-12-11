import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export interface OnlineProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  clearance: number;
  role: string;
  avatar_url: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const useOnlineAccount = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<OnlineProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnlineMode, setIsOnlineMode] = useState(false);

  // Check if we're in dev mode - if so, don't sync
  const isDevMode = localStorage.getItem("urbanshade_dev_mode") === "true";

  useEffect(() => {
    // Skip auth setup in dev mode
    if (isDevMode) {
      setLoading(false);
      return;
    }

    // Check if online mode is enabled
    const onlineEnabled = localStorage.getItem("urbanshade_online_account") === "true";
    setIsOnlineMode(onlineEnabled);

    if (!onlineEnabled) {
      setLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch profile after auth state changes (using setTimeout to avoid deadlock)
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isDevMode]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data as OnlineProfile | null);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
          display_name: username
        }
      }
    });

    if (!error) {
      localStorage.setItem("urbanshade_online_account", "true");
      setIsOnlineMode(true);
    }

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error) {
      localStorage.setItem("urbanshade_online_account", "true");
      setIsOnlineMode(true);
    }

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      localStorage.setItem("urbanshade_online_account", "false");
      setIsOnlineMode(false);
      setProfile(null);
    }
    return { error };
  };

  const enableOnlineMode = () => {
    localStorage.setItem("urbanshade_online_account", "true");
    setIsOnlineMode(true);
  };

  const disableOnlineMode = () => {
    localStorage.setItem("urbanshade_online_account", "false");
    setIsOnlineMode(false);
  };

  // Update profile
  const updateProfile = async (updates: { display_name?: string; avatar_url?: string }) => {
    if (!user) return { error: new Error("Not signed in") };

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (!error) {
        // Refresh profile
        await fetchProfile(user.id);
      }

      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!user) return { error: new Error("Not signed in") };

    try {
      // Delete synced settings first
      await supabase.from("synced_settings").delete().eq("user_id", user.id);
      
      // Delete profile
      await supabase.from("profiles").delete().eq("user_id", user.id);
      
      // Sign out (can't delete auth user from client side)
      await signOut();
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Sync settings to cloud (only if online mode and not dev mode)
  const syncSettings = async (preferences?: { desktopIcons: boolean; installedApps: boolean; theme: boolean; systemSettings: boolean }) => {
    if (isDevMode || !isOnlineMode || !user) return;

    // Default to sync all if no preferences provided
    const prefs = preferences || { desktopIcons: true, installedApps: true, theme: true, systemSettings: true };

    try {
      const settings: Record<string, any> = {
        install_type: localStorage.getItem("urbanshade_install_type"),
      };

      if (prefs.desktopIcons) {
        settings.desktop_icons = JSON.parse(localStorage.getItem("urbanshade_desktop_icons") || "[]");
      }
      if (prefs.installedApps) {
        settings.installed_apps = JSON.parse(localStorage.getItem("urbanshade_installed_apps") || "[]");
      }
      if (prefs.theme || prefs.systemSettings) {
        settings.system_settings = {};
        if (prefs.theme) {
          settings.system_settings.theme = localStorage.getItem("settings_theme");
          settings.system_settings.bg_gradient_start = localStorage.getItem("settings_bg_gradient_start");
          settings.system_settings.bg_gradient_end = localStorage.getItem("settings_bg_gradient_end");
          settings.system_settings.accent_color = localStorage.getItem("settings_accent_color");
          settings.system_settings.font_family = localStorage.getItem("settings_font_family");
          settings.system_settings.glass_opacity = localStorage.getItem("settings_glass_opacity");
        }
        if (prefs.systemSettings) {
          settings.system_settings.animations = localStorage.getItem("settings_animations");
          settings.system_settings.device_name = localStorage.getItem("settings_device_name");
          settings.system_settings.brightness = localStorage.getItem("settings_brightness");
          settings.system_settings.night_light = localStorage.getItem("settings_night_light");
        }
      }

      const { error } = await supabase
        .from("synced_settings")
        .upsert({
          user_id: user.id,
          ...settings,
          last_sync: new Date().toISOString()
        }, {
          onConflict: "user_id"
        });

      if (error) {
        console.error("Sync error:", error);
        throw error;
      }
    } catch (err) {
      console.error("Failed to sync settings:", err);
      throw err;
    }
  };

  // Check for conflicts between local and cloud settings
  const checkForConflict = async () => {
    if (isDevMode || !isOnlineMode || !user) return null;

    try {
      const { data, error } = await supabase
        .from("synced_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) return null;

      // Check if cloud has data that differs from local
      const localIcons = localStorage.getItem("urbanshade_desktop_icons");
      const cloudIcons = JSON.stringify(data.desktop_icons || []);
      
      const localApps = localStorage.getItem("urbanshade_installed_apps");
      const cloudApps = JSON.stringify(data.installed_apps || []);
      
      const hasConflict = 
        (localIcons && localIcons !== "[]" && cloudIcons !== "[]" && localIcons !== cloudIcons) ||
        (localApps && localApps !== "[]" && cloudApps !== "[]" && localApps !== cloudApps);

      if (hasConflict) {
        return { hasConflict: true, cloudSettings: data };
      }
      
      return { hasConflict: false, cloudSettings: data };
    } catch (err) {
      console.error("Failed to check for conflicts:", err);
      return null;
    }
  };

  // Load settings from cloud
  const loadCloudSettings = async () => {
    if (isDevMode || !isOnlineMode || !user) return;

    try {
      const { data, error } = await supabase
        .from("synced_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) return;

      // Apply cloud settings to localStorage
      if (data.install_type) {
        localStorage.setItem("urbanshade_install_type", data.install_type);
      }
      if (data.desktop_icons) {
        localStorage.setItem("urbanshade_desktop_icons", JSON.stringify(data.desktop_icons));
      }
      if (data.installed_apps) {
        localStorage.setItem("urbanshade_installed_apps", JSON.stringify(data.installed_apps));
      }
      if (data.system_settings && typeof data.system_settings === 'object') {
        const settings = data.system_settings as Record<string, string>;
        Object.entries(settings).forEach(([key, value]) => {
          if (value) localStorage.setItem(`settings_${key}`, value);
        });
      }
    } catch (err) {
      console.error("Failed to load cloud settings:", err);
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    isOnlineMode,
    isDevMode,
    signUp,
    signIn,
    signOut,
    enableOnlineMode,
    disableOnlineMode,
    syncSettings,
    loadCloudSettings,
    checkForConflict,
    fetchProfile,
    updateProfile,
    deleteAccount
  };
};
