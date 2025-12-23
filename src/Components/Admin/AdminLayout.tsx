import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { AdminLanguageProvider } from './AdminLanguageContext';
import './AdminLayout.css';

const AdminLayout = () => {
    return (
        <AdminLanguageProvider>
            <div className="admin-layout">
                <AdminSidebar />
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </AdminLanguageProvider>
    );
};

export default AdminLayout;
