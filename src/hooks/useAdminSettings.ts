import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformSettings {
  commission_percentage: number;
  maintenance_mode: boolean;
  announcement_banner: string;
  featured_tools: string[];
  featured_students: string[];
  featured_researchers: string[];
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings>({
    commission_percentage: 10,
    maintenance_mode: false,
    announcement_banner: "",
    featured_tools: [],
    featured_students: [],
    featured_researchers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value");

      if (error) throw error;

      const settingsObj: any = {};
      (data || []).forEach((item) => {
        settingsObj[item.key] = item.value;
      });

      setSettings({
        commission_percentage: Number(settingsObj.commission_percentage) || 10,
        maintenance_mode: settingsObj.maintenance_mode === true,
        announcement_banner: String(settingsObj.announcement_banner || "").replace(/^"|"$/g, ""),
        featured_tools: Array.isArray(settingsObj.featured_tools) ? settingsObj.featured_tools : [],
        featured_students: Array.isArray(settingsObj.featured_students) ? settingsObj.featured_students : [],
        featured_researchers: Array.isArray(settingsObj.featured_researchers) ? settingsObj.featured_researchers : [],
      });
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any, userId?: string) => {
    try {
      const { error } = await supabase
        .from("platform_settings")
        .update({ 
          value: JSON.stringify(value),
          updated_at: new Date().toISOString(),
          updated_by: userId || null,
        })
        .eq("key", key);
      if (error) throw error;
      await fetchSettings();
      return { success: true };
    } catch (err: any) {
      console.error("Error updating setting:", err);
      return { success: false, error: err.message };
    }
  };

  const setCommission = async (percentage: number, userId?: string) => {
    return updateSetting("commission_percentage", percentage, userId);
  };

  const setMaintenanceMode = async (enabled: boolean, userId?: string) => {
    return updateSetting("maintenance_mode", enabled, userId);
  };

  const setAnnouncementBanner = async (text: string, userId?: string) => {
    return updateSetting("announcement_banner", text, userId);
  };

  const setFeaturedItems = async (
    type: "featured_tools" | "featured_students" | "featured_researchers",
    ids: string[],
    userId?: string
  ) => {
    return updateSetting(type, ids, userId);
  };

  return {
    settings,
    loading,
    refetch: fetchSettings,
    updateSetting,
    setCommission,
    setMaintenanceMode,
    setAnnouncementBanner,
    setFeaturedItems,
  };
}
