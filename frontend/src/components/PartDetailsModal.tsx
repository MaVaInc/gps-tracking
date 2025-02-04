import React from 'react';
import { Part, Vehicle } from '../types/types';

interface PartDetailsModalProps {
    part: Part;
    isOpen: boolean;
    onClose: () => void;
    vehicles: Vehicle[];  // Для отображения совместимых машин
}

const PartDetailsModal: React.FC<PartDetailsModalProps> = ({ part, isOpen, onClose, vehicles }) => {
    if (!isOpen) return null;

    // Находим совместимые машины
    const compatibleVehicles = vehicles.filter(v => 
        part.compatible_vehicles.includes(v.device_id)
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden border border-purple-500">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">{part.name}</h2>
                    <button onClick={onClose} className="text-white hover:text-red-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Beschreibung</h3>
                        <p className="text-gray-300">{part.description || 'Keine Beschreibung verfügbar'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Details</h3>
                            <div className="space-y-2 text-gray-300">
                                <p>Aktueller Bestand: {part.quantity}</p>
                                <p>Mindestbestand: {part.min_quantity}</p>
                                <p>Preis: {part.price.toFixed(2)} €</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Kompatible Fahrzeuge</h3>
                            <div className="space-y-1">
                                {compatibleVehicles.length > 0 ? (
                                    compatibleVehicles.map(vehicle => (
                                        <div 
                                            key={vehicle.device_id} 
                                            className="text-gray-300 bg-gray-800 p-2 rounded"
                                        >
                                            {vehicle.name} ({vehicle.plate_number})
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">Keine kompatiblen Fahrzeuge angegeben</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartDetailsModal; 