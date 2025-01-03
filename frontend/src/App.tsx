import  Layout  from './components/LayOut/Layout'
import { NotificationProvider } from './components/Notification/NotificationContext'
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
    return (
        <LanguageProvider>
            <NotificationProvider>
                <Layout />
            </NotificationProvider>
        </LanguageProvider>
    );
}

export default App