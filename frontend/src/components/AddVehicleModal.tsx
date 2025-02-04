import React, { useState } from 'react';

interface AddVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        device_id: '',
        plate_number: '',
        driver_name: '',
        year: new Date().getFullYear(),
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
                    <h2 className="text-xl font-bold text-white">Neues Fahrzeug hinzufügen</h2>
                    <button onClick={onClose} className="text-white hover:text-red-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Fahrzeugname*</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                            placeholder="z.B. Proace, Transit"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Geräte-ID*</label>
                        <input
                            required
                            type="text"
                            value={formData.device_id}
                            onChange={e => setFormData({...formData, device_id: e.target.value})}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                            placeholder="z.B. eqw1054"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Kennzeichen*</label>
                        <input
                            required
                            type="text"
                            value={formData.plate_number}
                            onChange={e => setFormData({...formData, plate_number: e.target.value})}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                            placeholder="z.B. B-EQW1054"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Fahrer</label>
                        <input
                            type="text"
                            value={formData.driver_name}
                            onChange={e => setFormData({...formData, driver_name: e.target.value})}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                            placeholder="Name des Fahrers"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Baujahr</label>
                        <input
                            type="number"
                            value={formData.year}
                            onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        />
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

export default AddVehicleModal; 