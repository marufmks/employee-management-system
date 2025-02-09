import { createRoot } from '@wordpress/element';
import React from 'react';
import AdminApp from './components/admin/App';
import EmployeeDashboard from './components/frontend';
import './styles/admin.css';
import './styles/frontend.css';

const adminRoot = document.getElementById('emplmasy-admin-root');
if (adminRoot) {
    const root = createRoot(adminRoot);
    root.render(
        <div className="emplmasy-admin-wrapper">
            <AdminApp />
        </div>
    );
} 

const employeeRoot = document.getElementById('emplmasy-employee-root');
if (employeeRoot) {
    const root = createRoot(employeeRoot);
    root.render(
        <div className="emplmasy-frontend-wrapper">
            <EmployeeDashboard />
        </div>
    );
}