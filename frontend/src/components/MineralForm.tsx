//Модальный компонент для создания новых записей о минералах, доступный только администраторам.
//Реализует загрузку 3D-моделей в формате GLB и изображений предпросмотра с валидацией типов файлов и обязательных полей.
//Включает продвинутую обработку ошибок, интеграцию с системой уведомлений.
//Использует FormData для отправки файлов на сервер и поддерживает отзывчивый дизайн с прокруткой для больших форм.
//Особое внимание уделено пользовательскому опыту с подробными подсказками и визуальной обратной связью.

import { useState } from 'react'
import { api, AxiosError } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../components/Notification/NotificationContext'
import { useEscapeKey } from '../hooks/useEscapeKey'
import MarkdownEditor from './Markdown/MarkdownEditor'
import { useLanguage } from '../contexts/LanguageContext'

interface MineralFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const MineralForm: React.FC<MineralFormProps> = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [model, setModel] = useState<File | null>(null)
    const [preview, setPreview] = useState<File | null>(null)
    const { showNotification } = useNotification()
    const { isAdmin } = useAuth()
    const { t } = useLanguage()

    useEscapeKey(onClose);

    if (!isAdmin) {
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim()) {
            showNotification(t('enterMineralNameError'), 'error')
            return
        }

        if (!description.trim()) {
            showNotification(t('enterDescriptionError'), 'error')
            return
        }

        if (!model) {
            showNotification(t('uploadModelError'), 'error')
            return
        }

        if (!preview) {
            showNotification(t('uploadPreviewError'), 'error')
            return
        }

        const formData = new FormData()
        formData.append('title', title.trim())
        formData.append('description', description.trim())
        formData.append('model', model)
        formData.append('preview', preview)

        try {
            await api.post('/admin/minerals', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })

            showNotification(t('mineralAddSuccess'), 'success')
            onSuccess()
            onClose()
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data.error) {
                showNotification(`${t('error')}: ${error.response.data.error}`, 'error')
            } else {
                showNotification(t('unknownError'), 'error')
            }
        }
    }

    const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.name.toLowerCase().endsWith('.glb')) {
                showNotification(t('invalidModelFormat'), 'error')
                e.target.value = ''
                return
            }
            setModel(file)
        }
    }

    const handlePreviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                showNotification(t('invalidImageFormat'), 'error')
                e.target.value = ''
                return
            }
            setPreview(file)
        }
    }

    const handleClose = (e: React.MouseEvent) => {
        e.preventDefault()
        onClose()
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 1000 }}>
            <div className="fixed inset-0 bg-black bg-opacity-50" style={{ zIndex: 1000 }}></div>
            <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto relative" style={{ zIndex: 1001 }}>
                <h2 className="text-xl font-bold mb-4">{t('addMineral')}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {t('mineralName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('enterMineralName')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {t('description')} <span className="text-red-500">*</span>
                        </label>
                        <MarkdownEditor
                            initialValue={description}
                            onChange={setDescription}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {t('model')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept=".glb"
                            onChange={handleModelChange}
                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {t('preview')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePreviewChange}
                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-between gap-2 mt-6">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {t('addMineral')}
                        </button>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            {t('close')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default MineralForm