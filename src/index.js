import { createRoot } from '@wordpress/element';
import AdminApp from './components/admin/App';
import './styles/index.css';

const adminRoot = document.getElementById('ems-admin-root');
if (adminRoot) {
    const root = createRoot(adminRoot);
    root.render(<AdminApp />);
} 