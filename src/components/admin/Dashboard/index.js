import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Card, CardHeader, CardBody } from '@wordpress/components';
import { Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        blockedEmployees: 0,
        inactiveEmployees: 0,
    });
    const [salesData, setSalesData] = useState({
        labels: [],
        data: [],
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [employeeStats, monthlySales] = await Promise.all([
                apiFetch({ path: 'ems/v1/dashboard/employee-stats' }),
                apiFetch({ path: 'ems/v1/dashboard/monthly-sales' })
            ]);

            setStats(employeeStats);
            setSalesData(monthlySales);
            setIsLoading(false);
        } catch (error) {
            setError(error.message);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div>{__('Loading...', 'employee-management-system')}</div>;
    }

    const employeeStatusData = {
        labels: [__('Active', 'employee-management-system'), __('Inactive', 'employee-management-system'), __('Blocked', 'employee-management-system')],
        datasets: [
            {
                data: [stats.activeEmployees, stats.inactiveEmployees, stats.blockedEmployees],
                backgroundColor: ['#00a32a', '#cc1818', '#d63638'],
            },
        ],
    };

    const salesChartData = {
        labels: salesData.labels,
        datasets: [
            {
                label: __('Monthly Sales', 'employee-management-system'),
                data: salesData.data,
                fill: false,
                borderColor: '#2271b1',
                tension: 0.1,
            },
        ],
    };

    return (
        <div className="ems-admin ems-dashboard-wrapper">
            <div className="ems-dashboard">
                {/* Stats Cards */}
                <div className="ems-stats-grid">
                    <Card className="ems-stat-card">
                        <CardBody>
                            <h3>{__('Total Employees', 'employee-management-system')}</h3>
                            <div className="ems-stat-value">{stats.totalEmployees}</div>
                        </CardBody>
                    </Card>

                    <Card className="ems-stat-card active">
                        <CardBody>
                            <h3>{__('Active Employees', 'employee-management-system')}</h3>
                            <div className="ems-stat-value">{stats.activeEmployees}</div>
                        </CardBody>
                    </Card>

                    <Card className="ems-stat-card inactive">
                        <CardBody>
                            <h3>{__('Inactive Employees', 'employee-management-system')}</h3>
                            <div className="ems-stat-value">{stats.inactiveEmployees}</div>
                        </CardBody>
                    </Card>

                    <Card className="ems-stat-card blocked">
                        <CardBody>
                            <h3>{__('Blocked Employees', 'employee-management-system')}</h3>
                            <div className="ems-stat-value">{stats.blockedEmployees}</div>
                        </CardBody>
                    </Card>
                </div>

                {/* Charts */}
                <div className="charts-grid">
                    <Card>
                        <CardHeader>
                            <h2>{__('Employee Status Distribution', 'employee-management-system')}</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="chart-container">
                                <Pie data={employeeStatusData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                }} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2>{__('Monthly Sales Trend', 'employee-management-system')}</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="chart-container">
                                <Line data={salesChartData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                        },
                                    },
                                }} />
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 