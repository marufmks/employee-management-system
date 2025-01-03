import { render } from '@wordpress/element';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';

// Initialize Admin Dashboard
const adminContainer = document.getElementById('ems-admin-dashboard');
if (adminContainer) {
    render(<AdminDashboard />, adminContainer);
}

// Initialize Employee Dashboard
const employeeContainer = document.getElementById('ems-employee-dashboard');
if (employeeContainer) {
    render(<EmployeeDashboard />, employeeContainer);
} 