import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody, Button } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

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
            toast.error(error.message);
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
            
            // Create CSV content with BOM for Excel compatibility
            const BOM = '\uFEFF';
            const csvRows = [
                ['Date', 'Amount', 'Description'], // Headers
                ...response.map(row => [
                    row.date,
                    row.amount,
                    `"${row.description.replace(/"/g, '""')}"` // Escape quotes in description
                ])
            ];
            
            // Create Blob with proper encoding
            const csvContent = BOM + csvRows.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { 
                type: 'application/csv;charset=utf-8'
            });
            
            // Use native browser download if available
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(blob, `employee_sales_${employeeId}.csv`);
                return;
            }
            
            // For modern browsers
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `employee_sales_${employeeId}.csv`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
            }, 100);

        } catch (error) {
            toast.error(error.message || __('Failed to download sales data.', 'employee-management-system'));
        }
    };

    const handleCopyShortcode = async () => {
        try {
            await navigator.clipboard.writeText('[employee_dashboard]');
            toast.success(__('Shortcode copied to clipboard!', 'employee-management-system'));
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = '[employee_dashboard]';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success(__('Shortcode copied to clipboard!', 'employee-management-system'));
            } catch (err) {
                toast.error(__('Failed to copy shortcode.', 'employee-management-system'));
            }
            document.body.removeChild(textArea);
        }
    };

    if (isLoading) {
        return (
            <div className="ems-loading-wrapper">
                <div className="ems-loading">
                    {__('Loading...', 'employee-management-system')}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ems-error-wrapper">
                <Notice status="error" isDismissible={false}>
                    {__('Error loading sales:', 'employee-management-system')} {error}
                </Notice>
            </div>
        );
    }

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
        <div className="ems-admin-page ems-sales-page">
            <div className="ems-admin-header">
                <div className="ems-admin-header-actions">
                    <div className="ems-shortcode-wrapper">
                        <span className="ems-shortcode-label">
                            {__('Shortcode:', 'employee-management-system')}
                        </span>
                        <div 
                            className="ems-shortcode-container" 
                            onClick={handleCopyShortcode}
                            onKeyDown={(e) => e.key === 'Enter' && handleCopyShortcode()}
                            role="button"
                            tabIndex={0}
                        >
                            <code>[employee_dashboard]</code>
                            <span className="copy-hint">
                                {__('Click to copy', 'employee-management-system')}
                            </span>
                        </div>
                        <span>{__('Add this shortcode to any page to display the employee dashboard and allow employees to export their sales data.', 'employee-management-system')}</span>
                    </div>
                </div>
            </div>
            
            <div className="ems-sales-grid">
                {Object.entries(salesByEmployee).map(([employeeId, data]) => (
                    <Card key={employeeId} className="ems-card employee-sales-card">
                        <CardHeader className="employee-sales-card-header">
                            <h2>{data.employee_name}</h2>
                            <Button
                                variant="primary"
                                onClick={() => handleDownloadCSV(employeeId)}
                                className="ems-button download-csv-button"
                                icon="download"
                            >
                                {__('Download CSV', 'employee-management-system')}
                            </Button>
                        </CardHeader>
                        <CardBody>
                            <div className="ems-table-responsive">
                                <table className="ems-table">
                                    <thead>
                                        <tr>
                                            <th>{__('Date', 'employee-management-system')}</th>
                                            <th>{__('Amount', 'employee-management-system')}</th>
                                            <th>{__('Description', 'employee-management-system')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.sales.map((sale) => (
                                            <tr key={sale.id}>
                                                <td>{format(new Date(sale.date), 'yyyy-MM-dd')}</td>
                                                <td className="amount-cell">
                                                    ${sale.amount.toLocaleString()}
                                                </td>
                                                <td>{sale.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th>{__('Total:', 'employee-management-system')}</th>
                                            <th className="amount-cell">
                                                ${data.sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0).toLocaleString()}
                                            </th>
                                            <th></th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Sales; 