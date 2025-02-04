import React, { useState } from 'react';
import { Vehicle } from '../types/types';
import { API_URL } from '../config';

interface VehicleListProps {
    vehicles: Vehicle[];
    selectedVehicle: Vehicle | null;
    onVehicleClick: (vehicle: Vehicle) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, selectedVehicle, onVehicleClick }) => {
    const [loadingStates, setLoadingStates] = useState<{[key: number]: boolean}>({});

    const handleControlClick = async (vehicleId: number, action: 'enable' | 'disable') => {
        try {
            setLoadingStates(prev => ({ ...prev, [vehicleId]: true }));
            
            const response = await fetch(`${API_URL}/api/vehicles/${vehicleId}/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action })
            });
            
            if (!response.ok) {
                throw new Error('Failed to control vehicle');
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Error controlling vehicle:', error);
        } finally {
            setLoadingStates(prev => ({ ...prev, [vehicleId]: false }));
        }
    };

    return (
        <div className="space-y-4 p-4">
            {vehicles.map((vehicle) => (
                <div
                    key={vehicle.id}
                    className={`bg-gray-800 hover:bg-gray-700 rounded-lg overflow-hidden transition-all ${
                        selectedVehicle?.id === vehicle.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                >
                    <div 
                        className="p-4 cursor-pointer"
                        onClick={() => onVehicleClick(vehicle)}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <div className="text-gray-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                            d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{vehicle.name}</h3>
                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>{vehicle.driver_name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                        </svg>
                                        <span>{vehicle.plate_number}</span>
                                    </div>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                vehicle.status === 'online' 
                                    ? 'bg-green-900 text-green-300' 
                                    : 'bg-red-900 text-red-300'
                            }`}>
                                {vehicle.status === 'online' ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                            <div className="flex items-center space-x-2 text-sm">
                                <div className="text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-gray-400">Geschwindigkeit</div>
                                    <div className="text-white font-medium">{Math.round(vehicle.speed)} km/h</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <div className="text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-gray-400">Tageskilometer</div>
                                    <div className="text-white font-medium">{vehicle.daily_mileage || 0} km</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 pb-4">
                        <button
                            onClick={() => handleControlClick(
                                vehicle.id,
                                vehicle.status === 'disabled' ? 'enable' : 'disable'
                            )}
                            disabled={loadingStates[vehicle.id]}
                            className={`w-full py-2 rounded-lg font-medium transition-colors ${
                                vehicle.status === 'disabled'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                            } ${loadingStates[vehicle.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loadingStates[vehicle.id]
                                ? 'Processing...'
                                : vehicle.status === 'disabled'
                                    ? 'Enable Vehicle'
                                    : 'Disable Vehicle'
                            }
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VehicleList; 