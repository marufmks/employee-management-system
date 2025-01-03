import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

const AdminLayout = ({ currentPath, onNavigate, children }) => {
    return (
        <div className="ems-admin-layout">
            <div className="ems-admin-sidebar">
                <nav className="ems-admin-nav">
                    <Button
                        variant={currentPath === 'dashboard' ? 'primary' : 'secondary'}
                        className="nav-button"
                        onClick={() => onNavigate('dashboard')}
                    >
                        {__('Dashboard', 'ems')}
                    </Button>
                    <Button
                        variant={currentPath === 'employees' ? 'primary' : 'secondary'}
                        className="nav-button"
                        onClick={() => onNavigate('employees')}
                    >
                        {__('Employees', 'ems')}
                    </Button>
                    <Button
                        variant={currentPath === 'settings' ? 'primary' : 'secondary'}
                        className="nav-button"
                        onClick={() => onNavigate('settings')}
                    >
                        {__('Settings', 'ems')}
                    </Button>
                </nav>
            </div>
            <div className="ems-admin-content">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout; 