import { __ } from '@wordpress/i18n';
import { useState, useEffect, Fragment } from '@wordpress/element';
import { 
    Card, 
    CardHeader, 
    CardBody,
    Button,
    Modal,
    TextControl,
    SelectControl,
    Notice
} from '@wordpress/components';

/* global emsData */

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');
    const [newEmployee, setNewEmployee] = useState({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        position: '',
        hireDate: ''
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch(`${emsData.restUrl}/employees`, {
                headers: {
                    'X-WP-Nonce': emsData.nonce
                }
            });
            const data = await response.json();
            
            // Ensure data is an array
            if (Array.isArray(data)) {
                setEmployees(data);
                setError('');
            } else {
                setEmployees([]);
                setError(__('Invalid data received from server', 'employee-management-system'));
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            setEmployees([]);
            setError(__('Failed to fetch employees', 'employee-management-system'));
        }
    };

    const handleAddEmployee = async () => {
        try {
            const response = await fetch(`${emsData.restUrl}/employees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': emsData.nonce
                },
                body: JSON.stringify(newEmployee)
            });
            
            if (response.ok) {
                setIsModalOpen(false);
                fetchEmployees();
                setNewEmployee({
                    firstName: '',
                    lastName: '',
                    email: '',
                    department: '',
                    position: '',
                    hireDate: ''
                });
            } else {
                const error = await response.json();
                setError(error.message || __('Failed to add employee', 'employee-management-system'));
            }
        } catch (error) {
            console.error('Error adding employee:', error);
            setError(__('Failed to add employee', 'employee-management-system'));
        }
    };

    const handleDeleteEmployee = async (id) => {
        try {
            const response = await fetch(`${emsData.restUrl}/employees/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-WP-Nonce': emsData.nonce
                }
            });
            
            if (response.ok) {
                fetchEmployees();
            } else {
                const error = await response.json();
                setError(error.message || __('Failed to delete employee', 'employee-management-system'));
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            setError(__('Failed to delete employee', 'employee-management-system'));
        }
    };

    const handleEditEmployee = async () => {
        try {
            const response = await fetch(`${emsData.restUrl}/employees/${employeeToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': emsData.nonce
                },
                body: JSON.stringify(employeeToEdit)
            });

            if (response.ok) {
                setIsEditModalOpen(false);
                fetchEmployees();
                setEmployeeToEdit(null);
            } else {
                const error = await response.json();
                setError(error.message || __('Failed to update employee', 'employee-management-system'));
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            setError(__('Failed to update employee', 'employee-management-system'));
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        return date;
    };

    return (
        <Fragment>
            <div className="ems-employees">
                {error && (
                    <Notice status="error" isDismissible={false}>
                        {error}
                    </Notice>
                )}
                <Card>
                    <CardHeader>
                        <h2>{__('Employees', 'employee-management-system')}</h2>
                        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                            {__('Add New Employee', 'employee-management-system')}
                        </Button>
                    </CardHeader>
                    <CardBody>
                        <div className="ems-table">
                            <table className="wp-list-table widefat fixed striped">
                                <thead>
                                    <tr>
                                        <th>{__('Name', 'employee-management-system')}</th>
                                        <th>{__('Email', 'employee-management-system')}</th>
                                        <th>{__('Department', 'employee-management-system')}</th>
                                        <th>{__('Position', 'employee-management-system')}</th>
                                        <th>{__('Hire Date', 'employee-management-system')}</th>
                                        <th>{__('Actions', 'employee-management-system')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(employees) && employees.length > 0 ? (
                                        employees.map((employee) => (
                                            <tr key={employee.id}>
                                                <td>{`${employee.firstName} ${employee.lastName}`}</td>
                                                <td>{employee.email}</td>
                                                <td>{employee.department}</td>
                                                <td>{employee.position}</td>
                                                <td>{formatDate(employee.hireDate)}</td>
                                                <td>
                                                    <Button 
                                                        isDestructive
                                                        onClick={() => handleDeleteEmployee(employee.id)}
                                                        style={{ color: '#d63638' }} 
                                                    >
                                                        {__('Delete', 'employee-management-system')}
                                                    </Button>
                                                    <Button 
                                                        
                                                        onClick={() => {
                                                            setEmployeeToEdit(employee);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        style={{ color: '#2271b1' }} 
                                                    >
                                                        {__('Edit', 'employee-management-system')}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center' }}>
                                                {__('No employees found', 'employee-management-system')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>

                {isModalOpen && (
                    <Modal
                        title={__('Add New Employee', 'employee-management-system')}
                        onRequestClose={() => setIsModalOpen(false)}
                    >
                        <div className="ems-employee-form">
                            <TextControl
                                label={__('First Name', 'employee-management-system')}
                                value={newEmployee.firstName}
                                onChange={(firstName) => setNewEmployee({...newEmployee, firstName})}
                            />
                            <TextControl
                                label={__('Last Name', 'employee-management-system')}
                                value={newEmployee.lastName}
                                onChange={(lastName) => setNewEmployee({...newEmployee, lastName})}
                            />
                            <TextControl
                                label={__('Email', 'employee-management-system')}
                                type="email"
                                value={newEmployee.email}
                                onChange={(email) => setNewEmployee({...newEmployee, email})}
                            />
                            <SelectControl
                                label={__('Department', 'employee-management-system')}
                                value={newEmployee.department}
                                options={[
                                    { label: 'Sales', value: 'sales' },
                                    { label: 'Marketing', value: 'marketing' },
                                    { label: 'Support', value: 'support' }
                                ]}
                                onChange={(department) => setNewEmployee({...newEmployee, department})}
                            />
                            <TextControl
                                label={__('Position', 'employee-management-system')}
                                value={newEmployee.position}
                                onChange={(position) => setNewEmployee({...newEmployee, position})}
                            />
                            <div className="components-base-control">
                                <label className="components-base-control__label">
                                    {__('Hire Date', 'employee-management-system')}
                                </label>
                                <input
                                    type="date"
                                    className="components-text-control__input"
                                    value={newEmployee.hireDate}
                                    onChange={(e) => setNewEmployee({...newEmployee, hireDate: e.target.value})}
                                />
                            </div>
                            <Button style={{ marginTop: '10px' }} variant="primary" onClick={handleAddEmployee}>
                                {__('Add Employee', 'employee-management-system')}
                            </Button>
                        </div>
                    </Modal>
                )}

                {isEditModalOpen && (
                    <Modal
                        title={__('Edit Employee', 'employee-management-system')}
                        onRequestClose={() => setIsEditModalOpen(false)}
                    >
                        <div className="ems-employee-form">
                            <TextControl
                                label={__('First Name', 'employee-management-system')}
                                value={employeeToEdit.firstName}
                                onChange={(firstName) => setEmployeeToEdit({...employeeToEdit, firstName})}
                            />
                            <TextControl
                                label={__('Last Name', 'employee-management-system')}
                                value={employeeToEdit.lastName}
                                onChange={(lastName) => setEmployeeToEdit({...employeeToEdit, lastName})}
                            />
                            <TextControl
                                label={__('Email', 'employee-management-system')}
                                type="email"
                                value={employeeToEdit.email}
                                onChange={(email) => setEmployeeToEdit({...employeeToEdit, email})}
                            />
                            <SelectControl
                                label={__('Department', 'employee-management-system')}
                                value={employeeToEdit.department}
                                options={[
                                    { label: 'Sales', value: 'sales' },
                                    { label: 'Marketing', value: 'marketing' },
                                    { label: 'Support', value: 'support' }
                                ]}
                                onChange={(department) => setEmployeeToEdit({...employeeToEdit, department})}
                            />
                            <TextControl
                                label={__('Position', 'employee-management-system')}
                                value={employeeToEdit.position}
                                onChange={(position) => setEmployeeToEdit({...employeeToEdit, position})}
                            />
                            <div className="components-base-control">
                                <label className="components-base-control__label">
                                    {__('Hire Date', 'employee-management-system')}
                                </label>
                                <input
                                    type="date"
                                    className="components-text-control__input"
                                    value={employeeToEdit.hireDate}
                                    onChange={(e) => setEmployeeToEdit({...employeeToEdit, hireDate: e.target.value})}
                                />
                            </div>
                            <Button style={{ marginTop: '10px' }} variant="primary" onClick={handleEditEmployee}>
                                {__('Update Employee', 'employee-management-system')}
                            </Button>
                        </div>
                    </Modal>
                )}
            </div>
        </Fragment>
    );
};

export default Employees; 