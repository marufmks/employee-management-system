import { createRoot } from '@wordpress/element';
import React from 'react';
import AdminApp from './components/admin/App';
import EmployeeDashboard from './components/frontend';
import './styles/admin.css';
import './styles/frontend.css';

const adminRoot = document.getElementById('ems-admin-root');
if (adminRoot) {
    const root = createRoot(adminRoot);
    root.render(
        <div className="ems-admin-wrapper">
            <AdminApp />
        </div>
    );
} 

const employeeRoot = document.getElementById('ems-employee-root');
if (employeeRoot) {
    const root = createRoot(employeeRoot);
    root.render(
        <div className="ems-frontend-wrapper">
            <EmployeeDashboard />
        </div>
    );
}