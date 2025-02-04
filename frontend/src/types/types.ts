export interface Vehicle {
    id: number;
    name: string;
    device_id: string;
    plate_number: string;
    driver_name: string;
    status: string;
    speed: number;
    daily_mileage: number;
    current_location_lat: number;
    current_location_lng: number;
    last_update: string;
    // Поля для обслуживания
    mileage: number;
    last_oil_change?: number | null;
    next_oil_change?: number | null;
    last_brake_change?: number | null;
    next_brake_change?: number | null;
    last_filter_change?: number | null;
    next_filter_change?: number | null;
    last_timing_belt_change?: number | null;
    next_timing_belt_change?: number | null;
    last_clutch_change?: number | null;
    next_clutch_change?: number | null;
    last_battery_change?: number | null;
    next_battery_change?: number | null;
    last_tires_change?: number | null;
    next_tires_change?: number | null;
    last_shock_absorbers_change?: number | null;
    next_shock_absorbers_change?: number | null;
}

export interface ServiceRecord {
    id: string;
    date: Date;
    type: 'brakes' | 'oil' | 'transmission' | 'other';
    mileage: number;
    description: string;
    cost: number;
}

export interface Part {
    id: number;
    name: string;
    description: string;
    quantity: number;
    price: number;
    min_quantity: number;
    compatible_vehicles: number[];
}

export interface RouteHistory {
    vehicleId: number;
    date: Date;
    points: {
        lat: number;
        lng: number;
        timestamp: Date;
        speed: number;
    }[];
}

export interface LocationPoint {
    lat: number;
    lng: number;
    speed: number;
    timestamp: string;
}

export interface RouteData {
    points: LocationPoint[];
    bounds: [[number, number], [number, number]]; // [[minLat, minLng], [maxLat, maxLng]]
} 