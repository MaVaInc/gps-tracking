import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(() => 
        localStorage.theme === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [isDark]);

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
                                GPS Tracking
                            </Link>
                        </div>
                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center px-1 pt-1 text-gray-900 dark:text-gray-100"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/vehicles"
                                className="inline-flex items-center px-1 pt-1 text-gray-900 dark:text-gray-100"
                            >
                                Транспорт
                            </Link>
                            <Link
                                to="/inventory"
                                className="inline-flex items-center px-1 pt-1 text-gray-900 dark:text-gray-100"
                            >
                                Инвентарь
                            </Link>
                            <Link
                                to="/admin"
                                className="inline-flex items-center px-1 pt-1 text-gray-900 dark:text-gray-100"
                            >
                                Администрирование
                            </Link>
                        </div>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <span className="sr-only">Открыть меню</span>
                            {!isMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            to="/dashboard"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/vehicles"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Транспорт
                        </Link>
                        <Link
                            to="/inventory"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Инвентарь
                        </Link>
                        <Link
                            to="/admin"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Администрирование
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation; 