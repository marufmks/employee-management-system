import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

const AdminLayout = ({ children, currentPath, onNavigate }) => {
    return (
        <div className="ems-admin-layout">
            <div className="ems-admin-sidebar">
                <div className="ems-admin-nav">
                    <Button
                        variant={currentPath === 'dashboard' ? 'primary' : 'secondary'}
                        onClick={() => onNavigate('dashboard')}
                        className="nav-button"
                    >
                        {__('Dashboard', 'ems')}
                    </Button>
                    <Button
                        variant={currentPath === 'employees' ? 'primary' : 'secondary'}
                        onClick={() => onNavigate('employees')}
                        className="nav-button"
                    >
                        {__('Employees', 'ems')}
                    </Button>
                    <Button
                        variant={currentPath === 'settings' ? 'primary' : 'secondary'}
                        onClick={() => onNavigate('settings')}
                        className="nav-button"
                    >
                        {__('Settings', 'ems')}
                    </Button>
                </div>
            </div>
            <div className="ems-admin-content">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout; 