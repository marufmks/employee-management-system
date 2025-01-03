import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody } from '@wordpress/components';

const Dashboard = () => {
    return (
        <Card>
            <CardHeader>
                <h2>{__('Dashboard', 'ems')}</h2>
            </CardHeader>
            <CardBody>
                {/* Add dashboard content here */}
            </CardBody>
        </Card>
    );
};

export default Dashboard; 