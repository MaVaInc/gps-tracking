import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => {
    return status >= 200 && status < 400; // Принимаем также редиректы
  },
});

export interface Vehicle {
  id: number;
  name: string;
  year: number;
  plate_number: string;
  driver_name: string;
  status: string;
  speed: number;
  mileage: number;
  current_location_lat: number | null;
  current_location_lng: number | null;
  last_update: string | null;
  next_tuv: string | null;
  parts: any[];
}

export const getVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await api.get<Vehicle[]>('/vehicles/');
    console.log('Received vehicles:', response.data); // Добавляем отладочный вывод
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
}; 