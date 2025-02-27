import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { 
    Card, 
    CardHeader, 
    CardBody, 
    SelectControl, 
    ToggleControl,
    TextControl,
    Button,
    Notice,
    Panel,
    PanelBody
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { toast } from 'react-toastify';

const Settings = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showNotice, setShowNotice] = useState(false);
    const [noticeType, setNoticeType] = useState('success');
    const [noticeMessage, setNoticeMessage] = useState('');
    
    const [settings, setSettings] = useState({
        // General Settings
        dateFormat: 'Y-m-d',
        currencySymbol: '$',
        currencyPosition: 'before',
        
        // System Settings
        deleteDataOnUninstall: false
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await apiFetch({
                path: 'emplmasy/v1/settings',
                method: 'GET'
            });
            setSettings(response);
            setIsLoading(false);
        } catch (error) {
            toast.error(error.message);
            setIsLoading(false);
        }
    };

    const validateSettings = () => {
        const errors = [];
        
        if (!settings.adminEmail && settings.emailNotifications) {
            errors.push(__('Admin email is required when notifications are enabled', 'employee-management-system'));
        }

        if (parseFloat(settings.maxSaleAmount) <= 0) {
            errors.push(__('Maximum sale amount must be greater than 0', 'employee-management-system'));
        }

        return errors;
    };

    const saveSettings = async () => {
        const errors = validateSettings();
        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
            return;
        }

        setIsSaving(true);
        try {
            const response = await apiFetch({
                path: 'emplmasy/v1/settings',
                method: 'POST',
                data: settings
            });

            if (response.success) {
                toast.success(response.message);
            } else {
                throw new Error(response.message || __('Failed to save settings', 'employee-management-system'));
            }
        } catch (error) {
            toast.error(error.message);
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return <div>{__('Loading...', 'employee-management-system')}</div>;
    }

    return (
        <div className="emplmasy-admin-page emplmasy-settings-page">
            

            {showNotice && (
                <Notice 
                    status={noticeType}
                    isDismissible={false}
                    className="emplmasy-notice"
                >
                    {noticeMessage}
                </Notice>
            )}

            <div className="emplmasy-settings-grid">
                {/* General Settings */}
                <Card className="emplmasy-card">
                    <Panel>
                        <PanelBody title={__('General Settings', 'employee-management-system')} initialOpen={true}>
                            <SelectControl
                                label={__('Date Format', 'employee-management-system')}
                                value={settings.dateFormat}
                                options={[
                                    { label: 'YYYY-MM-DD', value: 'Y-m-d' },
                                    { label: 'MM/DD/YYYY', value: 'm/d/Y' },
                                    { label: 'DD/MM/YYYY', value: 'd/m/Y' },
                                    { label: 'YYYY.MM.DD', value: 'Y.m.d' }
                                ]}
                                onChange={(value) => setSettings({...settings, dateFormat: value})}
                                __nextHasNoMarginBottom={true}
                            />

                            <TextControl
                                label={__('Currency Symbol', 'employee-management-system')}
                                value={settings.currencySymbol}
                                onChange={(value) => setSettings({...settings, currencySymbol: value})}
                                __nextHasNoMarginBottom={true}
                            />

                            <SelectControl
                                label={__('Currency Position', 'employee-management-system')}
                                value={settings.currencyPosition}
                                options={[
                                    { label: `${__('Before amount', 'employee-management-system')} (${settings.currencySymbol}100)`, value: 'before' },
                                    { label: `${__('After amount', 'employee-management-system')} (100${settings.currencySymbol})`, value: 'after' }
                                ]}
                                onChange={(value) => setSettings({...settings, currencyPosition: value})}
                                __nextHasNoMarginBottom={true}
                            />
                        </PanelBody>
                    </Panel>
                </Card>

                {/* System Settings */}
                <Card className="emplmasy-card">
                    <Panel>
                        <PanelBody title={__('System Settings', 'employee-management-system')} initialOpen={true}>
                            <ToggleControl
                                label={__('Delete Data on Uninstall', 'employee-management-system')}
                                checked={settings.deleteDataOnUninstall}
                                onChange={(value) => setSettings({...settings, deleteDataOnUninstall: value})}
                                help={__('If enabled, all plugin data will be deleted when the plugin is uninstalled', 'employee-management-system')}
                                __nextHasNoMarginBottom={true}
                            />
                        </PanelBody>
                    </Panel>
                </Card>
            </div>

            <div className="emplmasy-settings-actions">
                <Button
                    isPrimary
                    isBusy={isSaving}
                    onClick={saveSettings}
                    disabled={isSaving}
                >
                    {isSaving 
                        ? __('Saving...', 'employee-management-system')
                        : __('Save Settings', 'employee-management-system')
                    }
                </Button>
            </div>
        </div>
    );
};

export default Settings; 