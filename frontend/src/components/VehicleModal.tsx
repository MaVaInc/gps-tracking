import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types/types';

interface VehicleModalProps {
    vehicle: Vehicle;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Vehicle>) => void;
    onMaintenanceUpdate: (key: string, field: string, value: number) => void;
}

const VehicleModal: React.FC<VehicleModalProps> = ({ vehicle, isOpen, onClose, onSave, onMaintenanceUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localVehicle, setLocalVehicle] = useState<Vehicle>(vehicle);
    const [maintenanceData, setMaintenanceData] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        // При открытии модального окна заполняем maintenanceData текущими значениями
        setMaintenanceData({
            oil: vehicle.last_oil_change?.toString() || '',
            brakes: vehicle.last_brake_change?.toString() || '',
            timing_belt: vehicle.last_timing_belt_change?.toString() || '',
            filter: vehicle.last_filter_change?.toString() || '',
            clutch: vehicle.last_clutch_change?.toString() || '',
            battery: vehicle.last_battery_change?.toString() || '',
            tires: vehicle.last_tires_change?.toString() || '',
            shock_absorbers: vehicle.last_shock_absorbers_change?.toString() || ''
        });
        setLocalVehicle(vehicle);
    }, [vehicle]);

    if (!isOpen) return null;

    const maintenanceItems = [
        {
            name: 'Ölwechsel',
            key: 'oil',
            lastChange: localVehicle.last_oil_change,
            nextChange: localVehicle.next_oil_change,
            interval: 10000,
            icon: '🛢️'
        },
        {
            name: 'Bremsen',
            key: 'brakes',
            lastChange: localVehicle.last_brake_change,
            nextChange: localVehicle.next_brake_change,
            interval: 20000,
            icon: '🛑'
        },
        {
            name: 'Zahnriemen',
            key: 'timing_belt',
            lastChange: localVehicle.last_timing_belt_change,
            nextChange: localVehicle.next_timing_belt_change,
            interval: 60000,
            icon: '⚙️'
        },
        {
            name: 'Filter',
            key: 'filter',
            lastChange: localVehicle.last_filter_change,
            nextChange: localVehicle.next_filter_change,
            interval: 15000,
            icon: '🌬️'
        },
        {
            name: 'Kupplung',
            key: 'clutch',
            lastChange: localVehicle.last_clutch_change,
            nextChange: localVehicle.next_clutch_change,
            interval: 80000,
            icon: '🔄'
        },
        {
            name: 'Batterie',
            key: 'battery',
            lastChange: localVehicle.last_battery_change,
            nextChange: localVehicle.next_battery_change,
            interval: 40000,
            icon: '🔋'
        },
        {
            name: 'Reifen',
            key: 'tires',
            lastChange: localVehicle.last_tires_change,
            nextChange: localVehicle.next_tires_change,
            interval: 30000,
            icon: '🛞'
        },
        {
            name: 'Stoßdämpfer',
            key: 'shock_absorbers',
            lastChange: localVehicle.last_shock_absorbers_change,
            nextChange: localVehicle.next_shock_absorbers_change,
            interval: 50000,
            icon: '🔧'
        }
    ];

    const getMaintenanceStatus = (lastChange: number | null, interval: number, currentMileage: number) => {
        if (lastChange === null || lastChange === undefined) {
            return {
                percentage: 0,
                color: 'rgb(75, 85, 99)', // gray-600
                text: 'Keine Daten',
                remaining: 0
            };
        }

        const mileageAfterChange = currentMileage - lastChange;
        const remainingMileage = interval - mileageAfterChange;
        const percentage = Math.max(0, Math.min(100, (remainingMileage / interval) * 100));

        let color;
        let text;

        if (percentage <= 25) {
            color = 'rgb(239, 68, 68)'; // red-500
            text = 'Kritisch';
        } else if (percentage <= 50) {
            color = 'rgb(249, 115, 22)'; // orange-500
            text = 'Warnung';
        } else if (percentage <= 75) {
            color = 'rgb(234, 179, 8)'; // yellow-500
            text = 'Beachten';
        } else {
            color = 'rgb(34, 197, 94)'; // green-500
            text = 'Gut';
        }

        return {
            percentage,
            color,
            text,
            remaining: Math.max(0, remainingMileage)
        };
    };

    const handleInputChange = (key: string, value: string) => {
        // Просто обновляем локальное состояние, без отправки на сервер
        setMaintenanceData({
            ...maintenanceData,
            [key]: value
        });
    };

    const handleFinishEditing = () => {
        const updatedVehicle = { ...localVehicle };
        
        // Обновляем все поля из maintenanceData
        Object.entries(maintenanceData).forEach(([key, value]) => {
            if (value !== '') {
                const numValue = parseInt(value);
                switch (key) {
                    case 'oil':
                        updatedVehicle.last_oil_change = numValue;
                        updatedVehicle.next_oil_change = numValue + 10000;
                        break;
                    case 'brakes':
                        updatedVehicle.last_brake_change = numValue;
                        updatedVehicle.next_brake_change = numValue + 20000;
                        break;
                    case 'timing_belt':
                        updatedVehicle.last_timing_belt_change = numValue;
                        updatedVehicle.next_timing_belt_change = numValue + 60000;
                        break;
                    case 'filter':
                        updatedVehicle.last_filter_change = numValue;
                        updatedVehicle.next_filter_change = numValue + 15000;
                        break;
                    case 'clutch':
                        updatedVehicle.last_clutch_change = numValue;
                        updatedVehicle.next_clutch_change = numValue + 80000;
                        break;
                    case 'battery':
                        updatedVehicle.last_battery_change = numValue;
                        updatedVehicle.next_battery_change = numValue + 40000;
                        break;
                    case 'tires':
                        updatedVehicle.last_tires_change = numValue;
                        updatedVehicle.next_tires_change = numValue + 30000;
                        break;
                    case 'shock_absorbers':
                        updatedVehicle.last_shock_absorbers_change = numValue;
                        updatedVehicle.next_shock_absorbers_change = numValue + 50000;
                        break;
                }
            }
        });

        // Отправляем обновленный объект на сервер
        onMaintenanceUpdate('all', 'update', 0, updatedVehicle);
        setIsEditing(false);
    };

    const handleSave = () => {
        onSave(localVehicle);
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden border border-purple-500">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {vehicle.name}
                        <span className="text-sm px-2 py-1 bg-black bg-opacity-30 rounded">
                            {vehicle.plate_number}
                        </span>
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-red-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm text-gray-400">Fahrer</label>
                            <input
                                type="text"
                                defaultValue={vehicle.driver_name}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400">Kilometerstand</label>
                            <input
                                type="number"
                                defaultValue={vehicle.mileage}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Wartung</h3>
                            <button 
                                onClick={() => {
                                    if (isEditing) {
                                        handleFinishEditing();  // Если редактируем - сохраняем
                                    } else {
                                        setIsEditing(true);     // Если не редактируем - включаем режим редактирования
                                    }
                                }}
                                className="text-sm px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
                            >
                                {isEditing ? 'Fertig' : 'Bearbeiten'}
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {maintenanceItems.map(item => {
                                const status = getMaintenanceStatus(
                                    item.lastChange,
                                    item.interval,
                                    vehicle.mileage
                                );

                                return (
                                    <div key={item.key} className="group">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-sm text-gray-300 min-w-[100px] flex items-center gap-2">
                                                {item.icon} {item.name}
                                            </span>
                                            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full transition-all duration-500"
                                                    style={{ 
                                                        width: `${status.percentage}%`,
                                                        backgroundColor: status.color
                                                    }}
                                                />
                                            </div>
                                            <span className={`text-xs min-w-[80px] text-right`} style={{ color: status.color }}>
                                                {status.remaining.toLocaleString()} km
                                            </span>
                                            <span className={`text-xs min-w-[60px] text-right`} style={{ color: status.color }}>
                                                {status.text}
                                            </span>
                                        </div>
                                        
                                        {isEditing && (
                                            <div className="grid grid-cols-2 gap-2 pl-[100px] mt-2">
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={maintenanceData[item.key] || ''}
                                                        onChange={(e) => handleInputChange(item.key, e.target.value)}
                                                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                                                        placeholder="Kilometerstand"
                                                    />
                                                </div>
                                                <div className="text-sm text-gray-400 flex items-center">
                                                    Intervall: {item.interval.toLocaleString()} km
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white"
                    >
                        Abbrechen
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded hover:from-purple-700 hover:to-blue-700"
                    >
                        Speichern
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VehicleModal; 