import { __ } from '@wordpress/i18n';
import { 
    Card, 
    CardHeader, 
    CardBody,
    SelectControl,
    TextControl,
    Button,
    Notice
} from '@wordpress/components';
import { useState } from '@wordpress/element';

const Settings = () => {
    const [settings, setSettings] = useState({
        dateFormat: 'Y-m-d',
        emailNotifications: 'yes'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch(`${emsData.restUrl}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': emsData.nonce
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                setMessage(__('Settings saved successfully', 'ems'));
            } else {
                throw new Error(__('Failed to save settings', 'ems'));
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setError(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="ems-settings">
            {message && (
                <Notice status="success" isDismissible={false}>
                    {message}
                </Notice>
            )}
            {error && (
                <Notice status="error" isDismissible={false}>
                    {error}
                </Notice>
            )}
            
            <Card>
                <CardHeader>
                    <h2>{__('Settings', 'ems')}</h2>
                </CardHeader>
                <CardBody>
                    <div className="ems-settings-form">
                        <SelectControl
                            label={__('Date Format', 'ems')}
                            value={settings.dateFormat}
                            options={[
                                { label: 'YYYY-MM-DD', value: 'Y-m-d' },
                                { label: 'MM/DD/YYYY', value: 'm/d/Y' },
                                { label: 'DD/MM/YYYY', value: 'd/m/Y' }
                            ]}
                            onChange={(dateFormat) => setSettings({...settings, dateFormat})}
                        />
                        <SelectControl
                            label={__('Email Notifications', 'ems')}
                            value={settings.emailNotifications}
                            options={[
                                { label: __('Enabled', 'ems'), value: 'yes' },
                                { label: __('Disabled', 'ems'), value: 'no' }
                            ]}
                            onChange={(emailNotifications) => setSettings({...settings, emailNotifications})}
                        />
                        <div className="ems-settings-actions">
                            <Button 
                                variant="primary" 
                                onClick={handleSave}
                                isBusy={isSaving}
                                disabled={isSaving}
                            >
                                {isSaving ? __('Saving...', 'ems') : __('Save Settings', 'ems')}
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Settings; 