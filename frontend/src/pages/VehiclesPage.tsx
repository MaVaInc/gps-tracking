import { useState, useEffect } from 'react';
import { Vehicle } from '../types/types';
import { getVehicles } from '../services/api';
import { VehicleHealthIndicator } from '../components/VehicleHealthIndicator';
import { VehicleDetailsModal } from '../components/VehicleDetailsModal';
import { VehicleCard } from '../components/VehicleCard';

const VehiclesPage = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    useEffect(() => {
        fetchVehicles();
        const interval = setInterval(fetchVehicles, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await fetch('http://localhost:8001/analytics/fleet/overview');
            const data = await response.json();
            setVehicles(data.vehicles);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            setError('Ошибка загрузки данных');
            setLoading(false);
        }
    };

    const handleImmobilize = async (deviceId: string, command: 'immobilize' | 'mobilize') => {
        try {
            await fetch(`http://localhost:8001/vehicle/${deviceId}/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command }),
            });
            
            // Обновляем данные после команды
            fetchVehicles();
        } catch (error) {
            console.error('Error controlling vehicle:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Транспорт
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(vehicle => (
                    <VehicleCard
                        key={vehicle.device_id}
                        vehicle={vehicle}
                        onImmobilize={handleImmobilize}
                    />
                ))}
            </div>

            {selectedVehicle && (
                <VehicleDetailsModal
                    vehicle={selectedVehicle}
                    onClose={() => setSelectedVehicle(null)}
                />
            )}
        </div>
    );
};

export default VehiclesPage; 