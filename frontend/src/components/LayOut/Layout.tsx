import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import ModelViewer from '../ModelViewer'
import { api } from '../../services/api'
import { AuthButton } from '../Auth/AuthButton'
import { MineralForm } from '../MineralForm'
import { MineralsList } from '../MineralsList'
import { SortControls } from '../SortControls/SortControls'
import ErrorBoundary from '../ErrorBoundary'
import { useNotification } from '../Notification/NotificationContext'
import { Resizer } from '../Resizer/Resizer'
import { DeleteConfirmation } from '../DeleteConfirmation/DeleteConfirmation'
import { useIsMobile }  from '../../hooks/useIsMobile';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import { EditMineralForm } from '../../components/EditMineralForm';
import MarkdownViewer from '../Markdown/MarkdownViewer';


interface Mineral {
    id: number;
    title: string;
    description: string;
    preview_image_path: string;
    model_path: string;
    created_at: string;
    isFavorite?: boolean;
}

function debounce<T extends string>(
    func: (arg: T) => Promise<void> | void,
    wait: number
): (arg: T) => void {
    let timeout: number | undefined;

    return (arg: T) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => func(arg), wait);
    };
}

const Layout = () => {
    const { isAuthenticated, isAdmin } = useAuth()
    const [minerals, setMinerals] = useState<Mineral[]>([])
    const [showMineralForm, setShowMineralForm] = useState(false)
    const [selectedMineral, setSelectedMineral] = useState<Mineral | null>(null)
    const [mineralToDelete, setMineralToDelete] = useState<Mineral | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [sidebarWidth, setSidebarWidth] = useState(320)
    const [sortOption, setSortOption] = useState<'az' | 'za' | 'newest' | 'oldest' | 'favorites'>('az')
    const [favorites, setFavorites] = useState<number[]>([])
    const { showNotification } = useNotification()
    const isMobile = useIsMobile();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { currentLanguage } = useLanguage();
    const { t } = useLanguage();
    const [mineralToEdit, setMineralToEdit] = useState<Mineral | null>(null);

    const handleEditClick = (mineral: Mineral) => {
        setMineralToEdit(mineral);
    };

    const handleEditSuccess = async () => {
        await fetchMinerals();
        setMineralToEdit(null);
        window.location.reload();
    };


    const handleResize = useCallback((newWidth: number) => {
        setSidebarWidth(newWidth)
    }, [])

    const loadFavorites = useCallback(async () => {
        if (isAuthenticated) {
            try {
                const response = await api.get('/favorites');
                setFavorites(response.data.data);
            } catch (error) {
                console.error('Ошибка загрузки избранного:', error);
            }
        }
    }, [isAuthenticated]);

    const fetchMinerals = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get(
                `/minerals-translated?lang=${currentLanguage}&source_lang=ru`
            );
            const minerals = response.data.data.map((mineral: Mineral) => ({
                ...mineral,
                isFavorite: favorites.includes(mineral.id)
            }));
            setMinerals(minerals);
        } catch (error) {
            console.error('Ошибка загрузки минералов:', error);

        } finally {
            setIsLoading(false);
        }
    }, [favorites, showNotification, currentLanguage]);

    const handleFavoriteToggle = async (mineralId: number) => {

        const currentFavorites = [...favorites];
        const currentMinerals = [...minerals];

        try {
            if (favorites.includes(mineralId)) {
                setFavorites(prev => prev.filter(id => id !== mineralId));
                setMinerals(prev =>
                    prev.map(mineral =>
                        mineral.id === mineralId
                            ? { ...mineral, isFavorite: false }
                            : mineral
                    )
                );


                await api.delete(`/favorites/${mineralId}`);
                showNotification(t('removeFromFavoritesSuccess'), 'success');
            }  else {
                setFavorites(prev => [...prev, mineralId]);
                setMinerals(prev =>
                    prev.map(mineral =>
                        mineral.id === mineralId
                            ? { ...mineral, isFavorite: true }
                            : mineral
                    )
                );


                await api.post(`/favorites/${mineralId}`);
                showNotification(t('addToFavoritesSuccess'), 'success');
            }
        } catch {
            setFavorites(currentFavorites);
            setMinerals(currentMinerals);
            showNotification(t('errorUpdatingFavorites'), 'error');
        }
    };


    const getSortedMinerals = useCallback((mineralsList: Mineral[]) => {
        const sorted = [...mineralsList]
        switch (sortOption) {
            case 'az':
                return sorted.sort((a, b) => a.title.localeCompare(b.title))
            case 'za':
                return sorted.sort((a, b) => b.title.localeCompare(a.title))
            case 'newest':
                return sorted.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
            case 'oldest':
                return sorted.sort((a, b) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                )
            case 'favorites':
                return sorted.filter(mineral => mineral.isFavorite)
            default:
                return sorted
        }
    }, [sortOption])

    const handleSearch = useCallback(async (query: string) => {
        try {
            const trimmedQuery = query.trim()

            if (!trimmedQuery) {
                await fetchMinerals()
                return
            }

            const response = await api.get(
                `/find-minerals?query=${encodeURIComponent(trimmedQuery)}&lang=${currentLanguage}&source_lang=ru`
            )

            const minerals = Array.isArray(response.data.data) ? response.data.data : [];
            setMinerals(minerals);
        } catch (error) {
            console.error('Ошибка поиска:', error)

            setMinerals([]);
        }
    }, [currentLanguage])

    const debouncedSearch = useCallback(
        debounce(handleSearch, 500),
        [handleSearch]
    )

    useEffect(() => {
        fetchMinerals();
    }, [fetchMinerals, favorites, currentLanguage]);
    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const handleSelectMineral = (mineral: Mineral) => {
        setSelectedMineral(mineral)
    }

    const handleDeleteClick = (mineral: Mineral) => {
        setMineralToDelete(mineral);
    }

    const handleDeleteConfirm = async () => {
        if (!mineralToDelete) return;

        try {
            await api.delete(`/admin/minerals/${mineralToDelete.id}`);
            showNotification(t('mineralDeleteSuccess'), 'success');
            await fetchMinerals();

            if (selectedMineral?.id === mineralToDelete.id) {
                setSelectedMineral(null);
            }
        } catch (error) {
            console.error('Ошибка удаления минерала:', error);
            showNotification(t('errorDeletingMineral'), 'error');
        } finally {
            setMineralToDelete(null);
        }
    }

    const handleDeleteCancel = () => {
        setMineralToDelete(null);
    }

    const handleMineralAdded = async () => {
        await fetchMinerals();
        setShowMineralForm(false);
        showNotification(t('mineralAddSuccess'), 'success');
    };

    return (
        <div className="flex min-h-screen relative overflow-x-hidden">
            <aside
                className={`
        ${isMobile ? (isMenuOpen ? 'fixed inset-0 z-50' : 'hidden') : 'relative'}
        bg-slate-50 border-r border-slate-200 flex flex-col h-screen sticky top-0
    `}
                style={{width: sidebarWidth}}
            >
                {isMobile && (
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute top-4 right-4 p-2 bg-slate-200 rounded-full"
                    >
                        ✕
                    </button>
                )}


                {isAdmin && (
                    <div className="flex-shrink-0 p-4 bg-slate-50 border-b border-slate-200">
                        <button
                            onClick={() => setShowMineralForm(true)}
                            className="w-full flex justify-center bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-500 bg-auto-200 animate-gradient hover:from-blue-700 hover:via-purple-800 hover:to-indigo-700 text-white py-2 px-4 rounded-lg shadow transition-all duration-300"
                        >
                            {t('addMineral')}
                        </button>
                    </div>
                )}

                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <input
                        type="text"
                        placeholder={t('search')}
                        onChange={(e) => debouncedSearch(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <SortControls
                    onSort={setSortOption}
                    currentSort={sortOption}
                    showFavorites={isAuthenticated}
                    className="p-4 bg-slate-50 border-b border-slate-200"
                />

                <nav className="flex-1 overflow-y-auto bg-white">
                    <MineralsList
                        minerals={getSortedMinerals(minerals)}
                        onSelectMineral={(mineral) => {
                            handleSelectMineral(mineral);
                            if (isMobile) setIsMenuOpen(false);
                        }}
                        onDeleteClick={handleDeleteClick}
                        onEditClick={handleEditClick}
                        isLoading={isLoading}
                    />
                </nav>
                {!isMobile && <Resizer onResize={handleResize}/>}
            </aside>

            <main className="flex-1 bg-white relative min-w-0">
                <header className="sticky top-0 bg-white shadow-sm z-20">
                    <div className="flex justify-end items-center p-4 gap-4">
                        {isMobile && (
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="mr-auto p-2 bg-slate-100 rounded-lg"
                            >
                                ☰
                            </button>
                        )}
                        <LanguageSwitcher/>
                        <AuthButton/>
                    </div>
                </header>

                <div className="px-8 py-4">
                    <div className="flex justify-center">
                        <h1 className="text-2xl font-bold text-slate-900 mb-6">
                            {selectedMineral ? selectedMineral.title : "GazlinGO"}
                        </h1>
                    </div>

                    <div
                        className={`h-[500px] rounded-lg bg-slate-50 mb-8 ${!selectedMineral ? 'max-w-[800px] mx-auto' : ''}`}>

                        <ErrorBoundary>
                            {selectedMineral ? (
                                <ModelViewer
                                    modelPath={selectedMineral.model_path}
                                    mineralId={selectedMineral.id}
                                    isFavorite={selectedMineral.isFavorite}
                                    onFavoriteToggle={handleFavoriteToggle}
                                    isAuthenticated={isAuthenticated}
                                    isDefaultModel={false}
                                />
                            ) : (
                                <ModelViewer
                                    isAuthenticated={isAuthenticated}
                                    isDefaultModel={true}
                                />
                            )}
                        </ErrorBoundary>
                    </div>

                    <div className="flex justify-center">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">{t('description')}</h2>
                    </div>
                    <div className="text-slate-700">
                        {selectedMineral ? (
                            <MarkdownViewer content={selectedMineral.description} />
                        ) : (
                            <p>{t('selectMineral')}</p>
                        )}
                    </div>
                </div>
            </main>

            {showMineralForm && (
                <MineralForm
                    onClose={() => setShowMineralForm(false)}
                    onSuccess={handleMineralAdded}
                />
            )}

            {mineralToDelete && (
                <DeleteConfirmation
                    mineralName={mineralToDelete.title}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                />
            )}

            {mineralToEdit && (
                <EditMineralForm
                    mineral={mineralToEdit}
                    onClose={() => setMineralToEdit(null)}
                    onSuccess={handleEditSuccess}
                />
            )}

            {isMobile && isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </div>
    );
}
export default Layout