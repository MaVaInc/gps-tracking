import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types/types';
import Map from '../components/Map';
import VehicleList from '../components/VehicleList';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';

const DashboardPage: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [vehicleListOpen, setVehicleListOpen] = useState(false);

    // Периодическое обновление данных
    useEffect(() => {
        fetchVehicles(); // Начальная загрузка

        // Обновление каждые 5 секунд
        const interval = setInterval(() => {
            fetchVehicles();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await fetch(`${API_URL}/api/vehicles/`);
            const data = await response.json();
            setVehicles(data);
            
            // Обновляем выбранную машину если она есть
            if (selectedVehicle) {
                const updated = data.find(v => v.id === selectedVehicle.id);
                if (updated) setSelectedVehicle(updated);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleVehicleClick = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setVehicleListOpen(false);
    };

    return (
        <>
            <Navbar />
            <div className="fixed inset-0 z-0 pt-16">
                <Map 
                    vehicles={vehicles} 
                    selectedVehicle={selectedVehicle}
                    onVehicleClick={handleVehicleClick}
                />
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setVehicleListOpen(!vehicleListOpen);
                }}
                className="fixed left-4 bottom-4 z-[100] bg-gray-800 dark:bg-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-gray-700 dark:hover:bg-gray-600"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {vehicleListOpen && (
                <div className="fixed left-0 top-16 bottom-0 w-80 bg-gray-800 shadow-lg z-[100]">
                    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        <VehicleList 
                            vehicles={vehicles}
                            selectedVehicle={selectedVehicle}
                            onVehicleClick={handleVehicleClick}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default DashboardPage; 