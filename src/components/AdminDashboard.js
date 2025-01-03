import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody } from '@wordpress/components';

const AdminDashboard = () => {
    return (
        <Card>
            <CardHeader>
                <h1>{__('Employee Management System', 'ems')}</h1>
            </CardHeader>
            <CardBody>
                <h2>{__('Welcome to Employee Management System', 'ems')}</h2>
            </CardBody>
        </Card>
    );
};

export default AdminDashboard; 