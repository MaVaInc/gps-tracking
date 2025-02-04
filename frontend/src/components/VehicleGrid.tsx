import { Vehicle } from '../types/types';
import { Link } from 'react-router-dom';

interface VehicleGridProps {
    vehicles: Vehicle[];
}

const VehicleGrid = ({ vehicles }: VehicleGridProps) => {
    const getServiceStatus = (vehicle: Vehicle) => {
        const now = Date.now();
        const tuvDate = new Date(vehicle.nextTuv).getTime();
        const daysUntilTuv = Math.floor((tuvDate - now) / (1000 * 60 * 60 * 24));

        // Определяем цвет статуса
        if (daysUntilTuv <= 30) return 'bg-red-500';
        if (daysUntilTuv <= 90) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {vehicles.map((vehicle) => (
                <Link
                    to={`/vehicles/${vehicle.id}`}
                    key={vehicle.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{vehicle.name}</h3>
                            <div className={`w-3 h-3 rounded-full ${vehicle.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-600">
                                Пробег: <span className="font-semibold">{vehicle.mileage.toLocaleString()} км</span>
                            </p>
                            <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full ${getServiceStatus(vehicle)} mr-2`} />
                                <p className="text-sm">
                                    TÜV: {new Date(vehicle.nextTuv).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Следующее ТО:</span>
                            <span className="font-medium">
                                {Math.min(
                                    vehicle.nextService.brakes,
                                    vehicle.nextService.oil,
                                    vehicle.nextService.transmission
                                ).toLocaleString()}{' '}
                                км
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default VehicleGrid; 