import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { 
    Card, 
    CardHeader, 
    CardBody,
    Flex,
    FlexItem,
    Spinner,
    Notice
} from '@wordpress/components';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        departments: {}
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${emsData.restUrl}/employees`, {
                headers: {
                    'X-WP-Nonce': emsData.nonce
                }
            });
            
            if (!response.ok) {
                throw new Error(__('Failed to fetch statistics', 'ems'));
            }
            
            const employees = await response.json();
            
            // Calculate department statistics
            const departmentStats = employees.reduce((acc, employee) => {
                acc[employee.department] = (acc[employee.department] || 0) + 1;
                return acc;
            }, {});

            setStats({
                totalEmployees: employees.length,
                departments: departmentStats
            });
            setError('');
        } catch (error) {
            console.error('Error fetching statistics:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
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
        <div className="ems-dashboard">
            {error && (
                <Notice status="error" isDismissible={false}>
                    {error}
                </Notice>
            )}
            
            <Card>
                <CardHeader>
                    <h2>{__('Dashboard Overview', 'ems')}</h2>
                </CardHeader>
                <CardBody>
                    <Flex gap={4} className="summary-cards">
                        <FlexItem>
                            <Card>
                                <CardBody>
                                    <h3>{__('Total Employees', 'ems')}</h3>
                                    <p className="stat-number">{stats.totalEmployees}</p>
                                </CardBody>
                            </Card>
                        </FlexItem>
                    </Flex>

                    <div className="department-stats">
                        <h3>{__('Employees by Department', 'ems')}</h3>
                        {Object.entries(stats.departments).map(([department, count]) => (
                            <div key={department} className="department-stat">
                                <span className="department-name">
                                    {department.charAt(0).toUpperCase() + department.slice(1)}
                                </span>
                                <span className="department-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Dashboard; 