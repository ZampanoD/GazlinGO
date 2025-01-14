// A component for displaying a list of minerals in the application's sidebar.
// Supports loading animations (skeleton loading), preview images, and error handling with a fallback to a placeholder.
// Includes conditional rendering of control buttons (edit and delete) for administrators.
// Optimized for performance with hover effects and proper event handling.

import { useAuth } from '../hooks/useAuth'
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Trash2, Edit2 } from 'lucide-react';

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
    onEditClick: (mineral: Mineral) => void;
}

export const MineralsList: React.FC<MineralsListProps> = ({
                                                              minerals,
                                                              onSelectMineral,
                                                              onDeleteClick,
                                                              onEditClick,
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
                        <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditClick(mineral);
                                }}
                                className="bg-white hover:bg-gray-100 text-gray-700 p-2 rounded transition-colors border border-gray-300"
                                title={t('edit')}
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteClick(mineral);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
                                title={t('delete')}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};