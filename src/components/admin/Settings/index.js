import { __ } from '@wordpress/i18n';
import { 
    Card, 
    CardHeader, 
    CardBody,
    SelectControl,
    TextControl,
    Button,
    Notice,
    Spinner
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';

const Settings = () => {
    const [settings, setSettings] = useState({
        dateFormat: 'Y-m-d',
        emailNotifications: 'yes'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [originalSettings, setOriginalSettings] = useState({
        dateFormat: 'Y-m-d',
        emailNotifications: 'yes'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${emsData.restUrl}/settings`, {
                headers: {
                    'X-WP-Nonce': emsData.nonce
                }
            });

            if (!response.ok) {
                throw new Error(__('Failed to fetch settings', 'employee-management-system'));
            }

            const data = await response.json();
            setSettings(data);
            setOriginalSettings(data);
            setError('');
        } catch (error) {
            console.error('Error fetching settings:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');
        setError('');

        // Check if settings have changed
        if (settings.dateFormat === originalSettings.dateFormat &&
            settings.emailNotifications === originalSettings.emailNotifications) {
            setMessage(__('No changes detected', 'employee-management-system'));
            setIsSaving(false);
            return;
        }

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
                setMessage(__('Settings saved successfully', 'employee-management-system'));
            } else {
                throw new Error(__('Failed to save settings', 'employee-management-system'));
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setError(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="ems-loading">
                <Spinner />
            </div>
        );
    }

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
                    <h2>{__('Settings', 'employee-management-system')}</h2>
                </CardHeader>
                <CardBody>
                    <div className="ems-settings-form">
                        <SelectControl
                            label={__('Date Format', 'employee-management-system')}
                            value={settings.dateFormat}
                            options={[
                                { label: 'YYYY-MM-DD', value: 'Y-m-d' },
                                { label: 'MM/DD/YYYY', value: 'm/d/Y' },
                                { label: 'DD/MM/YYYY', value: 'd/m/Y' }
                            ]}
                            onChange={(dateFormat) => setSettings({...settings, dateFormat})}
                        />
                        <SelectControl
                            label={__('Email Notifications', 'employee-management-system')}
                            value={settings.emailNotifications}
                            options={[
                                { label: __('Enabled', 'employee-management-system'), value: 'yes' },
                                { label: __('Disabled', 'employee-management-system'), value: 'no' }
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
                                {isSaving ? __('Saving...', 'employee-management-system') : __('Save Settings', 'employee-management-system')}
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Settings; 