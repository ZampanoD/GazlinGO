//Модальный компонент для подтверждения удаления минерала из системы.
//Реализует паттерн подтверждения действия с двумя опциями (подтверждение/отмена).

import React, { useState } from 'react';
import { useEscapeKey } from '../../hooks/useEscapeKey';

interface DeleteConfirmationProps {
    onConfirm: () => void;
    onCancel: () => void;
    mineralName: string;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
                                                                          onConfirm,
                                                                          onCancel,
                                                                          mineralName,
                                                                      }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleCancel = () => {
        setIsVisible(false);
        onCancel();
    };

    const handleConfirm = () => {
        setIsVisible(false);
        onConfirm();
    };

    useEscapeKey(handleCancel);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 1000 }}>

            <div className="fixed inset-0 bg-black bg-opacity-50" style={{ zIndex: 1000 }}></div>


            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 relative" style={{ zIndex: 1001 }}>
                <h2 className="text-xl font-bold mb-4">Подтверждение удаления</h2>
                <p className="text-gray-600 mb-6">
                    Вы действительно хотите удалить минерал "{mineralName}"?
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
};