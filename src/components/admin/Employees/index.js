import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody } from '@wordpress/components';

const Employees = () => {
    return (
        <Card>
            <CardHeader>
                <h2>{__('Employees', 'ems')}</h2>
            </CardHeader>
            <CardBody>
                {/* Add employees list/management here */}
            </CardBody>
        </Card>
    );
};

export default Employees; 