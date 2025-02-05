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

    const handleControl = async (vehicleId: number, action: 'enable' | 'disable') => {
        try {
            const response = await fetch(`${API_URL}/api/vehicles/${vehicleId}/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            });
            
            if (!response.ok) {
                throw new Error('Failed to control vehicle');
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Error controlling vehicle:', error);
        }
    };

    return (
        <div className="space-y-2 p-2 pb-16 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
            {vehicles.map((vehicle) => (
                <div
                    key={vehicle.id}
                    className={`bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg overflow-hidden transition-all ${
                        selectedVehicle?.id === vehicle.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                >
                    <div 
                        className="p-3 cursor-pointer"
                        onClick={() => onVehicleClick(vehicle)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-lg font-bold text-white">{vehicle.name}</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>{vehicle.driver_name}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    <span>{vehicle.plate_number}</span>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                vehicle.status === 'online' 
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                                {vehicle.status === 'online' ? 'Online' : 'Offline'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 9l-7 7-7-7" />
                                </svg>
                                <div>
                                    <div className="text-gray-400">Geschwindigkeit</div>
                                    <div className="text-white">{Math.round(vehicle.speed)} km/h</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <div>
                                    <div className="text-gray-400">Tageskilometer</div>
                                    <div className="text-white">{vehicle.daily_mileage || 0} km</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-3 pb-3">
                        <button
                            onClick={() => handleControl(
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