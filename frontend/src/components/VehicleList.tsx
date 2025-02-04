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
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to control vehicle');
            }

            const data = await response.json();
            console.log('Control response:', data);

            // Ждем немного для визуального эффекта
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error('Error controlling vehicle:', error);
            // Можно добавить уведомление об ошибке здесь
        } finally {
            setLoadingStates(prev => ({ ...prev, [vehicleId]: false }));
        }
    };

    const getButtonStyles = (status: string, isLoading: boolean) => {
        if (isLoading) {
            return 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30';
        }
        return status === 'disabled'
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30';
    };

    const getButtonText = (status: string, isLoading: boolean) => {
        if (isLoading) {
            return 'Processing...';
        }
        return status === 'disabled' ? 'Enable Vehicle' : 'Disable Vehicle';
    };

    return (
        <div className="space-y-3 p-4">
            {vehicles.map((vehicle) => (
                <div
                    key={vehicle.id}
                    onClick={() => onVehicleClick(vehicle)}
                    className={`
                        bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-lg p-4 cursor-pointer
                        border border-gray-700/50 hover:border-purple-500/50
                        transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10
                        ${selectedVehicle?.id === vehicle.id ? 'border-purple-500 shadow-lg shadow-purple-500/20' : ''}
                    `}
                >
                    {/* Заголовок с названием и статусом */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-white text-lg font-medium flex items-center gap-2">
                                <span className="text-purple-400">🚛</span>
                                {vehicle.name}
                                <span className="ml-2 text-sm text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                                    {vehicle.plate_number}
                                </span>
                            </div>
                            <div className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {vehicle.driver_name}
                            </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                            vehicle.status === 'online' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-gray-700/20 text-gray-400 border border-gray-600/30'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                vehicle.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                            }`}></span>
                            {vehicle.status}
                        </span>
                    </div>

                    {/* Информация о скорости и пробеге */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-800">
                            <div className="text-xs text-gray-500 flex items-center gap-2 mb-1">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Geschwindigkeit
                            </div>
                            <div className="text-lg font-medium text-white flex items-baseline gap-1">
                                {Math.round(vehicle.speed)}
                                <span className="text-sm text-gray-400">km/h</span>
                            </div>
                        </div>
                        <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-800">
                            <div className="text-xs text-gray-500 flex items-center gap-2 mb-1">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Tageskilometer
                            </div>
                            <div className="text-lg font-medium text-white flex items-baseline gap-1">
                                {vehicle.daily_mileage?.toLocaleString()}
                                <span className="text-sm text-gray-400">km</span>
                            </div>
                        </div>
                    </div>

                    {/* Обновленная кнопка управления */}
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!loadingStates[vehicle.id]) {
                                    handleControlClick(
                                        vehicle.id,
                                        vehicle.status === 'disabled' ? 'enable' : 'disable'
                                    );
                                }
                            }}
                            disabled={loadingStates[vehicle.id]}
                            className={`
                                px-4 py-2 rounded-full text-sm font-medium
                                transition-all duration-300
                                flex items-center gap-2
                                ${getButtonStyles(vehicle.status, loadingStates[vehicle.id])}
                                ${loadingStates[vehicle.id] ? 'cursor-wait' : 'cursor-pointer'}
                            `}
                        >
                            {loadingStates[vehicle.id] && (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {getButtonText(vehicle.status, loadingStates[vehicle.id])}
                        </button>
                    </div>

                    {/* Индикатор состояния */}
                    {vehicle.status === 'disabled' && (
                        <div className="mt-2 text-center text-sm text-red-400 bg-red-500/10 py-1 rounded-md">
                            Vehicle is currently disabled
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default VehicleList; 