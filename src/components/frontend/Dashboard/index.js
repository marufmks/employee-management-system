import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody } from '@wordpress/components';

const EmployeeDashboard = () => {
    return (
        <Card>
            <CardHeader>
                <h2>{__('Employee Dashboard', 'ems')}</h2>
            </CardHeader>
            <CardBody>
                {/* Add employee dashboard content here */}
            </CardBody>
        </Card>
    );
};

export default EmployeeDashboard; 