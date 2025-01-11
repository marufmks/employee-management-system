import React from 'react';
import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody } from '@wordpress/components';
import { format } from 'date-fns';

const EmployeeDashboard = () => {
    const currentDate = format(new Date(), 'MMMM dd, yyyy');
    const employeeName = 'John Doe';

    return (
        <div className="employee-dashboard">
            {/* Welcome Section */}
            <div className="welcome-section">
                <h1>{__('Welcome', 'ems')}, {employeeName}</h1>
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
                                <p className="stat-value">$12,000</p>
                                <span className="stat-trend positive">↑ 12%</span>
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
                                <p className="stat-value">20</p>
                                <span className="stat-trend">+5 this month</span>
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
                                <p className="stat-value">$1,200</p>
                                <span className="stat-trend">Last week</span>
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
                    <form className="sales-report-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="date">{__('Date', 'ems')}</label>
                                <input type="date" id="date" name="date" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="amount">{__('Amount', 'ems')}</label>
                                <input type="number" id="amount" name="amount" min="0" step="0.01" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">{__('Description', 'ems')}</label>
                            <textarea 
                                id="description" 
                                name="description" 
                                rows="4"
                                placeholder={__('Enter sale details...', 'ems')}
                            ></textarea>
                        </div>
                        <button type="submit" className="button button-primary">
                            {__('Submit Report', 'ems')} →
                        </button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default EmployeeDashboard; 