import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types/types';
import Map from '../components/Map';
import VehicleList from '../components/VehicleList';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import { io, Socket } from 'socket.io-client';

const DashboardPage: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [vehicleListOpen, setVehicleListOpen] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Инициализация Socket.IO при монтировании компонента
    useEffect(() => {
        const newSocket = io('http://localhost:8001', {
            transports: ['websocket'],
            upgrade: false
        });

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
        });

        newSocket.on('vehicle_update', (data) => {
            console.log('Received update:', data);
            setVehicles(prevVehicles => 
                prevVehicles.map(vehicle => 
                    vehicle.id === data.id 
                        ? {
                            ...vehicle,
                            speed: data.speed,
                            current_location_lat: data.latitude,
                            current_location_lng: data.longitude,
                            status: data.status,
                            last_update: data.timestamp
                        }
                        : vehicle
                )
            );
        });

        setSocket(newSocket);

        // Очистка при размонтировании
        return () => {
            newSocket.close();
        };
    }, []);

    // Начальная загрузка данных
    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/vehicles/');
            const data = await response.json();
            setVehicles(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleVehicleClick = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setVehicleListOpen(false); // Закрываем список при выборе машины
    };

    // Обработчик клика по карте
    const handleMapClick = () => {
        setVehicleListOpen(false);
    };

    return (
        <>
            <Navbar />
            <div className="fixed inset-0 z-0 pt-16" onClick={handleMapClick}> {/* Добавили pt-16 для отступа под навбар */}
                <Map 
                    vehicles={vehicles} 
                    selectedVehicle={selectedVehicle}
                    onVehicleClick={handleVehicleClick}
                />
            </div>

            {/* Кнопка списка машин */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Предотвращаем всплытие клика
                    setVehicleListOpen(!vehicleListOpen);
                }}
                className="fixed left-4 bottom-4 z-[100] bg-gray-800 dark:bg-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-gray-700 dark:hover:bg-gray-600"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Список машин */}
            {vehicleListOpen && (
                <div 
                    className="fixed left-0 top-16 bottom-0 w-80 bg-gray-800 shadow-lg z-[100]"
                    onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на список
                >
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