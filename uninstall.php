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
        'ems_email_notifications',
        'ems_admin_email',
        'ems_notify_new_sale',
        'ems_notify_employee_join',
        'ems_notify_employee_leave',
        'ems_allow_employee_export',
        'ems_sales_report_period',
        'ems_max_sale_amount',
        'ems_require_sale_description',
        'ems_delete_data_uninstall',
        'ems_debug_mode',
        'ems_cache_timeout'
    );

    foreach ($options as $option) {
        delete_option($option);
    }

    // Delete tables if they exist
    global $wpdb;
    $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}ems_employees");
    $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}ems_employee_sales");
}
