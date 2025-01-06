//Компонент для отображения списка минералов в боковой панели приложения.
//Реализует отзывчивый интерфейс с предпросмотром изображений, анимированными состояниями загрузки (skeleton loading)
//И условным рендерингом кнопок управления для администраторов.
//Включает обработку ошибок загрузки изображений с fallback на placeholder,
//поддержку hover-эффектов и оптимизацию производительности через правильную обработку событий.
//Особое внимание уделено доступности и пользовательскому опыту с анимированными переходами и четкой визуальной иерархией

import { useAuth } from '../hooks/useAuth'
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Mineral {
    id: number;
    title: string;
    description: string;
    preview_image_path: string;
    model_path: string;
    created_at: string;
}

interface MineralsListProps {
    minerals: Mineral[];
    onSelectMineral: (mineral: Mineral) => void;
    onDeleteClick: (mineral: Mineral) => void;
    isLoading?: boolean;
}

export const MineralsList: React.FC<MineralsListProps> = ({
                                                              minerals,
                                                              onSelectMineral,
                                                              onDeleteClick,
                                                              isLoading = false
                                                          }) => {
    const { isAdmin } = useAuth();
    const { t } = useLanguage();
    const baseUrl = 'http://localhost:8080';

    if (isLoading) {
        return (
            <div className="space-y-4 px-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded p-4 animate-pulse">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0" />
                            <div className="h-4 bg-gray-200 rounded w-2/3 flex-1" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-2 min-w-0 relative">
            {minerals.map(mineral => (
                <div
                    key={mineral.id}
                    className="bg-white border rounded-lg p-4 cursor-pointer flex items-center space-x-4 hover:bg-slate-50 group"
                    onClick={() => onSelectMineral(mineral)}
                >
                    <div className="w-10 h-10 flex-shrink-0">
                        <img
                            src={`${baseUrl}${mineral.preview_image_path}`}
                            alt={mineral.title}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = '/placeholder.png';
                            }}
                        />
                    </div>
                    <h3 className="font-bold flex-1 truncate min-w-0">{mineral.title}</h3>
                    {isAdmin && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(mineral);
                            }}
                            className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
                            title={t('delete')}
                        >
                            {t('delete')}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};