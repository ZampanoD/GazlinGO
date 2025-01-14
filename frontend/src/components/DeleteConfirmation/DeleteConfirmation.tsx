// A modal component for confirming the deletion of a mineral from the system.
// Implements an action confirmation pattern with two options (confirm/cancel).


import React, { useState } from 'react';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useLanguage } from '../../contexts/LanguageContext';

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
    const { t } = useLanguage();

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
        <div className="fixed inset-0 flex items-center justify-center" style={{zIndex: 1000}}>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000]"/>
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 relative" style={{zIndex: 1001}}>
                <h2 className="text-xl font-bold mb-4">{t('deleteConfirmation')}</h2>
                <p className="text-gray-600 mb-6">
                    {t('deleteConfirmationText').replace('{mineralName}', mineralName)}
                </p>
                <div className="flex justify-end space-x-3">
                    <button onClick={handleCancel} className="...">
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        {t('delete')}
                    </button>
                </div>
            </div>
        </div>
    );
};