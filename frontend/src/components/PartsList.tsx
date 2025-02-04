import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Part {
  id: number;
  name: string;
  quantity: number;
  min_quantity: number;
  location: string;
}

interface PartsListProps {
  parts: Part[];
}

const PartsList: React.FC<PartsListProps> = ({ parts }) => {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4">
      {parts.map((part) => (
        <button
          key={part.id}
          onClick={() => navigate(`/admin/parts/${part.id}/edit`)}
          className="w-full text-left bg-white dark:bg-gray-800 p-4 rounded-lg shadow 
            hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 
            active:bg-gray-100 dark:active:bg-gray-600 
            transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{part.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">Lagerort: {part.location}</p>
              <p className="text-gray-600 dark:text-gray-400">
                Bestand: {part.quantity} 
                {part.quantity <= part.min_quantity && (
                  <span className="ml-2 text-red-600">
                    (Nachbestellen erforderlich)
                  </span>
                )}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default PartsList; 