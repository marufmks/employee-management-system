import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody } from '@wordpress/components';

const EmployeeDashboard = () => {
    return (
        <Card>
            <CardHeader>
                <h1>{__('Employee Dashboard', 'ems')}</h1>
            </CardHeader>
            <CardBody>
                <h2>{__('Welcome to Your Dashboard', 'ems')}</h2>
            </CardBody>
        </Card>
    );
};

export default EmployeeDashboard; 