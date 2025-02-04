import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMapCache } from '../hooks/useMapCache';

// Исправляем проблему с иконками Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
});

interface Vehicle {
    id: number;
    name: string;
    current_location_lat: number;
    current_location_lng: number;
    status: string;
}

interface MapProps {
    vehicles: Vehicle[];
    selectedVehicle: Vehicle | null;
    onVehicleClick: (vehicle: Vehicle) => void;
}

// Компонент для управления картой и кешированием
const MapController: React.FC<{ selectedVehicle: Vehicle | null }> = ({ selectedVehicle }) => {
    const map = useMap();
    const [mapCache, updateMapCache] = useMapCache({
        maxAge: 1000 * 60 * 60, // 1 час
        key: 'map-view-cache'
    });

    // Применяем кешированные настройки при первой загрузке
    useEffect(() => {
        if (mapCache && !selectedVehicle) {
            map.setView(mapCache.center, mapCache.zoom);
        }
    }, [mapCache, map]);

    // Следим за выбранным транспортом
    useEffect(() => {
        if (selectedVehicle) {
            map.setView(
                [selectedVehicle.current_location_lat, selectedVehicle.current_location_lng],
                13,
                { animate: true }
            );
        }
    }, [selectedVehicle, map]);

    // Сохраняем состояние карты при изменениях
    useEffect(() => {
        const handleMapMove = () => {
            updateMapCache({
                center: map.getCenter(),
                zoom: map.getZoom(),
                bounds: map.getBounds()
            });
        };

        map.on('moveend', handleMapMove);
        return () => {
            map.off('moveend', handleMapMove);
        };
    }, [map, updateMapCache]);

    return null;
};

const Map: React.FC<MapProps> = ({ vehicles, selectedVehicle, onVehicleClick }) => {
    const center = { lat: 52.5200, lng: 13.4050 }; // Berlin center

    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
        >
            <MapController selectedVehicle={selectedVehicle} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {vehicles.map((vehicle) => (
                vehicle.current_location_lat && vehicle.current_location_lng ? (
                    <Marker
                        key={vehicle.id}
                        position={[vehicle.current_location_lat, vehicle.current_location_lng]}
                        eventHandlers={{
                            click: () => onVehicleClick(vehicle)
                        }}
                    >
                        <Popup>
                            <div>
                                <h3 className="font-bold">{vehicle.name}</h3>
                                <p>Status: {vehicle.status}</p>
                            </div>
                        </Popup>
                    </Marker>
                ) : null
            ))}
        </MapContainer>
    );
};

export default Map; 