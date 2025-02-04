import React, { useState, useEffect } from 'react';
import { Part, Vehicle } from '../types/types';

interface PartFormProps {
    part?: Part;
    onSubmit: (data: Partial<Part>) => void;
    onCancel: () => void;
}

const PartForm: React.FC<PartFormProps> = ({ part, onSubmit, onCancel }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicles, setSelectedVehicles] = useState<number[]>(
        part?.compatible_vehicles || []
    );

    useEffect(() => {
        // Загружаем список машин
        fetch('http://localhost:8000/api/vehicles')
            .then(res => res.json())
            .then(data => setVehicles(data));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        onSubmit({
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            quantity: parseInt(formData.get('quantity') as string),
            min_quantity: parseInt(formData.get('min_quantity') as string),
            location: formData.get('location') as string,
            price: parseFloat(formData.get('price') as string),
            compatible_vehicles: selectedVehicles
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {part ? 'Редактировать запчасть' : 'Добавить запчасть'}
                </h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Название</label>
                <input
                    type="text"
                    name="name"
                    defaultValue={part?.name}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Описание</label>
                <textarea
                    name="description"
                    defaultValue={part?.description}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Количество</label>
                    <input
                        type="number"
                        name="quantity"
                        defaultValue={part?.quantity}
                        required
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Цена (€)</label>
                    <input
                        type="number"
                        name="price"
                        defaultValue={part?.price}
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Совместимые машины
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border dark:border-gray-600 rounded-md">
                    {vehicles.map(vehicle => (
                        <label key={vehicle.id} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="compatible_vehicles"
                                value={vehicle.id}
                                defaultChecked={selectedVehicles.includes(vehicle.id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedVehicles([...selectedVehicles, vehicle.id]);
                                    } else {
                                        setSelectedVehicles(selectedVehicles.filter(id => id !== vehicle.id));
                                    }
                                }}
                                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                                {vehicle.name} ({vehicle.plate_number})
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {part ? 'Сохранить' : 'Добавить'}
                </button>
            </div>
        </form>
    );
};

export default PartForm; 