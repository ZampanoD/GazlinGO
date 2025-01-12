
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';


interface SortTranslations {
    az: string;
    za: string;
    newest: string;
    oldest: string;
    favorites: string;

}

interface Translations {
    search: string;
    addMineral: string;
    description: string;
    selectMineral: string;
    error: string;
    success: string;
    delete: string;
    edit: string;
    cancel: string;
    save: string;
    loading: string;
    login: string;
    logout: string;
    sort: SortTranslations;
    user: string;
    loginTitle: string;
    registerTitle: string;
    createAccount: string;
    haveAccount: string;
    mineralDeleteSuccess: string;
    mineralAddSuccess: string;
    addToFavoritesSuccess: string;
    removeFromFavoritesSuccess: string;
    languageChangeSuccess: string;
    errorLoadingMinerals: string;
    errorDeletingMineral: string;
    errorUpdatingFavorites: string;
    AutoRotate: string;
    Lighting: string;
    Grid: string;
    DarkTheme: string;
    mineralName: string;
    enterMineralName: string;
    enterDescription: string;
    close: string;
    deleteConfirmation: string;
    deleteConfirmationText: string;
    enterMineralNameError: string;
    enterDescriptionError: string;
    uploadModelError: string;
    uploadPreviewError: string;
    unknownError: string;
    invalidModelFormat: string;
    invalidImageFormat: string;
    fileSize: string;
    logoutConfirmation: string;
    logoutConfirmationText: string;
    password: string;
    confirmPassword: string;
    enterUsername: string;
    enterPassword: string;
    passwordLength: string;
    passwordsNotMatch: string;
    registerButton: string;
    loginButton: string;
    submitButton: string;
    username: string;
    modelLabel: string;
    previewLabel: string;
    recommendedSize: string;
    onlyGlbFiles: string;
    requiredField: string;
    model:string;
    preview: string;
    boldText: string;
    italicText: string;
    insertLink: string;
    heading2: string;
    heading3: string;
    bulletList: string;
    numberedList: string;
}

type TranslationKey = keyof Omit<Translations, 'sort'> | `sort.${keyof SortTranslations}`;

export type Languages = 'ru' | 'en' | 'es' | 'de' | 'fr';


