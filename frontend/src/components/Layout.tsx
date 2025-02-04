import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isAdminPage = location.pathname.startsWith('/admin');
    const isInventoryPage = location.pathname.startsWith('/inventory');

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="container mx-auto px-4">
                    <div className="flex items-center h-16">
                        {/* Бургер меню */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center space-x-4 ml-4">
                            <span className="text-xl font-bold text-purple-500">
                                {isAdminPage ? 'Administration' : 'Inventar'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Мобильное меню */}
            {isMobileMenuOpen && (
                <div className="bg-gray-800 border-b border-gray-700">
                    <div className="container mx-auto px-4 py-2">
                        <nav className="space-y-2">
                            <Link
                                to="/dashboard"
                                className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/admin"
                                className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Administration
                            </Link>
                            <Link
                                to="/inventory"
                                className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Inventar
                            </Link>
                        </nav>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-8">
                {children}
            </div>
        </div>
    );
};

export default Layout; 