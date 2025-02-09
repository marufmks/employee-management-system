import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { 
    chartBar, 
    group, 
    currencyDollar, 
    settings 
} from '@wordpress/icons';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLayout = ({ currentPath, onNavigate, children }) => {
    const navItemplmasy = [
        {
            id: 'dashboard',
            label: __('Dashboard', 'employee-management-system'),
            icon: chartBar,
        },
        {
            id: 'employees',
            label: __('Employee Records', 'employee-management-system'),
            icon: group,
        },
        {
            id: 'sales',
            label: __('Sales Reports', 'employee-management-system'),
            icon: currencyDollar,
        },
        {
            id: 'settings',
            label: __('Settings', 'employee-management-system'),
            icon: settings,
        }
    ];

    return (
        <div className="emplmasy-admin-layout">
            <div className="emplmasy-admin-sidebar">
                <div className="emplmasy-plugin-brand">
                    <h2>{__('Employee Management', 'employee-management-system')}</h2>
                </div>
                <nav className="emplmasy-admin-nav">
                    {navItemplmasy.map(item => (
                        <Button
                            key={item.id}
                            icon={item.icon}
                            variant={currentPath === item.id ? 'primary' : 'secondary'}
                            className={`nav-button ${currentPath === item.id ? 'active' : ''}`}
                            onClick={() => onNavigate(item.id)}
                        >
                            {item.label}
                        </Button>
                    ))}
                </nav>
                <div className="emplmasy-sidebar-image">
                    <img 
                        src={emplmasyData.pluginUrl + '/public/employee_management.jpg'} 
                        alt={__('Employee Management', 'employee-management-system')}
                    />
                </div>
            </div>
            <div className="emplmasy-admin-content">
                {children}
            </div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};

export default AdminLayout; 