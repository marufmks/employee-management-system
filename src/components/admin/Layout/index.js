import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { 
    chart, 
    groups, 
    money, 
    settings 
} from '@wordpress/icons';

const AdminLayout = ({ currentPath, onNavigate, children }) => {
    const navItems = [
        {
            id: 'dashboard',
            label: __('Dashboard', 'employee-management-system'),
            icon: chart,
        },
        {
            id: 'employees',
            label: __('Employee Records', 'employee-management-system'),
            icon: groups,
        },
        {
            id: 'sales',
            label: __('Sales Reports', 'employee-management-system'),
            icon: money,
        },
        {
            id: 'settings',
            label: __('Settings', 'employee-management-system'),
            icon: settings,
        }
    ];

    return (
        <div className="ems-admin-layout">
            <div className="ems-admin-sidebar">
                <div className="ems-plugin-brand">
                    <h2>{__('Employee Management', 'employee-management-system')}</h2>
                </div>
                <nav className="ems-admin-nav">
                    {navItems.map(item => (
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
            </div>
            <div className="ems-admin-content">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout; 