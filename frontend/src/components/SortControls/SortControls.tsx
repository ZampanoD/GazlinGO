import React from 'react';

type SortOption = 'az' | 'za' | 'newest' | 'oldest' | 'favorites';

interface SortControlsProps {
    onSort: (option: SortOption) => void;
    currentSort: SortOption;
    showFavorites: boolean;
    className?: string;
}

export const SortControls: React.FC<SortControlsProps> = ({ onSort, currentSort, showFavorites, className }) => {
    return (
        <div className={`px-4 py-2 ${className}`}>
            <select
                value={currentSort}
                onChange={(e) => onSort(e.target.value as SortOption)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
                <option value="az">По алфавиту (А-Я)</option>
                <option value="za">По алфавиту (Я-А)</option>
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
                {showFavorites && <option value="favorites">Избранное</option>}
            </select>
        </div>
    );
};