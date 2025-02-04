import { useState, useEffect } from 'react';
import { Part, Vehicle } from '../types/types';
import { getVehicles, getParts } from '../services/api';
import Layout from '../components/Layout';
import PartForm from '../components/PartForm';

const InventoryPage = () => {
    const [parts, setParts] = useState<Part[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [showCompatibleVehicles, setShowCompatibleVehicles] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [partsData, vehiclesData] = await Promise.all([
                    getParts(),
                    getVehicles()
                ]);
                setParts(partsData);
                setVehicles(vehiclesData);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Fehler beim Laden der Daten');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddPart = (newPart: Omit<Part, 'id'>) => {
        const part: Part = {
            ...newPart,
            id: (parts.length + 1).toString()
        };
        setParts([...parts, part]);
        setShowAddModal(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const newPart: Omit<Part, 'id'> = {
            name: formData.get('name') as string,
            description: formData.get('description') as string || '',
            quantity: parseInt(formData.get('quantity') as string) || 1,
            price: parseFloat(formData.get('price') as string) || 1,
            compatible_vehicles: Array.from(formData.getAll('compatible_vehicles')).map(id => Number(id)),
            min_quantity: 1,
            location: ''
        };

        try {
            const response = await fetch('http://localhost:8000/api/parts/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPart),
            });

            if (response.ok) {
                const savedPart = await response.json();
                setParts(prevParts => [...prevParts, savedPart]);
                setShowAddModal(false);
                const updatedParts = await getParts();
                setParts(updatedParts);
            } else {
                const errorData = await response.json();
                console.error('Failed to save part:', errorData);
            }
        } catch (error) {
            console.error('Error saving part:', error);
        }
    };

    const CompatibleVehiclesModal = () => {
        if (!selectedPart) return null;
        
        const compatibleVehicles = vehicles.filter(v => 
            selectedPart.compatible_vehicles?.includes(v.id)
        );

        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-gray-900 rounded-xl w-full max-w-md shadow-2xl border border-purple-500">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-white">Kompatible Fahrzeuge</h3>
                            <button
                                onClick={() => setShowCompatibleVehicles(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-2">
                            {compatibleVehicles.length > 0 ? (
                                compatibleVehicles.map(vehicle => (
                                    <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                                        <div>
                                            <div className="font-medium text-white">{vehicle.name}</div>
                                            <div className="text-sm text-gray-400">{vehicle.plate_number}</div>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${
                                            vehicle.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                                        }`} />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-400">
                                    Keine kompatiblen Fahrzeuge gefunden
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const filteredParts = parts.filter(part =>
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Layout>Laden...</Layout>;
    if (error) return <Layout>Fehler: {error}</Layout>;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Поисковая строка */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                    <div className="absolute right-3 top-2.5 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Кнопка добавления */}
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer font-medium"
                >
                    Neues Teil hinzufügen
                </button>

                {/* Список запчастей */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredParts.map(part => (
                        <div key={part.id} className="bg-gray-800 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium text-white">{part.name}</h3>
                                    <p className="text-gray-400">{part.description}</p>
                                </div>
                                <div className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded text-sm">
                                    {part.quantity} Stk.
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {part.location}
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {part.price} €
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedPart(part);
                                    setShowCompatibleVehicles(true);
                                }}
                                className="text-purple-400 hover:text-purple-300 text-sm"
                            >
                                Kompatible Fahrzeuge anzeigen
                            </button>
                        </div>
                    ))}
                </div>

                {/* Модальное окно добавления */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-900 rounded-xl w-full max-w-md shadow-2xl border border-purple-500">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Имя */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 font-medium"
                                        placeholder="Teilename"
                                        required
                                    />
                                </div>

                                {/* Описание (опционально) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Beschreibung <span className="text-gray-500">(optional)</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 font-medium"
                                        rows={3}
                                        placeholder="Beschreibung des Teils"
                                    />
                                </div>

                                {/* Количество и цена */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Menge</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 font-medium"
                                            defaultValue="1"
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Preis (€)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 font-medium"
                                            defaultValue="1.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Совместимые машины */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Kompatible Fahrzeuge</label>
                                    <div className="max-h-48 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg p-2 space-y-2">
                                        {vehicles.map(vehicle => (
                                            <label key={vehicle.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-700 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    name="compatible_vehicles"
                                                    value={vehicle.id}
                                                    className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 text-purple-500 rounded focus:ring-purple-500 focus:ring-offset-gray-800"
                                                />
                                                <span className="text-gray-300 font-medium">{vehicle.name} ({vehicle.plate_number})</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Кнопки */}
                                <div className="bg-gray-800 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 text-gray-400 hover:text-white font-medium"
                                    >
                                        Abbrechen
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
                                    >
                                        Hinzufügen
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Модальное окно совместимых машин */}
                {showCompatibleVehicles && selectedPart && (
                    <CompatibleVehiclesModal />
                )}
            </div>
        </Layout>
    );
};

export default InventoryPage; 