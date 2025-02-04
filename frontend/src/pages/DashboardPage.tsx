import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types/types';
import Map from '../components/Map';
import VehicleList from '../components/VehicleList';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { API_URL } from '../config';

const DashboardPage: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [vehicleListOpen, setVehicleListOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Периодическое обновление данных
    useEffect(() => {
        // Начальная загрузка
        fetchVehicles();

        // Обновление каждые 2 секунды
        const interval = setInterval(() => {
            fetchVehicles();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await fetch(`${API_URL}/api/vehicles/`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setVehicles(data);

            // Обновляем выбранную машину если она есть
            if (selectedVehicle) {
                const updated = data.find(v => v.id === selectedVehicle.id);
                if (updated) {
                    setSelectedVehicle(updated);
                }
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
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
                    selectedDate={selectedDate}
                />
            </div>

            {/* Добавляем выбор даты */}
            {selectedVehicle && (
                <div className="fixed right-4 top-20 z-[100] bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold mb-2">Route Date</h3>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date) => setSelectedDate(date)}
                        dateFormat="dd.MM.yyyy"
                        className="border rounded p-2"
                    />
                </div>
            )}

            <div className="fixed left-4 bottom-4 z-[100] flex flex-col items-start space-y-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setVehicleListOpen(!vehicleListOpen);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span>Fahrzeuge anzeigen</span>
                </button>
            </div>

            {vehicleListOpen && (
                <div className="fixed left-0 top-16 bottom-0 w-80 bg-gray-800 shadow-lg z-[100]">
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <h2 className="text-white font-bold">Fahrzeuge</h2>
                        <button
                            onClick={() => setVehicleListOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
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