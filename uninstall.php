<?php
/**
 * Uninstall script for Employee Management System
 *
 * @package EmployeeManagementSystem
 */

// If uninstall not called from WordPress, exit.
if (!defined('WP_UNINSTALL_PLUGIN')) {
    die;
}

// Check if we should delete data
$delete_data = get_option('ems_delete_data_uninstall', false);

if ($delete_data) {
    // Delete all plugin options
    $options = array(
        'ems_date_format',
        'ems_currency_symbol',
        'ems_currency_position',
        'ems_delete_data_uninstall'
    );

    foreach ($options as $option) {
        delete_option($option);
    }

    // Delete tables if they exist
    global $wpdb;
    $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}ems_employees");
    $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}ems_employee_sales");
}
