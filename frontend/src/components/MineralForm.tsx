import { useState } from 'react'
import { api, AxiosError } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../components/Notification/NotificationContext'
import { useEscapeKey } from '../hooks/useEscapeKey'

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

    useEscapeKey(onClose);

    if (!isAdmin) {
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim()) {
            showNotification('Введите название минерала', 'error')
            return
        }

        if (!description.trim()) {
            showNotification('Введите описание минерала', 'error')
            return
        }

        if (!model) {
            showNotification('Загрузите 3D модель', 'error')
            return
        }

        if (!preview) {
            showNotification('Загрузите изображение превью', 'error')
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

            showNotification('Минерал успешно добавлен', 'success')
            setTitle('')
            setDescription('')
            setModel(null)
            setPreview(null)
            onSuccess()
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data.error) {
                showNotification(`Ошибка: ${error.response.data.error}`, 'error')
            } else {
                showNotification('Произошла неизвестная ошибка при добавлении минерала', 'error')
            }
        }
    }

    const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.name.toLowerCase().endsWith('.glb')) {
                showNotification('Пожалуйста, выберите файл формата .glb', 'error')
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
                showNotification('Пожалуйста, выберите файл изображения', 'error')
                e.target.value = ''
                return
            }
            setPreview(file)
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 1000 }}>
            <div className="fixed inset-0 bg-black bg-opacity-50" style={{ zIndex: 1000 }}></div>
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto relative" style={{ zIndex: 1001 }}>
                <h2 className="text-xl font-bold mb-4">Добавление нового минерала</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Название <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Введите название минерала"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Описание <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border p-2 rounded w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Введите описание минерала"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            3D Модель (.glb) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept=".glb"
                            onChange={handleModelChange}
                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Только файлы формата .glb</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Превью <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePreviewChange}
                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Рекомендуемый размер: 200x200px</p>
                    </div>

                    <div className="flex justify-between gap-2 mt-6">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            Добавить минерал
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Закрыть
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}