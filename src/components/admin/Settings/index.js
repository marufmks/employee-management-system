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
                path: 'ems/v1/settings',
                method: 'GET'
            });
            setSettings(response);
            setIsLoading(false);
        } catch (error) {
            showNotification(error.message, 'error');
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
            errors.forEach(error => showNotification(error, 'error'));
            return;
        }

        setIsSaving(true);
        try {
            const response = await apiFetch({
                path: 'ems/v1/settings',
                method: 'POST',
                data: settings
            });

            if (response.success) {
                showNotification(response.message, 'success');
            } else {
                throw new Error(response.message || __('Failed to save settings', 'employee-management-system'));
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
        setIsSaving(false);
    };

    const showNotification = (message, type = 'success') => {
        setNoticeType(type);
        setNoticeMessage(message);
        setShowNotice(true);
        setTimeout(() => setShowNotice(false), 3000);
    };

    if (isLoading) {
        return <div>{__('Loading...', 'employee-management-system')}</div>;
    }

    return (
        <div className="ems-admin-page ems-settings-page">
            

            {showNotice && (
                <Notice 
                    status={noticeType}
                    isDismissible={false}
                    className="ems-notice"
                >
                    {noticeMessage}
                </Notice>
            )}

            <div className="ems-settings-grid">
                {/* General Settings */}
                <Card className="ems-card">
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
                                    { label: __('Before amount ($100)', 'employee-management-system'), value: 'before' },
                                    { label: __('After amount (100$)', 'employee-management-system'), value: 'after' }
                                ]}
                                onChange={(value) => setSettings({...settings, currencyPosition: value})}
                                __nextHasNoMarginBottom={true}
                            />
                        </PanelBody>
                    </Panel>
                </Card>

                {/* System Settings */}
                <Card className="ems-card">
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

            <div className="ems-settings-actions">
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