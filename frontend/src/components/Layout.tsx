import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-900">
            <nav className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-14">
                        <div className="flex items-center">
                            <span className="text-white text-lg font-bold">
                                WAIS Kurierdienst
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Link
                                to="/"
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                                    location.pathname === '/'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/admin"
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                                    location.pathname === '/admin'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                Admin
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="pt-14">
                {children}
            </main>
        </div>
    );
};

export default Layout; 