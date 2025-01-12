import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody, Button } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { format } from 'date-fns';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const response = await apiFetch({
                path: 'ems/v1/sales',
                method: 'GET'
            });
            setSales(response);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadCSV = async (employeeId) => {
        try {
            const response = await apiFetch({
                path: `ems/v1/sales/download/${employeeId}`,
                method: 'GET'
            });
            
            // Create CSV content
            const csvContent = 'data:text/csv;charset=utf-8,' 
                + 'Date,Amount,Description\n'
                + response.map(row => 
                    `${row.date},${row.amount},"${row.description}"`
                ).join('\n');

            // Create download link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `employee_sales_${employeeId}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download CSV:', error);
        }
    };

    if (isLoading) return <div>{__('Loading...', 'ems')}</div>;
    if (error) return <div>{__('Error loading sales:', 'ems')} {error}</div>;

    // Group sales by employee
    const salesByEmployee = sales.reduce((acc, sale) => {
        if (!acc[sale.user_id]) {
            acc[sale.user_id] = {
                employee_name: sale.employee_name,
                sales: []
            };
        }
        acc[sale.user_id].sales.push(sale);
        return acc;
    }, {});

    return (
        <div className="ems-sales">
            <h1>{__('Sales Reports', 'ems')}</h1>
            
            {Object.entries(salesByEmployee).map(([employeeId, data]) => (
                <Card key={employeeId} className="employee-sales-card">
                    <CardHeader>
                        <h2>{data.employee_name}</h2>
                        <Button
                            isPrimary
                            onClick={() => handleDownloadCSV(employeeId)}
                        >
                            {__('Download CSV', 'ems')}
                        </Button>
                    </CardHeader>
                    <CardBody>
                        <table className="wp-list-table widefat fixed striped">
                            <thead>
                                <tr>
                                    <th>{__('Date', 'ems')}</th>
                                    <th>{__('Amount', 'ems')}</th>
                                    <th>{__('Description', 'ems')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.sales.map((sale) => (
                                    <tr key={sale.id}>
                                        <td>{format(new Date(sale.date), 'yyyy-MM-dd')}</td>
                                        <td>${sale.amount.toLocaleString()}</td>
                                        <td>{sale.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th>{__('Total:', 'ems')}</th>
                                    <th>
                                        ${data.sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0).toLocaleString()}
                                    </th>
                                    <th></th>
                                </tr>
                            </tfoot>
                        </table>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
};

export default Sales; 