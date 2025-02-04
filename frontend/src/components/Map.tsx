import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Vehicle, LocationPoint } from '../types/types';
import { API_URL } from '../config';
import 'leaflet/dist/leaflet.css';

interface MapProps {
    vehicles: Vehicle[];
    selectedVehicle: Vehicle | null;
    onVehicleClick: (vehicle: Vehicle) => void;
    selectedDate?: Date;
}

// Создаем иконки для маркеров
const greenIcon = new L.Icon({
    iconUrl: '/marker-green.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const redIcon = new L.Icon({
    iconUrl: '/marker-red.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const Map: React.FC<MapProps> = ({ vehicles, selectedVehicle, onVehicleClick, selectedDate }) => {
    const mapRef = useRef<L.Map | null>(null);
    const [routePoints, setRoutePoints] = useState<LocationPoint[]>([]);

    const fetchRoute = async (vehicleId: number, date: Date) => {
        try {
            // Используем 2025 год для тестовых данных
            const startTime = new Date(date);
            startTime.setFullYear(2025);
            startTime.setHours(0, 0, 0, 0);
            
            const endTime = new Date(date);
            endTime.setFullYear(2025);
            endTime.setHours(23, 59, 59, 999);

            const url = `${API_URL}/api/vehicles/${vehicleId}/route?` + 
                       `start_time=${startTime.toISOString()}&` +
                       `end_time=${endTime.toISOString()}`;

            console.log('Fetching route:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const error = await response.text();
                console.error('Failed to fetch route:', error);
                throw new Error(`Failed to fetch route: ${error}`);
            }
            
            const points: LocationPoint[] = await response.json();
            console.log('Received route points:', points.length, 'First point:', points[0]);
            setRoutePoints(points);

            if (points.length > 0 && mapRef.current) {
                const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
                console.log('Setting map bounds:', bounds.toString());
                mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            }
        } catch (error) {
            console.error('Error fetching route:', error);
        }
    };

    useEffect(() => {
        console.log('Selected vehicle changed:', selectedVehicle?.id);
        console.log('Selected date:', selectedDate);
        
        if (selectedVehicle) {
            fetchRoute(selectedVehicle.id, selectedDate || new Date());
        } else {
            setRoutePoints([]);
        }
    }, [selectedVehicle, selectedDate]);

    return (
        <MapContainer
            center={[52.52, 13.405]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {routePoints.length > 0 && (
                <>
                    <Polyline
                        positions={routePoints.map(point => [point.lat, point.lng])}
                        color="#2563eb"
                        weight={3}
                        opacity={0.7}
                    />
                    {console.log('Rendering route with', routePoints.length, 'points')}
                </>
            )}

            {vehicles.map((vehicle) => (
                <Marker
                    key={vehicle.id}
                    position={[vehicle.current_location_lat, vehicle.current_location_lng]}
                    icon={vehicle.status === 'online' ? greenIcon : redIcon}
                    eventHandlers={{
                        click: () => {
                            console.log('Vehicle clicked:', vehicle.id);
                            onVehicleClick(vehicle);
                        }
                    }}
                >
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold mb-2">{vehicle.name}</h3>
                            <p>Status: {vehicle.status}</p>
                            <p>Speed: {Math.round(vehicle.speed)} km/h</p>
                            <p>Last Update: {new Date(vehicle.last_update).toLocaleString()}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map; 