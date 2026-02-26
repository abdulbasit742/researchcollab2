/**
 * Backup Status — checks if automated backups are current.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "./logger";

const log = createLogger("backup");

const BACKUP_MAX_AGE_HOURS = 24;

export interface BackupStatus {
  lastBackupAt: string | null;
  isStale: boolean;
  hoursAgo: number | null;
}

/**
 * Check the last backup timestamp from background_job_runs.
 */
export async function checkBackupStatus(): Promise<BackupStatus> {
  try {
    const { data, error } = await supabase
      .from("background_job_runs")
      .select("started_at")
      .eq("job_name", "database_backup")
      .eq("status", "completed")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      log.warn("No backup records found");
      return { lastBackupAt: null, isStale: true, hoursAgo: null };
    }

    const lastBackup = new Date(data.started_at);
    const hoursAgo = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60);
    const isStale = hoursAgo > BACKUP_MAX_AGE_HOURS;

    if (isStale) {
      log.warn("Backup is stale", { hoursAgo: Math.round(hoursAgo) });
    }

    return {
      lastBackupAt: data.started_at,
      isStale,
      hoursAgo: Math.round(hoursAgo * 10) / 10,
    };
  } catch {
    return { lastBackupAt: null, isStale: true, hoursAgo: null };
  }
}
