const isSecure = window.location.protocol === 'https:';
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : `${isSecure ? 'https' : 'http'}://${window.location.hostname}`;

const SOCKET_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:8001'
    : `${isSecure ? 'wss' : 'ws'}://${window.location.hostname}`;

export const API_URL = API_BASE;
export const SOCKET_URL = SOCKET_BASE; 