import React, { useState } from 'react';

interface AddPartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => void;
    vehicles: Vehicle[];
}

const AddPartModal: React.FC<AddPartModalProps> = ({ isOpen, onClose, onAdd, vehicles }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        quantity: 1,
        min_quantity: 1,
        price: 0,
        compatible_vehicles: [] as string[]
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-purple-500">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Neues Ersatzteil hinzufügen</h2>
                    <button onClick={onClose} className="text-white hover:text-red-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Name*</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                            placeholder="z.B. Bremsbeläge"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Beschreibung</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Bestand*</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Mindestbestand</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.min_quantity}
                                onChange={e => setFormData({...formData, min_quantity: parseInt(e.target.value)})}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Preis (€)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Kompatible Fahrzeuge* (Mehrfachauswahl möglich)
                        </label>
                        <div className="max-h-40 overflow-y-auto bg-gray-800 border border-gray-700 rounded p-2">
                            {vehicles.map(vehicle => (
                                <label key={vehicle.device_id} className="flex items-center space-x-2 p-1 hover:bg-gray-700 rounded">
                                    <input
                                        type="checkbox"
                                        checked={formData.compatible_vehicles.includes(vehicle.device_id)}
                                        onChange={(e) => {
                                            const newCompatible = e.target.checked
                                                ? [...formData.compatible_vehicles, vehicle.device_id]
                                                : formData.compatible_vehicles.filter(id => id !== vehicle.device_id);
                                            setFormData({...formData, compatible_vehicles: newCompatible});
                                        }}
                                        className="text-purple-600 bg-gray-700 border-gray-600 rounded"
                                    />
                                    <span className="text-white text-sm">
                                        {vehicle.name} ({vehicle.plate_number})
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
                        >
                            Hinzufügen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPartModal; 