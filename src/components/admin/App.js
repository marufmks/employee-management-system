import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import AdminLayout from './Layout';
import Dashboard from './Dashboard';
import Employees from './Employees';
import Settings from './Settings';

const AdminApp = () => {
    const [currentPath, setCurrentPath] = useState('dashboard');

    const renderContent = () => {
        switch (currentPath) {
            case 'employees':
                return <Employees />;
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <AdminLayout 
            currentPath={currentPath} 
            onNavigate={setCurrentPath}
        >
            {renderContent()}
        </AdminLayout>
    );
};

export default AdminApp; 