import { createRoot } from '@wordpress/element';
import AdminApp from './components/admin/App';
import EmployeeDashboard from './components/frontend/Dashboard';
import './styles/index.css';

const adminRoot = document.getElementById('ems-admin-root');
if (adminRoot) {
    const root = createRoot(adminRoot);
    root.render(<AdminApp />);
} 

const employeeRoot = document.getElementById('ems-employee-root');
if (employeeRoot) {
    const root = createRoot(employeeRoot);
    root.render(<EmployeeDashboard />);
}