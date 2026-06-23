export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Lightweight Supabase Database type fallback.
 *
 * Lovable generated this file empty in the repo, while the app imports
 * Database and Json from here. This broad schema keeps the app type-safe
 * enough to compile until generated Supabase types are restored from the
 * live project schema.
 */
export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
        Relationships: any[];
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, any>;
        Relationships: any[];
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, any>;
        Returns: any;
      };
    };
    Enums: {
      [key: string]: string;
    };
    CompositeTypes: {
      [key: string]: any;
    };
  };
};
