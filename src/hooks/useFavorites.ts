import { useState, useEffect, useCallback } from "react";

interface FavoriteItem {
  path: string;
  label: string;
  addedAt: number;
}

const STORAGE_KEY = "rcollab-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = useCallback((path: string, label: string) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.path === path)) return prev;
      return [...prev, { path, label, addedAt: Date.now() }];
    });
  }, []);

  const removeFavorite = useCallback((path: string) => {
    setFavorites((prev) => prev.filter((f) => f.path !== path));
  }, []);

  const isFavorite = useCallback(
    (path: string) => favorites.some((f) => f.path === path),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (path: string, label: string) => {
      if (isFavorite(path)) {
        removeFavorite(path);
      } else {
        addFavorite(path, label);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite };
}
