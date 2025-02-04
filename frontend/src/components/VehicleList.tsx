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
                    className={`bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 
                        rounded-lg overflow-hidden transition-all shadow-lg hover:shadow-blue-500/10 
                        ${selectedVehicle?.id === vehicle.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                    <div 
                        className="p-4 cursor-pointer"
                        onClick={() => onVehicleClick(vehicle)}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="text-lg font-bold text-white">{vehicle.name}</h3>
                                <p className="text-sm text-gray-300">{vehicle.driver_name}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                vehicle.status === 'online' 
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                                {vehicle.status === 'online' ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-400">
                            <div>
                                <p>Geschwindigkeit: {Math.round(vehicle.speed)} km/h</p>
                                <p>Tageskilometer: {vehicle.daily_mileage || 0} km</p>
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
                                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30'
                                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
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