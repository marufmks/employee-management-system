import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody } from '@wordpress/components';

const Settings = () => {
    return (
        <Card>
            <CardHeader>
                <h2>{__('Settings', 'ems')}</h2>
            </CardHeader>
            <CardBody>
                {/* Add settings form here */}
            </CardBody>
        </Card>
    );
};

export default Settings; 