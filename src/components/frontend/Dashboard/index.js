import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody } from '@wordpress/components';
import { format } from 'date-fns';
import apiFetch from '@wordpress/api-fetch';

const EmployeeDashboard = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [userData, setUserData] = useState({
        name: '',
        totalSales: 0,
        monthlyReports: 0,
        highestSale: 0,
        highestSaleDate: ''
    });

    useEffect(() => {
        // Verify nonce before making requests
        if (window.emsData && window.emsData.nonce) {
            apiFetch.use(apiFetch.createNonceMiddleware(window.emsData.nonce));
        }
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await apiFetch({
                path: 'ems/v1/employee/stats',
                method: 'GET'
            });
            setUserData(response);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        const formData = new FormData(e.target);
        
        try {
            const response = await apiFetch({
                path: 'ems/v1/sales',
                method: 'POST',
                data: {
                    date: formData.get('date'),
                    amount: formData.get('amount'),
                    description: formData.get('description'),
                }
            });

            setMessage({
                type: 'success',
                text: __('Sale recorded successfully!', 'ems')
            });
            e.target.reset();
            
            // Refresh the stats after successful submission
            fetchUserData();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || __('Failed to save sale record.', 'ems')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentDate = format(new Date(), 'MMMM dd, yyyy');

    return (
        <div className="employee-dashboard">
            {/* Welcome Section */}
            <div className="welcome-section">
                <h1>{__('Welcome', 'ems')}, {userData.name}</h1>
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
                                    <span className="stat-label">{__('Total Sales', 'ems')}</span>
                                </div>
                                <p className="stat-value">${userData.totalSales.toLocaleString()}</p>
                                <span className="stat-trend positive">
                                    {userData.salesTrend > 0 ? '↑' : '↓'} {Math.abs(userData.salesTrend)}%
                                </span>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="stat-card">
                        <CardBody>
                            <div className="stat-content">
                                <div className="stat-header">
                                    <span className="stat-icon">📊</span>
                                    <span className="stat-label">{__('Monthly Reports', 'ems')}</span>
                                </div>
                                <p className="stat-value">{userData.monthlyReports}</p>
                                <span className="stat-trend">
                                    {__('This month', 'ems')}
                                </span>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="stat-card">
                        <CardBody>
                            <div className="stat-content">
                                <div className="stat-header">
                                    <span className="stat-icon">⭐</span>
                                    <span className="stat-label">{__('Highest Sale', 'ems')}</span>
                                </div>
                                <p className="stat-value">${userData.highestSale.toLocaleString()}</p>
                                <span className="stat-trend">
                                    {userData.highestSaleDate}
                                </span>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Add Sales Report Form */}
            <Card className="sales-form">
                <CardHeader>
                    <h2>{__('Quick Sales Entry', 'ems')}</h2>
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
                                <label htmlFor="date">{__('Date', 'ems')}</label>
                                <input type="date" id="date" name="date" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="amount">{__('Amount', 'ems')}</label>
                                <input 
                                    type="number" 
                                    id="amount" 
                                    name="amount" 
                                    min="0" 
                                    step="0.01" 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">{__('Description', 'ems')}</label>
                            <textarea 
                                id="description" 
                                name="description" 
                                rows="4"
                                placeholder={__('Enter sale details...', 'ems')}
                                required
                            ></textarea>
                        </div>
                        <button 
                            type="submit" 
                            className="button button-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting 
                                ? __('Saving...', 'ems')
                                : __('Submit Report', 'ems') + ' →'
                            }
                        </button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default EmployeeDashboard; 