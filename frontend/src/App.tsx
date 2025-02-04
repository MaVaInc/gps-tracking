import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './components/Login';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import InventoryPage from './pages/InventoryPage';

const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const auth = localStorage.getItem('isAuthenticated') === 'true';
        setIsAuthenticated(auth);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {children}
        </div>
    );
};

const App = () => {
    return (
        <BrowserRouter future={{ v7_startTransition: true }}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateLayout>
                            <DashboardPage />
                        </PrivateLayout>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <PrivateLayout>
                            <AdminPage />
                        </PrivateLayout>
                    }
                />
                <Route
                    path="/inventory"
                    element={
                        <PrivateLayout>
                            <InventoryPage />
                        </PrivateLayout>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
