import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { 
    TextControl, 
    SelectControl,
    Button,
    Card,
    CardHeader,
    CardBody,
    DatePicker,
    TextareaControl,
    Panel,
    PanelBody,
} from '@wordpress/components';

const EmployeeForm = ({ employee, onSubmit, isEditing, onSuccess }) => {
    const initialFormState = {
        user_id: '',
        department: '',
        designation: '',
        join_date: '',
        leave_date: '',
        starting_salary: '',
        current_salary: '',
        phone: '',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',
        marital_status: 'single',
        status: 'active',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    useEffect(() => {
        fetchAvailableUsers();
        if (employee) {
            setFormData(employee);
        } else {
            setFormData(initialFormState);
        }
    }, [employee]);

    const resetForm = () => {
        setFormData(initialFormState);
    };

    const fetchAvailableUsers = async () => {
        try {
            setIsLoadingUsers(true);
            const response = await apiFetch({
                path: 'ems/v1/available-users',
                method: 'GET'
            });
            setUsers(response);
        } catch (err) {
            // Handle error appropriately
        } finally {
            setIsLoadingUsers(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <h2>{isEditing ? __('Edit Employee', 'employee-management-system') : __('Add New Employee', 'employee-management-system')}</h2>
            </CardHeader>
            <CardBody>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(formData).then(() => {
                        if (!isEditing) {
                            resetForm();
                        }
                        if (onSuccess) {
                            onSuccess();
                        }
                    });
                }}>
                    <Panel>
                        <PanelBody title={__('Basic Information', 'employee-management-system')} initialOpen={true}>
                            <SelectControl
                                label={__('Select User', 'employee-management-system')}
                                value={formData.user_id}
                                options={[
                                    { 
                                        value: '', 
                                        label: isLoadingUsers 
                                            ? __('Loading users...', 'employee-management-system')
                                            : __('Select a user...', 'employee-management-system') 
                                    },
                                    ...users
                                ]}
                                onChange={(value) => setFormData({...formData, user_id: value})}
                                disabled={isEditing || isLoadingUsers}
                                help={
                                    users.length === 0 && !isLoadingUsers 
                                        ? __('No available users found. All users are already employees.', 'employee-management-system')
                                        : ''
                                }
                            />
                            
                            <div className="form-row">
                                <TextControl
                                    label={__('Department', 'employee-management-system')}
                                    value={formData.department}
                                    onChange={(value) => setFormData({...formData, department: value})}
                                />
                                
                                <TextControl
                                    label={__('Designation', 'employee-management-system')}
                                    value={formData.designation}
                                    onChange={(value) => setFormData({...formData, designation: value})}
                                />
                            </div>

                            <div className="form-row">
                                <TextControl
                                    label={__('Starting Salary', 'employee-management-system')}
                                    type="number"
                                    value={formData.starting_salary}
                                    onChange={(value) => setFormData({...formData, starting_salary: value})}
                                    className="salary-field"
                                />
                                
                                <TextControl
                                    label={__('Current Salary', 'employee-management-system')}
                                    type="number"
                                    value={formData.current_salary}
                                    onChange={(value) => setFormData({...formData, current_salary: value})}
                                    className="salary-field"
                                />
                            </div>

                            <div className="form-row">
                                <TextControl
                                    label={__('Join Date', 'employee-management-system')}
                                    type="date"
                                    value={formData.join_date}
                                    onChange={(value) => setFormData({...formData, join_date: value})}
                                />
                                
                                <TextControl
                                    label={__('Leave Date', 'employee-management-system')}
                                    type="date"
                                    value={formData.leave_date}
                                    onChange={(value) => setFormData({...formData, leave_date: value})}
                                />
                            </div>

                            <div className="form-row">
                                <TextControl
                                    label={__('Phone', 'employee-management-system')}
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(value) => setFormData({...formData, phone: value})}
                                    className="phone-field"
                                />
                                
                                <SelectControl
                                    label={__('Marital Status', 'employee-management-system')}
                                    value={formData.marital_status}
                                    options={[
                                        { label: __('Single', 'employee-management-system'), value: 'single' },
                                        { label: __('Married', 'employee-management-system'), value: 'married' },
                                    ]}
                                    onChange={(value) => setFormData({...formData, marital_status: value})}
                                />
                            </div>

                            <div className="form-row">
                                <SelectControl
                                    label={__('Employee Status', 'employee-management-system')}
                                    value={formData.status}
                                    options={[
                                        { label: __('Active', 'employee-management-system'), value: 'active' },
                                        { label: __('Inactive', 'employee-management-system'), value: 'inactive' },
                                        { label: __('Blocked', 'employee-management-system'), value: 'blocked' },
                                    ]}
                                    onChange={(value) => setFormData({...formData, status: value})}
                                />
                            </div>
                        </PanelBody>
                    </Panel>

                    {/* Address and Emergency Contact panels side by side */}
                    <div className="panel-grid">
                        {/* Address Panel */}
                        <Panel>
                            <PanelBody title={__('Address Information', 'employee-management-system')} initialOpen={true}>
                                <TextareaControl
                                    label={__('Street Address', 'employee-management-system')}
                                    value={formData.street_address} rows={1}
                                    onChange={(value) => setFormData({...formData, street_address: value})}
                                    className="address-field"
                                />
                                
                                <div className="address-grid">
                                    <TextControl
                                        label={__('City', 'employee-management-system')}
                                        value={formData.city}
                                        onChange={(value) => setFormData({...formData, city: value})}
                                    />
                                    
                                    <TextControl
                                        label={__('State', 'employee-management-system')}
                                        value={formData.state}
                                        onChange={(value) => setFormData({...formData, state: value})}
                                    />
                                    
                                    <TextControl
                                        label={__('Postal Code', 'employee-management-system')}
                                        value={formData.postal_code}
                                        onChange={(value) => setFormData({...formData, postal_code: value})}
                                    />
                                    
                                    <TextControl
                                        label={__('Country', 'employee-management-system')}
                                        value={formData.country}
                                        onChange={(value) => setFormData({...formData, country: value})}
                                    />
                                </div>
                            </PanelBody>
                        </Panel>

                        {/* Emergency Contact Panel */}
                        <Panel>
                            <PanelBody title={__('Emergency Contact', 'employee-management-system')} initialOpen={true}>
                                <TextControl
                                    label={__('Contact Name', 'employee-management-system')}
                                    value={formData.emergency_contact_name}
                                    onChange={(value) => setFormData({...formData, emergency_contact_name: value})}
                                />
                                
                                <TextControl
                                    label={__('Contact Phone', 'employee-management-system')}
                                    type="tel"
                                    value={formData.emergency_contact_phone}
                                    onChange={(value) => setFormData({...formData, emergency_contact_phone: value})}
                                />
                                
                                <TextControl
                                    label={__('Relationship', 'employee-management-system')}
                                    value={formData.emergency_contact_relation}
                                    onChange={(value) => setFormData({...formData, emergency_contact_relation: value})}
                                />
                            </PanelBody>
                        </Panel>
                    </div>

                    <div className="form-actions">
                        <Button
                            isPrimary
                            type="submit"
                        >
                            {isEditing ? __('Update Employee', 'employee-management-system') : __('Add Employee', 'employee-management-system')}
                        </Button>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
};

const EmployeeList = ({ employees, onEdit, onDelete }) => {
    const [userNames, setUserNames] = useState({});

    useEffect(() => {
        fetchUserNames();
    }, [employees]);

    const fetchUserNames = async () => {
        const userIds = [...new Set(employees.map(emp => emp.user_id))];
        try {
            const promises = userIds.map(id => 
                apiFetch({ path: `/wp/v2/users/${id}` })
            );
            const users = await Promise.all(promises);
            const namesMap = {};
            users.forEach(user => {
                namesMap[user.id] = user.name;
            });
            setUserNames(namesMap);
        } catch (err) {
            console.error('Failed to fetch user names:', err);
        }
    };

    return (
        <div className="employee-list">
            <h2>{__('Employee List', 'employee-management-system')}</h2>
            <table className="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>{__('Name', 'employee-management-system')}</th>
                        <th>{__('Department', 'employee-management-system')}</th>
                        <th>{__('Designation', 'employee-management-system')}</th>
                        <th>{__('Join Date', 'employee-management-system')}</th>
                        <th>{__('Current Salary', 'employee-management-system')}</th>
                        <th>{__('Phone', 'employee-management-system')}</th>
                        <th>{__('Status', 'employee-management-system')}</th>
                        <th>{__('Actions', 'employee-management-system')}</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(employee => (
                        <tr key={employee.id}>
                            <td>{userNames[employee.user_id] || employee.user_id}</td>
                            <td>{employee.department}</td>
                            <td>{employee.designation}</td>
                            <td>{employee.join_date}</td>
                            <td>${parseFloat(employee.current_salary).toLocaleString()}</td>
                            <td>{employee.phone}</td>
                            <td>
                                {(() => {
                                    switch(employee.status) {
                                        case 'active':
                                            return <span className="status-active">{__('Active', 'employee-management-system')}</span>;
                                        case 'inactive':
                                            return <span className="status-inactive">{__('Inactive', 'employee-management-system')}</span>;
                                        case 'blocked':
                                            return <span className="status-blocked">{__('Blocked', 'employee-management-system')}</span>;
                                        default:
                                            return <span className="status-unknown">{__('Unknown', 'employee-management-system')}</span>;
                                    }
                                })()}
                            </td>
                            <td>
                                <Button 
                                    isSecondary
                                    onClick={() => onEdit(employee)}
                                    className="edit-button"
                                >
                                    {__('Edit', 'employee-management-system')}
                                </Button>
                                <Button 
                                    isDestructive
                                    onClick={() => onDelete(employee.id)}
                                    className="delete-button"
                                >
                                    {__('Delete', 'employee-management-system')}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await apiFetch({
                path: 'ems/v1/employees',
                method: 'GET'
            });
            setEmployees(response);
            setIsLoading(false);
        } catch (error) {
            setError(error.message);
            setIsLoading(false);
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (isEditing) {
                await apiFetch({
                    path: `ems/v1/employees/${currentEmployee.id}`,
                    method: 'PUT',
                    data: formData
                });
                setIsEditing(false);
                setCurrentEmployee(null);
            } else {
                await apiFetch({
                    path: 'ems/v1/employees',
                    method: 'POST',
                    data: formData
                });
            }
            await fetchEmployees();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const handleSuccess = () => {
        // Additional actions after successful submission
        if (!isEditing) {
            // Show success message for new employee
            wp.data.dispatch('core/notices').createNotice(
                'success',
                __('Employee added successfully!', 'employee-management-system'),
                {
                    type: 'snackbar',
                    isDismissible: true,
                }
            );
        } else {
            // Show success message for updated employee
            wp.data.dispatch('core/notices').createNotice(
                'success',
                __('Employee updated successfully!', 'employee-management-system'),
                {
                    type: 'snackbar',
                    isDismissible: true,
                }
            );
        }
    };

    const handleEdit = (employee) => {
        const formattedEmployee = {
            ...employee,
            join_date: employee.join_date ? formatDateForInput(employee.join_date) : '',
            leave_date: employee.leave_date ? formatDateForInput(employee.leave_date) : '',
        };
        setCurrentEmployee(formattedEmployee);
        setIsEditing(true);
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const handleDelete = async (id) => {
        if (!window.confirm(__('Are you sure you want to delete this employee?', 'employee-management-system'))) {
            return;
        }

        try {
            await apiFetch({
                path: `ems/v1/employees/${id}`,
                method: 'DELETE'
            });
            fetchEmployees();
        } catch (err) {
            setError(err.message);
        }
    };

    if (isLoading) return <div>{__('Loading...', 'employee-management-system')}</div>;
    if (error) return <div>{__('Error:', 'employee-management-system')} {error}</div>;

    return (
        <div className="ems-employees">
            <EmployeeForm 
                employee={currentEmployee}
                onSubmit={handleSubmit}
                isEditing={isEditing}
                onSuccess={handleSuccess}
            />
            <EmployeeList 
                employees={employees}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default Employees; 