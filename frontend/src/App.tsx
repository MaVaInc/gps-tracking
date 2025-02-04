import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

function App() {
    const [isAuth, setIsAuth] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'wais' && password === 'besser') {
            setIsAuth(true);
            localStorage.setItem('isAuth', 'true');
        }
    };

    useEffect(() => {
        const auth = localStorage.getItem('isAuth') === 'true';
        setIsAuth(auth);
    }, []);

    if (!isAuth) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-6">Вход в систему</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Имя пользователя"
                                className="w-full p-3 bg-gray-700 text-white rounded"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Пароль"
                                className="w-full p-3 bg-gray-700 text-white rounded"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-colors"
                        >
                            Войти
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
                {/* Редиректим все остальные пути на дашборд */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
