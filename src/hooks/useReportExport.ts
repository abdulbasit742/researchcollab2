import { useCallback } from "react";

export function useReportExport() {
  const exportToPDF = useCallback((title: string) => {
    const originalTitle = document.title;
    document.title = title;
    window.print();
    document.title = originalTitle;
  }, []);

  return { exportToPDF };
}
