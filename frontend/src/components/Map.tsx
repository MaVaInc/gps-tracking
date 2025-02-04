import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Vehicle } from '../types/types';
import 'leaflet/dist/leaflet.css';

interface MapProps {
    vehicles: Vehicle[];
    selectedVehicle: Vehicle | null;
    onVehicleClick: (vehicle: Vehicle) => void;
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

const Map: React.FC<MapProps> = ({ vehicles, selectedVehicle, onVehicleClick }) => {
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (selectedVehicle && mapRef.current) {
            mapRef.current.setView(
                [selectedVehicle.current_location_lat, selectedVehicle.current_location_lng],
                15
            );
        }
    }, [selectedVehicle]);

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
            {vehicles.map((vehicle) => (
                <Marker
                    key={vehicle.id}
                    position={[vehicle.current_location_lat, vehicle.current_location_lng]}
                    icon={vehicle.status === 'online' ? greenIcon : redIcon}
                    eventHandlers={{
                        click: () => onVehicleClick(vehicle)
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