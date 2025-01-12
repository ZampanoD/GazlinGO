import React, { useState } from 'react';
import { api } from '../services/api';
import { useNotification } from '../components/Notification/NotificationContext';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useLanguage } from '../contexts/LanguageContext';
import MarkdownEditor from './Markdown/MarkdownEditor';

interface Mineral {
    id: number;
    title: string;
    description: string;
    preview_image_path: string;
    model_path: string;
    created_at: string;
    isFavorite?: boolean;
}

interface EditMineralFormProps {
    mineral: Mineral;
    onClose: () => void;
    onSuccess: () => void;
}

export const EditMineralForm: React.FC<EditMineralFormProps> = ({
                                                                    mineral,
                                                                    onClose,
                                                                    onSuccess
                                                                }) => {
    const [title, setTitle] = useState(mineral.title);
    const [description, setDescription] = useState(mineral.description);
    const [model, setModel] = useState<File | null>(null);
    const [preview, setPreview] = useState<File | null>(null);
    const { showNotification } = useNotification();
    const { t } = useLanguage();

    useEscapeKey(onClose);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        if (model) formData.append('model', model);
        if (preview) formData.append('preview', preview);

        try {
            await api.put(`/admin/minerals/${mineral.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            showNotification(t('mineralAddSuccess'), 'success');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(t('errorUpdatingFavorites'), error);
            showNotification((error as any).response?.data?.error || t('errorUpdatingFavorites'), 'error');
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto relative">
                <h2 className="text-xl font-bold mb-4">{t('edit')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {t('mineralName')}
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {t('description')}
                        </label>
                        <MarkdownEditor
                            initialValue={description}
                            onChange={setDescription}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {t('model')}
                        </label>
                        <input
                            type="file"
                            accept=".glb"
                            onChange={(e) => setModel(e.target.files?.[0] || null)}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {t('preview')}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPreview(e.target.files?.[0] || null)}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div className="flex justify-between gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            {t('save')}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded"
                        >
                            {t('cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
