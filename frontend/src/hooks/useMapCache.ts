import { useState, useEffect } from 'react';

interface MapCacheOptions {
  maxAge?: number; // Максимальное время хранения в миллисекундах
  key?: string;    // Ключ для хранения в localStorage
}

export const useMapCache = (options: MapCacheOptions = {}) => {
  const {
    maxAge = 1000 * 60 * 60, // 1 час по умолчанию
    key = 'map-cache'
  } = options;

  const [cache, setCache] = useState<any>(null);

  // Загрузка кеша при монтировании
  useEffect(() => {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      
      if (age < maxAge) {
        setCache(data);
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [key, maxAge]);

  // Функция для обновления кеша
  const updateCache = (data: any) => {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
    setCache(data);
  };

  return [cache, updateCache] as const;
}; 