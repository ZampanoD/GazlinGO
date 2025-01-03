//Компонент выпадающего списка для сортировки минералов по различным критериям (алфавит, дата, избранное).
//Адаптируется к правам пользователя, показывая опцию избранного только для авторизованных пользователей.
//Интегрируется с системой переводов для отображения опций сортировки на выбранном языке.

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SortControlsProps {
    onSort: (option: 'az' | 'za' | 'newest' | 'oldest' | 'favorites') => void;
    currentSort: 'az' | 'za' | 'newest' | 'oldest' | 'favorites';
    showFavorites: boolean;
    className?: string;
}

export const SortControls: React.FC<SortControlsProps> = ({
                                                              onSort,
                                                              currentSort,
                                                              showFavorites,
                                                              className
                                                          }) => {
    const { t } = useLanguage();

    return (
        <div className={className}>
            <select
                value={currentSort}
                onChange={(e) => onSort(e.target.value as 'az' | 'za' | 'newest' | 'oldest' | 'favorites')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
                <option value="az">{t('sort.az')}</option>
                <option value="za">{t('sort.za')}</option>
                <option value="newest">{t('sort.newest')}</option>
                <option value="oldest">{t('sort.oldest')}</option>
                {showFavorites && <option value="favorites">{t('sort.favorites')}</option>}
            </select>
        </div>
    );
};