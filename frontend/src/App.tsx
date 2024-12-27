import  Layout  from './components/LayOut/Layout'
import { NotificationProvider } from './components/Notification/NotificationContext'

function App() {
    return (
        <NotificationProvider>
            <Layout />
        </NotificationProvider>
    )
}

export default App