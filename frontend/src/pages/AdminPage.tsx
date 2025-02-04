import React, { useState, useEffect } from 'react';
import { Vehicle, Part } from '../types/types';
import Layout from '../components/Layout';
import VehicleModal from '../components/VehicleModal';
import AddVehicleModal from '../components/AddVehicleModal';
import AddPartModal from '../components/AddPartModal';
import PartDetailsModal from '../components/PartDetailsModal';
import { API_URL } from '../config';

const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'vehicles' | 'parts'>('vehicles');
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [parts, setParts] = useState<Part[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
    const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [isPartDetailsModalOpen, setIsPartDetailsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [vehiclesResponse, partsResponse] = await Promise.all([
                fetch(`${API_URL}/api/vehicles/`),
                fetch(`${API_URL}/api/parts/`)
            ]);
            const vehiclesData = await vehiclesResponse.json();
            const partsData = await partsResponse.json();
            
            setVehicles(vehiclesData);
            setParts(partsData);
            setError(null);
        } catch (error) {
            console.error('Error:', error);
            setError('Fehler beim Laden der Daten');
        } finally {
            setLoading(false);
        }
    };

    const handleVehicleClick = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
    };

    const handleSaveVehicle = async (data: Partial<Vehicle>) => {
        if (!selectedVehicle) return;

        try {
            const response = await fetch(`${API_URL}/api/vehicles/${selectedVehicle.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                fetchData();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error saving vehicle:', error);
        }
    };

    const handleMaintenanceUpdate = async (key: string, field: string, value: number, updatedVehicle?: Vehicle) => {
        if (!selectedVehicle) return;

        try {
            const response = await fetch(`${API_URL}/api/vehicles/${selectedVehicle.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedVehicle || selectedVehicle),
            });

            if (response.ok) {
                await fetchData();
                
                const updatedVehicles = await response.json();
                setSelectedVehicle(updatedVehicles);
            }
        } catch (error) {
            console.error('Error updating maintenance:', error);
        }
    };

    const handleAddVehicle = async (data: any) => {
        try {
            const response = await fetch(`${API_URL}/api/vehicles/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                fetchData();
            }
        } catch (error) {
            console.error('Error adding vehicle:', error);
        }
    };

    const handleAddPart = async (data: any) => {
        try {
            const response = await fetch(`${API_URL}/api/parts/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                fetchData();
            }
        } catch (error) {
            console.error('Error adding part:', error);
        }
    };

    const VehicleCard = ({ vehicle, onClick }: { vehicle: Vehicle; onClick: () => void }) => {
        // Вычисляем общее состояние автомобиля
        const calculateOverallStatus = () => {
            const maintenanceItems = [
                { value: vehicle.last_oil_change, interval: 10000 },
                { value: vehicle.last_brake_change, interval: 20000 },
                { value: vehicle.last_timing_belt_change, interval: 60000 },
                { value: vehicle.last_filter_change, interval: 15000 },
                { value: vehicle.last_clutch_change, interval: 80000 },
                { value: vehicle.last_battery_change, interval: 40000 },
                { value: vehicle.last_tires_change, interval: 30000 },
                { value: vehicle.last_shock_absorbers_change, interval: 50000 }
            ];

            let totalPercentage = 0;
            let hasCritical = false;

            maintenanceItems.forEach(item => {
                if (item.value) {
                    const mileageAfterChange = vehicle.mileage - item.value;
                    const remainingMileage = item.interval - mileageAfterChange;
                    const percentage = Math.max(0, Math.min(100, (remainingMileage / item.interval) * 100));
                    totalPercentage += percentage;

                    if (percentage <= 25) {
                        hasCritical = true;
                    }
                }
            });

            const averagePercentage = totalPercentage / maintenanceItems.length;

            return {
                percentage: averagePercentage,
                hasCritical,
                color: averagePercentage > 75 ? 'bg-green-500' : 
                       averagePercentage > 50 ? 'bg-yellow-500' : 
                       averagePercentage > 25 ? 'bg-orange-500' : 
                       'bg-red-500'
            };
        };

        const status = calculateOverallStatus();

        return (
            <div 
                onClick={onClick}
                className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors relative"
            >
                {/* Индикатор критического состояния */}
                {status.hasCritical && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                )}
                
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-white">{vehicle.name}</h3>
                        <div className="text-sm text-gray-400">
                            <div>Fahrer: {vehicle.driver_name}</div>
                            <div>Kennzeichen: {vehicle.plate_number}</div>
                        </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                        vehicle.status === 'online' ? 'bg-green-900 text-green-300' : 
                        'bg-gray-700 text-gray-300'
                    }`}>
                        {vehicle.status}
                    </span>
                </div>

                {/* Полоска общего состояния */}
                <div className="mt-4">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ${status.color}`}
                            style={{ width: `${status.percentage}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        Gesamtzustand: {Math.round(status.percentage)}%
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="p-6 text-white">Laden...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-400">{error}</div>;
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-900 overflow-auto">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('vehicles')}
                                className={`px-4 py-2 rounded-lg text-lg font-medium transition-all
                                    ${activeTab === 'vehicles' 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                Fahrzeuge
                            </button>
                            <button
                                onClick={() => setActiveTab('parts')}
                                className={`px-4 py-2 rounded-lg text-lg font-medium transition-all
                                    ${activeTab === 'parts' 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                Ersatzteile
                            </button>
                        </div>
                        
                        <button
                            onClick={() => activeTab === 'vehicles' ? setIsAddVehicleModalOpen(true) : setIsAddPartModalOpen(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {activeTab === 'vehicles' ? 'Neues Fahrzeug' : 'Neues Ersatzteil'}
                        </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {activeTab === 'vehicles' ? (
                            vehicles.map((vehicle) => (
                                <VehicleCard
                                    key={vehicle.id}
                                    vehicle={vehicle}
                                    onClick={() => handleVehicleClick(vehicle)}
                                />
                            ))
                        ) : (
                            parts.map((part) => (
                                <div
                                    key={part.id}
                                    onClick={() => {
                                        setSelectedPart(part);
                                        setIsPartDetailsModalOpen(true);
                                    }}
                                    className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-all"
                                >
                                    <h3 className="text-lg font-semibold text-white">{part.name}</h3>
                                    <p className="text-gray-400 text-sm">Lagerort: {part.location}</p>
                                    <p className="text-gray-400 text-sm">Bestand: {part.quantity}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {selectedVehicle && (
                <VehicleModal
                    vehicle={selectedVehicle}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveVehicle}
                    onMaintenanceUpdate={handleMaintenanceUpdate}
                />
            )}

            <AddVehicleModal
                isOpen={isAddVehicleModalOpen}
                onClose={() => setIsAddVehicleModalOpen(false)}
                onAdd={handleAddVehicle}
            />

            <AddPartModal
                isOpen={isAddPartModalOpen}
                onClose={() => setIsAddPartModalOpen(false)}
                onAdd={handleAddPart}
                vehicles={vehicles}
            />

            {selectedPart && (
                <PartDetailsModal
                    part={selectedPart}
                    isOpen={isPartDetailsModalOpen}
                    onClose={() => setIsPartDetailsModalOpen(false)}
                    vehicles={vehicles}
                />
            )}
        </Layout>
    );
};

export default AdminPage; 