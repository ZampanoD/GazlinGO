//Компонент для переключения языка интерфейса с визуальным отображением текущего выбора и флагов стран.
//Использует контекст языка для управления переводами и сохраняет выбор пользователя в локальном хранилище.

import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Languages } from '../../contexts/LanguageContext'; // Добавляем импорт типа

interface Language {
    code: Languages;
    name: string;
    flag: string;
}

const availableLanguages: Language[] = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export const LanguageSwitcher = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { currentLanguage, setLanguage } = useLanguage();


    const handleLanguageChange = async (langCode: Languages) => { // Обновляем тип параметра
        setIsLoading(true);
        try {
            await setLanguage(langCode);


        } catch (error) {
            console.error('Error changing language:', error);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative inline-block">
            <select
                value={currentLanguage}
                onChange={(e) => handleLanguageChange(e.target.value as Languages)} // Добавляем приведение типов
                disabled={isLoading}
                className={`
                    appearance-none bg-white
                    border border-gray-300 rounded-lg
                    pl-4 pr-10 py-2
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200
                `}
            >
                {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {`${lang.flag} ${lang.name}`}
                    </option>
                ))}
            </select>

            {isLoading && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
            )}

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
            </div>
        </div>
    );
};

export default LanguageSwitcher;