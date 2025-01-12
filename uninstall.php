<?php
// If uninstall not called from WordPress, exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete plugin options
delete_option('ems_settings');

// Delete plugin tables
global $wpdb;
$wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}ems_employees");
$wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}ems_employee_sales");

// Clear any cached data
wp_cache_flush(); 