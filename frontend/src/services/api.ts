import axios from 'axios';
import { Vehicle, Part, User } from '../types/types';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Vehicles
export const getVehicles = async () => {
    const response = await api.get<Vehicle[]>('/vehicles/');
    return response.data;
};

export const addVehicle = async (vehicle: Partial<Vehicle>) => {
    const response = await api.post<Vehicle>('/vehicles/', vehicle);
    return response.data;
};

export const updateVehicle = async (id: number, vehicle: Partial<Vehicle>) => {
    const response = await api.put<Vehicle>(`/vehicles/${id}`, vehicle);
    return response.data;
};

export const deleteVehicle = async (id: number) => {
    await api.delete(`/vehicles/${id}`);
};

// Parts
export const getParts = async () => {
    const response = await api.get<Part[]>('/parts/');
    return response.data;
};

export const addPart = async (part: Partial<Part>) => {
    const response = await api.post<Part>('/parts/', part);
    return response.data;
};

export const updatePart = async (id: number, part: Partial<Part>) => {
    const response = await api.put<Part>(`/parts/${id}`, part);
    return response.data;
};

export const deletePart = async (id: number) => {
    await api.delete(`/parts/${id}`);
};

// Admin
export const getUsers = async () => {
    const response = await api.get<User[]>('/users/');
    return response.data;
};

export const addUser = async (user: Partial<User>) => {
    const response = await api.post<User>('/users/', user);
    return response.data;
};

export const updateUser = async (id: number, user: Partial<User>) => {
    const response = await api.put<User>(`/users/${id}`, user);
    return response.data;
};

export const deleteUser = async (id: number) => {
    await api.delete(`/users/${id}`);
};

// Inventory
export const getInventory = async () => {
    const response = await api.get<Part[]>('/inventory/');
    return response.data;
};

export const updateInventory = async (id: number, quantity: number) => {
    const response = await api.put(`/inventory/${id}`, { quantity });
    return response.data;
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await axios.post(`${BASE_URL}/token`, formData);
    return response.data;
};

export const getVehicleHistory = async (vehicleId: string, date: Date) => {
    try {
        const response = await api.get(`/vehicles/${vehicleId}/history`, {
            params: { date: date.toISOString() }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle history:', error);
        throw error;
    }
};

export default api; 