// A component that implements authentication and user session management functionality.
// Includes login and registration forms, logout confirmation modals, a profile dropdown menu, and handling of various authorization states.
// Uses gradient styles and animations to enhance visual appeal, and includes form validation and error handling.


import { useState, useRef, useEffect } from 'react';
import { api, AxiosError } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useLanguage } from '../../contexts/LanguageContext';

interface LoginResponse {
    token: string;
    role: string;
}

const ConfirmLogout = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => {
    useEscapeKey(onCancel);
    const { t } = useLanguage();

    return (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 1000 }}>
            <div className="fixed inset-0 bg-black bg-opacity-50" style={{ zIndex: 1000 }}></div>
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 relative" style={{ zIndex: 1001 }}>
                <h2 className="text-xl font-bold mb-4">{t('logoutConfirmation')}</h2>
                <p className="text-gray-600 mb-6">
                    {t('logoutConfirmationText')}
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        {t('logout')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AuthButton = () => {
    const { isAuthenticated } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { t } = useLanguage();

    const currentUser = localStorage.getItem('username');

    // Сохраняем позицию прокрутки
    const scrollPositionRef = useRef(0);

    // Блокируем прокрутку при открытии модального окна
    useEffect(() => {
        if (showModal || showLogoutConfirm) {
            scrollPositionRef.current = window.scrollY;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            window.scrollTo(0, scrollPositionRef.current);
        }
    }, [showModal, showLogoutConfirm]);

    const validateForm = () => {
        if (!username.trim()) {
            setError(t('enterUsername'));
            return false;
        }
        if (!password.trim()) {
            setError(t('enterPassword'));
            return false;
        }
        if (!isLogin && password.length < 6) {
            setError(t('passwordLength'));
            return false;
        }
        if (!isLogin && password !== confirmPassword) {
            setError(t('passwordsNotMatch'));
            return false;
        }
        setError('');
        return true;
    };

    const handleLogoutClick = () => {
        setShowDropdown(false);
        setShowLogoutConfirm(true);
    };

    const handleLogoutConfirm = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        setShowLogoutConfirm(false);
        window.location.reload();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await api.post<LoginResponse>('/login', {
                username: username.trim(),
                password: password.trim(),
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('username', username.trim());
            setShowModal(false);
            window.location.reload();
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ошибка авторизации');
            }
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await api.post<LoginResponse>('/register', {
                username: username.trim(),
                password: password.trim(),
                role: 'user',
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('username', username.trim());
            setShowModal(false);
            window.location.reload();
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ошибка регистрации');
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setError('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
    };

    const handleButtonClick = () => {
        setShowDropdown(!showDropdown);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                buttonRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEscapeKey(() => {
        if (showLogoutConfirm) {
            setShowLogoutConfirm(false);
        }
        if (showModal) {
            closeModal();
        }
    });

    return (
        <div className="relative">
            {isAuthenticated ? (
                <>
                    <button
                        ref={buttonRef}
                        onClick={handleButtonClick}
                        className="text-slate-700 hover:text-slate-900 font-medium"
                    >
                        {currentUser || t('user')}
                    </button>
                    {showDropdown && (
                        <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200"
                            style={{ zIndex: 999 }}
                        >
                            <button
                                onClick={() => {
                                    handleLogoutClick();
                                    setShowDropdown(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                {t('logout')}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white px-6 py-2 rounded-lg shadow transition-colors"
                    >
                        {t('login')}
                    </button>

                    {showModal && (
                        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 1000 }}>
                            <div className="fixed inset-0 bg-black bg-opacity-50" style={{ zIndex: 1000 }}></div>
                            <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative" style={{ zIndex: 1001 }}>
                                <h2 className="text-xl font-bold mb-4">
                                    {isLogin ? t('loginTitle') : t('registerTitle')}
                                </h2>
                                <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder={t('username')}
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="password"
                                            placeholder={t('password')}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    {!isLogin && (
                                        <div>
                                            <input
                                                type="password"
                                                placeholder={t('confirmPassword')}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    )}
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    <div className="flex justify-between gap-2">
                                        <button
                                            type="submit"
                                            className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-500 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-600 text-white px-6 py-2 rounded transition-colors"
                                        >
                                            {isLogin ? t('loginButton') : t('registerButton')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                                        >
                                            {t('cancel')}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setError('');
                                        }}
                                        className="text-blue-500 hover:text-blue-600 text-sm w-full"
                                    >
                                        {isLogin ? t('createAccount') : t('haveAccount')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}

            {showLogoutConfirm && (
                <ConfirmLogout
                    onConfirm={() => {
                        handleLogoutConfirm();
                        setShowDropdown(false);
                    }}
                    onCancel={() => {
                        setShowLogoutConfirm(false);
                        setShowDropdown(false);
                    }}
                />
            )}
        </div>
    );
};

export default AuthButton;