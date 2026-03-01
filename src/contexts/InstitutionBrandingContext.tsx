import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useInstitutionSettings, type InstitutionSettings } from "@/hooks/useInstitutionSettings";

interface BrandingContextValue {
  settings: InstitutionSettings | null;
  isFeatureEnabled: (flag: string) => boolean;
  isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextValue>({
  settings: null,
  isFeatureEnabled: () => true,
  isLoading: false,
});

export function useInstitutionBranding() {
  return useContext(BrandingContext);
}

interface Props {
  institutionId?: string;
  children: ReactNode;
}

export function InstitutionBrandingProvider({ institutionId, children }: Props) {
  const { settings, isLoading, isFeatureEnabled } = useInstitutionSettings(institutionId);

  const value = useMemo(
    () => ({ settings, isFeatureEnabled, isLoading }),
    [settings, isFeatureEnabled, isLoading]
  );

  return (
    <BrandingContext.Provider value={value}>
      {/* Inject CSS custom properties for branding override */}
      {settings && (
        <style>{`
          :root {
            --institution-primary: ${settings.primary_color};
            --institution-secondary: ${settings.secondary_color};
          }
        `}</style>
      )}
      {children}
    </BrandingContext.Provider>
  );
}
