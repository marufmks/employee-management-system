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
                        {__('Dashboard', 'employee-management-system')}
                    </Button>
                    <Button
                        variant={currentPath === 'employees' ? 'primary' : 'secondary'}
                        className="nav-button"
                        onClick={() => onNavigate('employees')}
                    >
                        {__('Employees', 'employee-management-system')}
                    </Button>
                    <Button
                        variant={currentPath === 'sales' ? 'primary' : 'secondary'}
                        className="nav-button"
                        onClick={() => onNavigate('sales')}
                    >
                        {__('Sales', 'employee-management-system')}
                    </Button>
                    <Button
                        variant={currentPath === 'settings' ? 'primary' : 'secondary'}
                        className="nav-button"
                        onClick={() => onNavigate('settings')}
                    >
                        {__('Settings', 'employee-management-system')}
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