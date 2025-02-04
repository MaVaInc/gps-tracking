import React from 'react';
import { Vehicle } from '../types/types';

interface AddVehicleFormProps {
    onSave: (data: Partial<Vehicle>) => void;
    onCancel: () => void;
}

const AddVehicleForm: React.FC<AddVehicleFormProps> = ({ onSave, onCancel }) => {
    const vehicleModels = ["Toyota Proace", "Ford Transit"]; // Можно вынести в отдельный справочник

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSave({
                name: formData.get('name') as string,
                year: Number(formData.get('year')),
                plate_number: formData.get('plate_number') as string,
                mileage: Number(formData.get('mileage')),
                status: 'offline',
                speed: 0,
                current_location_lat: 0,
                current_location_lng: 0
            });
        }} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Добавить транспорт
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Модель</label>
                <div className="mt-1 flex gap-2">
                    <select
                        name="name"
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                        {vehicleModels.map(model => (
                            <option key={model} value={model}>{model}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        onClick={() => {
                            const newModel = prompt('Введите новую модель:');
                            if (newModel) {
                                vehicleModels.push(newModel);
                                // TODO: Сохранить в базу
                            }
                        }}
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Год выпуска</label>
                    <input
                        type="number"
                        name="year"
                        required
                        min="1900"
                        max={new Date().getFullYear()}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Номерной знак</label>
                    <input
                        type="text"
                        name="plate_number"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Пробег (км)</label>
                <input
                    type="number"
                    name="mileage"
                    required
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
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
                    Добавить
                </button>
            </div>
        </form>
    );
};

export default AddVehicleForm; 