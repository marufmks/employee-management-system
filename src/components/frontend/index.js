import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody } from '@wordpress/components';
import { format } from 'date-fns';
import apiFetch from '@wordpress/api-fetch';
import { TextControl, TextareaControl } from '@wordpress/components';

const EmployeeDashboard = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [userData, setUserData] = useState({
        name: '',
        totalSales: 0,
        monthlyReports: 0,
        highestSale: 0,
        highestSaleDate: '',
        salesTrend: 0,
        employeeData: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasAccess, setHasAccess] = useState(false);

    const [formData, setFormData] = useState({
        date: '',
        amount: '',
        description: ''
    });

    useEffect(() => {
        if (window.emsData && window.emsData.nonce) {
            apiFetch.use(apiFetch.createNonceMiddleware(window.emsData.nonce));
        }
        checkAccess();
    }, []);

    const checkAccess = async () => {
        try {
            setIsLoading(true);
            const response = await apiFetch({
                path: 'ems/v1/employee/access',
                method: 'GET'
            });

            if (response.status === 'success') {
                setHasAccess(true);
                fetchUserData();
            }
        } catch (error) {
            setError(error.message || __('Access denied.', 'employee-management-system'));
            setHasAccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await apiFetch({
                path: 'ems/v1/employee/stats',
                method: 'GET'
            });

            if (!response) {
                throw new Error(__('No data received from server', 'employee-management-system'));
            }

            const {
                name = __('Employee', 'employee-management-system'),
                totalSales = 0,
                monthlyReports = 0,
                highestSale = 0,
                highestSaleDate = '',
                salesTrend = 0,
                employeeData = null
            } = response;

            setUserData({
                name,
                totalSales,
                monthlyReports,
                highestSale,
                highestSaleDate,
                salesTrend,
                employeeData
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);
        
        try {
            const response = await apiFetch({
                path: 'ems/v1/sales',
                method: 'POST',
                data: formData
            });

            setMessage({
                type: 'success',
                text: __('Sale recorded successfully!', 'employee-management-system')
            });
            
            // Reset form
            setFormData({
                date: '',
                amount: '',
                description: ''
            });
            
            // Refresh the stats
            fetchUserData();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || __('Failed to save sale record.', 'employee-management-system')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentDate = format(new Date(), 'MMMM dd, yyyy');

    if (isLoading) {
        return (
            <div className="ems-frontend ems-dashboard-wrapper">
                <div className="ems-loading">
                    {__('Loading...', 'employee-management-system')}
                </div>
            </div>
        );
    }

    if (!hasAccess || error) {
        return (
            <div className="ems-frontend ems-dashboard-wrapper">
                <div className="access-denied">
                    <div className="notice notice-error">
                        <p>{error || __('Access denied.', 'employee-management-system')}</p>
                    </div>
                    <p className="access-denied-help">
                        {__('If you believe this is an error, please contact your administrator.', 'employee-management-system')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="ems-frontend ems-dashboard-wrapper">
            {/* Welcome Section */}
            <div className="welcome-section">
                <h1>{__('Welcome', 'employee-management-system')}, {userData.name}</h1>
                <p className="current-date">{currentDate}</p>
            </div>

            {/* Dashboard Stats */}
            <div className="dashboard-stats-wrapper">
                <div className="dashboard-stats">
                    <Card className="stat-card">
                        <CardBody>
                            <div className="stat-content">
                                <div className="stat-header">
                                    <span className="stat-icon">💰</span>
                                    <span className="stat-label">{__('Total Sales', 'employee-management-system')}</span>
                                </div>
                                <p className="stat-value">
                                    ${(userData.totalSales || 0).toLocaleString()}
                                </p>
                                <span className="stat-trend positive">
                                    {(userData.salesTrend || 0) > 0 ? '↑' : '↓'} {Math.abs(userData.salesTrend || 0)}%
                                </span>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="stat-card">
                        <CardBody>
                            <div className="stat-content">
                                <div className="stat-header">
                                    <span className="stat-icon">📊</span>
                                    <span className="stat-label">{__('Monthly Reports', 'employee-management-system')}</span>
                                </div>
                                <p className="stat-value">{userData.monthlyReports || 0}</p>
                                <span className="stat-trend">
                                    {__('This month', 'employee-management-system')}
                                </span>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="stat-card">
                        <CardBody>
                            <div className="stat-content">
                                <div className="stat-header">
                                    <span className="stat-icon">⭐</span>
                                    <span className="stat-label">{__('Highest Sale', 'employee-management-system')}</span>
                                </div>
                                <p className="stat-value">
                                    ${(userData.highestSale || 0).toLocaleString()}
                                </p>
                                <span className="stat-trend">
                                    {userData.highestSaleDate || ''}
                                </span>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Add Sales Report Form */}
            <Card className="sales-form">
                <CardHeader>
                    <h2>{__('Quick Sales Entry', 'employee-management-system')}</h2>
                </CardHeader>
                <CardBody>
                    {message && (
                        <div className={`notice notice-${message.type}`}>
                            <p>{message.text}</p>
                        </div>
                    )}
                    <form className="sales-report-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <TextControl
                                    label={__('Date', 'employee-management-system')}
                                    type="date"
                                    value={formData.date}
                                    onChange={value => handleInputChange('date', value)}
                                    required
                                    __nextHasNoMarginBottom={true}
                                />
                            </div>
                            <div className="form-group">
                                <TextControl
                                    label={__('Amount', 'employee-management-system')}
                                    type="number"
                                    value={formData.amount}
                                    onChange={value => handleInputChange('amount', value)}
                                    min="0"
                                    step="0.01"
                                    required
                                    __nextHasNoMarginBottom={true}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <TextareaControl
                                label={__('Description', 'employee-management-system')}
                                value={formData.description}
                                onChange={value => handleInputChange('description', value)}
                                rows={4}
                                placeholder={__('Enter sale details...', 'employee-management-system')}
                                required
                                __nextHasNoMarginBottom={true}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="button button-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting 
                                ? __('Saving...', 'employee-management-system')
                                : __('Submit Report', 'employee-management-system') + ' →'
                            }
                        </button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default EmployeeDashboard; 