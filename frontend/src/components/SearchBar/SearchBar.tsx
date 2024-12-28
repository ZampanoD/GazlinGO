//Компонент поисковой строки для фильтрации минералов по названию.
//Представляет собой простое текстовое поле с автоматической передачей введенного значения в родительский компонент через callback-функцию.
//Использует стилизацию Tailwind CSS для визуального оформления и интерактивных состояний.

import React from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    return (
        <div className="p-4 border-b border-slate-200">
            <input
                type="text"
                placeholder="Поиск минералов..."
                onChange={(e) => onSearch(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
};