const translations: Record<Languages, Translations> = {
    ru: {
        search: "Поиск минералов...",
        addMineral: "Добавить минерал",
        description: "ОПИСАНИЕ",
        selectMineral: "🌍GazlinGO - это веб-приложение для интерактивного просмотра и управления коллекцией 3D-моделей минералов. Система предоставляет удобный интерфейс для работы с трехмерными моделями, их описаниями и классификацией. Разработана с использованием современного стека технологий. Выберите минерал из списка слева для дальнейшей работы ",
        error: "Ошибка",
        success: "Успешно",
        delete: "Удалить",
        edit: "Редактировать",
        cancel: "Отмена",
        save: "Сохранить",
        loading: "Загрузка...",
        login: "Войти",
        logout: "Выйти",
        user: 'Пользователь',
        loginTitle: 'Авторизация',
        registerTitle: 'Регистрация',
        createAccount: 'Создать аккаунт',
        haveAccount: 'Уже есть аккаунт?',
        mineralDeleteSuccess: 'Минерал успешно удален',
        mineralAddSuccess: 'Минерал успешно добавлен',
        addToFavoritesSuccess: 'Добавлено в избранное',
        removeFromFavoritesSuccess: 'Удалено из избранного',
        languageChangeSuccess: 'Язык успешно изменен',
        errorLoadingMinerals: 'Ошибка при загрузке минералов',
        errorDeletingMineral: 'Ошибка при удалении минерала',
        errorUpdatingFavorites: 'Ошибка при обновлении избранного',
        AutoRotate: 'Вращение',
        Lighting: 'Освещение',
        Grid: 'Сетка',
        DarkTheme: 'Темная тема',
        mineralName: 'Название минерала',
        enterMineralName: 'Введите название минерала',
        enterDescription: 'Введите описание минерала',
        close: 'Закрыть',
        deleteConfirmation: 'Удалить',
        deleteConfirmationText: 'Подтвердить удаление',
        enterMineralNameError: 'Введите название минерала',
        enterDescriptionError: 'Введите описание',
        uploadModelError: 'Ошибка загрузки модели',
        uploadPreviewError: 'Ошибка загрузки предварительного просмотра',
        unknownError: 'Неизвестная ошибка',
        invalidModelFormat: 'Неверный формат модели',
        invalidImageFormat: 'Неверный формат изображения',
        fileSize: 'Размер файла превышает допустимый лимит',
        logoutConfirmation: 'Выход из системы',
        logoutConfirmationText: 'Вы уверены, что хотите выйти?',
        password: 'Пароль',
        confirmPassword: 'Подтвердите пароль',
        enterUsername: 'Введите имя пользователя',
        enterPassword: 'Введите пароль',
        passwordLength: 'Пароль должен содержать не менее 6 символов',
        passwordsNotMatch: 'Пароли не совпадают',
        registerButton: 'Зарегистрироваться',
        loginButton: 'Войти',
        submitButton: 'Отправить',
        username: 'Имя пользователя',
        modelLabel: 'Модель',
        previewLabel: 'Предпросмотр',
        recommendedSize: 'Рекомендуемый размер 200x200',
        onlyGlbFiles: 'Допустимы только файлы .glb',
        requiredField: '*',
        model: "Выберите 3D Модель",
        preview: "Загрузить Превью",
        boldText: "Жирный текст",
        italicText: "Курсив",
        insertLink: "Вставить ссылку",
        heading2: "Заголовок 2",
        heading3: "Заголовок 3",
        bulletList: "Маркированный список",
        numberedList: "Нумерованный список",



        sort: {
            az: "По алфавиту (А-Я)",
            za: "По алфавиту (Я-А)",
            newest: "Сначала новые",
            oldest: "Сначала старые",
            favorites: "Избранное"
        }

    },
    en: {
        search: "Search minerals...",
        addMineral: "Add mineral",
        description: "DESCRIPTION",
        selectMineral: "🌍GazlinGO is a web application for interactive viewing and management of a collection of 3D models of minerals. The system provides a user-friendly interface for working with three-dimensional models, their descriptions and classification. Developed using a modern technology stack. Select a mineral from the list on the left for further work",
        error: "Error",
        success: "Success",
        delete: "Delete",
        edit: "Edit",
        cancel: "Cancel",
        save: "Save",
        loading: "Loading...",
        login: "Login",
        logout: "Logout",
        user: 'User',
        loginTitle: 'Login',
        registerTitle: 'Register',
        createAccount: 'Create account',
        haveAccount: 'Already have an account?',
        mineralDeleteSuccess: 'Mineral successfully deleted',
        mineralAddSuccess: 'Mineral successfully added',
        addToFavoritesSuccess: 'Added to favorites',
        removeFromFavoritesSuccess: 'Removed from favorites',
        languageChangeSuccess: 'Language changed successfully',
        errorLoadingMinerals: 'Error loading minerals',
        errorDeletingMineral: 'Error deleting mineral',
        errorUpdatingFavorites: 'Error updating favorites',
        AutoRotate: 'Auto Rotate',
        Lighting: 'Lighting',
        Grid: 'Grid',
        DarkTheme: 'Dark Theme',
        mineralName: 'Mineral Name',
        enterMineralName: 'Enter mineral name',
        enterDescription: 'Enter description',
        close: 'Close',
        deleteConfirmation: 'Delete',
        deleteConfirmationText: 'Confirm deletion',
        enterMineralNameError: 'Enter the mineral name',
        enterDescriptionError: 'Enter the description',
        uploadModelError: 'Error uploading model',
        uploadPreviewError: 'Error uploading preview',
        unknownError: 'Unknown error',
        invalidModelFormat: 'Invalid model format',
        invalidImageFormat: 'Invalid image format',
        fileSize: 'File size exceeds the allowed limit',
        logoutConfirmation: 'Logout',
        logoutConfirmationText: 'Are you sure you want to log out?',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        enterUsername: 'Enter username',
        enterPassword: 'Enter password',
        passwordLength: 'Password must be at least 6 characters long',
        passwordsNotMatch: 'Passwords do not match',
        registerButton: 'Register',
        loginButton: 'Login',
        submitButton: 'Submit',
        username: 'Username',
        modelLabel: 'Model',
        previewLabel: 'Preview',
        recommendedSize: 'Recommended size 200x200',
        onlyGlbFiles: 'Only .glb files are allowed',
        requiredField: '*',
        model: "Select 3D Model",
        preview: "Upload Preview",
        boldText: "Bold text",
        italicText: "Italic text",
        insertLink: "Insert link",
        heading2: "Heading 2",
        heading3: "Heading 3",
        bulletList: "Bullet list",
        numberedList: "Numbered list",



        sort: {
            az: "Alphabetically (A-Z)",
            za: "Alphabetically (Z-A)",
            newest: "Newest first",
            oldest: "Oldest first",
            favorites: "Favorites"
        }
    },
    fr: {
        search: "Rechercher des minéraux...",
        addMineral: "Ajouter un minéral",
        description: "DESCRIPTION",
        selectMineral: "🌍GazlinGO est une application Web permettant de visualiser et de gérer de manière interactive une collection de modèles minéraux 3D. Le système fournit une interface conviviale pour travailler avec des modèles 3D, leurs descriptions et leur classification. Développé en utilisant une pile de technologie moderne. Sélectionnez un minéral dans la liste de gauche pour plus de travail",
        error: "Erreur",
        success: "Succès",
        delete: "Supprimer",
        edit: "Modifier",
        cancel: "Annuler",
        save: "Enregistrer",
        loading: "Chargement...",
        login: "Se connecter",
        logout: "Se déconnecter",
        user: 'Utilisateur',
        loginTitle: 'Connexion',
        registerTitle: 'Inscription',
        createAccount: 'Créer un compte',
        haveAccount: 'Vous avez déjà un compte?',
        mineralDeleteSuccess: 'Minéral supprimé avec succès',
        mineralAddSuccess: 'Minéral ajouté avec succès',
        addToFavoritesSuccess: 'Ajouté aux favoris',
        removeFromFavoritesSuccess: 'Retiré des favoris',
        languageChangeSuccess: 'Langue changée avec succès',
        errorLoadingMinerals: 'Erreur lors du chargement des minéraux',
        errorDeletingMineral: 'Erreur lors de la suppression du minéral',
        errorUpdatingFavorites: 'Erreur lors de la mise à jour des favoris',
        AutoRotate: 'Rotation automatique',
        Lighting: 'Éclairage',
        Grid: 'Grille',
        DarkTheme: 'Thème sombre',
        mineralName: 'Nom du minéral',
        enterMineralName: 'Entrez le nom du minéral',
        enterDescription: 'Entrez une description',
        close: 'Fermer',
        deleteConfirmation: 'Supprimer',
        deleteConfirmationText: 'Confirmer la suppression',
        enterMineralNameError: 'Entrez le nom du minéral',
        enterDescriptionError: 'Entrez la description',
        uploadModelError: 'Erreur lors du téléchargement du modèle',
        uploadPreviewError: 'Erreur lors du téléchargement de l’aperçu',
        unknownError: 'Erreur inconnue',
        invalidModelFormat: 'Format de modèle invalide',
        invalidImageFormat: 'Format d’image invalide',
        fileSize: 'La taille du fichier dépasse la limite autorisée',
        logoutConfirmation: 'Déconnexion',
        logoutConfirmationText: 'Êtes-vous sûr de vouloir vous déconnecter ?',
        password: 'Mot de passe',
        confirmPassword: 'Confirmez le mot de passe',
        enterUsername: 'Entrez le nom d’utilisateur',
        enterPassword: 'Entrez le mot de passe',
        passwordLength: 'Le mot de passe doit contenir au moins 6 caractères',
        passwordsNotMatch: 'Les mots de passe ne correspondent pas',
        registerButton: 'S’inscrire',
        loginButton: 'Se connecter',
        submitButton: 'Soumettre',
        username: 'Nom d’utilisateur',
        modelLabel: 'Modèle',
        previewLabel: 'Aperçu',
        recommendedSize: 'Taille recommandée 200х200',
        onlyGlbFiles: 'Seuls les fichiers .glb sont acceptés',
        requiredField: '*',
        model: "Sélectionner le Modèle 3D",
        preview: "Télécharger l'Aperçu",
        boldText: "Texte en gras",
        italicText: "Texte en italique",
        insertLink: "Insérer un lien",
        heading2: "Titre 2",
        heading3: "Titre 3",
        bulletList: "Liste à puces",
        numberedList: "Liste numérotée",


        sort: {
            az: "Par ordre alphabétique (A-Z)",
            za: "Par ordre alphabétique (Z-A)",
            newest: "Plus récent d'abord",
            oldest: "Plus ancien d'abord",
            favorites: "Favoris"
        }
    },
    de: {
        search: "Mineralien suchen...",
        addMineral: "Mineral hinzufügen",
        description: "BESCHREIBUNG",
        selectMineral: "🌍GazlinGO ist eine webbasierte Anwendung zum interaktiven Anzeigen und Verwalten einer Sammlung von 3D-Mineralmodellen. Das System bietet eine benutzerfreundliche Schnittstelle für die Arbeit mit 3D-Modellen, deren Beschreibungen und Klassifikationen. Entwickelt mit einem modernen Technologiestapel. Wählen Sie ein Mineral aus der Liste auf der linken Seite aus, um es weiter zu bearbeiten",
        error: "Fehler",
        success: "Erfolgreich",
        delete: "Löschen",
        edit: "Bearbeiten",
        cancel: "Abbrechen",
        save: "Speichern",
        loading: "Wird geladen...",
        login: "Anmelden",
        logout: "Abmelden",
        user: 'Benutzer',
        loginTitle: 'Anmeldung',
        registerTitle: 'Registrierung',
        createAccount: 'Konto erstellen',
        haveAccount: 'Haben Sie bereits ein Konto?',
        mineralDeleteSuccess: 'Mineral erfolgreich gelöscht',
        mineralAddSuccess: 'Mineral erfolgreich hinzugefügt',
        addToFavoritesSuccess: 'Zu Favoriten hinzugefügt',
        removeFromFavoritesSuccess: 'Aus Favoriten entfernt',
        languageChangeSuccess: 'Sprache erfolgreich geändert',
        errorLoadingMinerals: 'Fehler beim Laden der Mineralien',
        errorDeletingMineral: 'Fehler beim Löschen des Minerals',
        errorUpdatingFavorites: 'Fehler beim Aktualisieren der Favoriten',
        AutoRotate: 'Automatische Drehung',
        Lighting: 'Beleuchtung',
        Grid: 'Gitter',
        DarkTheme: 'Dunkles Thema',
        mineralName: 'Mineralname',
        enterMineralName: 'Geben Sie den Mineralnamen ein',
        enterDescription: 'Geben Sie die Beschreibung ein',
        close: 'Schließen',
        deleteConfirmation: 'Löschen',
        deleteConfirmationText: 'Löschung bestätigen',
        enterMineralNameError: 'Geben Sie den Mineralnamen ein',
        enterDescriptionError: 'Geben Sie die Beschreibung ein',
        uploadModelError: 'Fehler beim Hochladen des Modells',
        uploadPreviewError: 'Fehler beim Hochladen der Vorschau',
        unknownError: 'Unbekannter Fehler',
        invalidModelFormat: 'Ungültiges Modellformat',
        invalidImageFormat: 'Ungültiges Bildformat',
        fileSize: 'Dateigröße überschreitet das zulässige Limit',
        logoutConfirmation: 'Abmelden',
        logoutConfirmationText: 'Sind Sie sicher, dass Sie sich abmelden möchten?',
        password: 'Passwort',
        confirmPassword: 'Passwort bestätigen',
        enterUsername: 'Benutzernamen eingeben',
        enterPassword: 'Passwort eingeben',
        passwordLength: 'Das Passwort muss mindestens 6 Zeichen lang sein',
        passwordsNotMatch: 'Passwörter stimmen nicht überein',
        registerButton: 'Registrieren',
        loginButton: 'Anmelden',
        submitButton: 'Absenden',
        username: 'Benutzername',
        modelLabel: 'Modell',
        previewLabel: 'Vorschau',
        recommendedSize: 'Empfohlene Größe 200x200',
        onlyGlbFiles: 'Nur .glb-Dateien sind erlaubt',
        requiredField: '*',
        model: "3D Modell auswählen ",
        preview: "Vorschau hochladen ",
        boldText: "Fettschrift",
        italicText: "Kursivschrift",
        insertLink: "Link einfügen",
        heading2: "Überschrift 2",
        heading3: "Überschrift 3",
        bulletList: "Aufzählungsliste",
        numberedList: "Nummerierte Liste",




        sort: {
            az: "Alphabetisch (A-Z)",
            za: "Alphabetisch (Z-A)",
            newest: "Neueste zuerst",
            oldest: "Älteste zuerst",
            favorites: "Favoriten"
        }
    },
    es: {
        search: "Buscar minerales...",
        addMineral: "Añadir mineral",
        description: "DESCRIPCIÓN",
        selectMineral: "🌍GazlinGO es una aplicación web para ver y administrar de forma interactiva una colección de modelos 3D de minerales. El sistema proporciona una interfaz fácil de usar para trabajar con modelos tridimensionales, sus descripciones y clasificaciones. Desarrollado con una pila de tecnología moderna. Seleccione un mineral de la lista de la izquierda para seguir trabajando",
        error: "Error",
        success: "Éxito",
        delete: "Eliminar",
        edit: "Editar",
        cancel: "Cancelar",
        save: "Guardar",
        loading: "Cargando...",
        login: "Iniciar sesión",
        logout: "Cerrar sesión",
        user: 'Usuario',
        loginTitle: 'Iniciar sesión',
        registerTitle: 'Registro',
        createAccount: 'Crear cuenta',
        haveAccount: '¿Ya tienes una cuenta?',
        mineralDeleteSuccess: 'Mineral eliminado con éxito',
        mineralAddSuccess: 'Mineral añadido con éxito',
        addToFavoritesSuccess: 'Añadido a favoritos',
        removeFromFavoritesSuccess: 'Eliminado de favoritos',
        languageChangeSuccess: 'Idioma cambiado con éxito',
        errorLoadingMinerals: 'Error al cargar los minerales',
        errorDeletingMineral: 'Error al eliminar el mineral',
        errorUpdatingFavorites: 'Error al actualizar los favoritos',
        AutoRotate: 'Rotación automática',
        Lighting: 'Iluminación',
        Grid: 'Cuadrícula',
        DarkTheme: 'Tema oscuro',
        mineralName: 'Nombre del mineral',
        enterMineralName: 'Ingrese el nombre del mineral',
        enterDescription: 'Ingrese una descripción',
        close: 'Cerrar',
        deleteConfirmation: 'Eliminar',
        deleteConfirmationText: 'Confirmar eliminación',
        enterMineralNameError: 'Ingrese el nombre del mineral',
        enterDescriptionError: 'Ingrese la descripción',
        uploadModelError: 'Error al cargar el modelo',
        uploadPreviewError: 'Error al cargar la vista previa',
        unknownError: 'Error desconocido',
        invalidModelFormat: 'Formato de modelo inválido',
        invalidImageFormat: 'Formato de imagen inválido',
        fileSize: 'El tamaño del archivo excede el límite permitido',
        logoutConfirmation: 'Cerrar sesión',
        logoutConfirmationText: '¿Está seguro de que desea cerrar sesión?',
        password: 'Contraseña',
        confirmPassword: 'Confirmar contraseña',
        enterUsername: 'Ingrese nombre de usuario',
        enterPassword: 'Ingrese contraseña',
        passwordLength: 'La contraseña debe tener al menos 6 caracteres',
        passwordsNotMatch: 'Las contraseñas no coinciden',
        registerButton: 'Registrarse',
        loginButton: 'Iniciar sesión',
        submitButton: 'Enviar',
        username: 'Nombre de usuario',
        modelLabel: 'Modelo',
        previewLabel: 'Vista previa',
        recommendedSize: 'Tamaño recomendado 200x200',
        onlyGlbFiles: 'Solo se permiten archivos .glb',
        requiredField: '*',
        model: "Seleccionar Modelo 3D ",
        preview: "Subir Vista previa ",
        boldText: "Texto en negrita",
        italicText: "Texto en cursiva",
        insertLink: "Insertar enlace",
        heading2: "Título 2",
        heading3: "Título 3",
        bulletList: "Lista con viñetas",
        numberedList: "Lista numerada",


        sort: {
            az: "Alfabéticamente (A-Z)",
            za: "Alfabéticamente (Z-A)",
            newest: "Más recientes primero",
            oldest: "Más antiguos primero",
            favorites: "Favoritos",


        }
    }
};

interface LanguageContextType {
    currentLanguage: Languages;
    setLanguage: (lang: Languages) => void;
    isLoading: boolean;
    error: string | null;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState<Languages>(() =>
        (localStorage.getItem('selectedLanguage') as Languages) || 'ru'
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.documentElement.lang = currentLanguage;
        localStorage.setItem('selectedLanguage', currentLanguage);
    }, [currentLanguage]);

    const setLanguage = async (lang: Languages) => {
        try {
            setIsLoading(true);
            setError(null);
            setCurrentLanguage(lang);
            window.location.reload();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error changing language');
        } finally {
            setIsLoading(false);
        }
    };

    const t = (key: TranslationKey): string => {
        if (key.startsWith('sort.')) {
            const sortKey = key.split('.')[1] as keyof SortTranslations;
            return translations[currentLanguage].sort[sortKey];
        }
        return translations[currentLanguage][key as keyof Omit<Translations, 'sort'>];
    };

    return (
        <LanguageContext.Provider value={{
            currentLanguage,
            setLanguage,
            isLoading,
            error,
            t
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export { translations };