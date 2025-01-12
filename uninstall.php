<?php
/**
 * Uninstall script for Employee Management System
 *
 * @package EmployeeManagementSystem
 */

// If uninstall not called from WordPress, exit.
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

/**
 * Clean up plugin data
 */
function ems_cleanup() {
    global $wpdb;

    // Delete plugin options
    delete_option('ems_settings');
    delete_option('ems_activation_time');

    // Define tables to remove
    $tables = array(
        $wpdb->prefix . 'ems_employees',
        $wpdb->prefix . 'ems_employee_sales'
    );

    // Remove tables
    foreach ($tables as $table) {
        // Check if table exists before attempting to drop it
        $table_exists = $wpdb->get_var(
            $wpdb->prepare(
                "SHOW TABLES LIKE %s",
                $table
            )
        );

        if ($table_exists) {
            // Drop table
            $wpdb->query("DROP TABLE IF EXISTS " . esc_sql($table)); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        }
    }

    // Clear any cached data
    wp_cache_flush();

    // Clear any transients
    delete_transient('ems_all_employees');
    delete_transient('ems_all_sales');

    // Clean up user meta if any
    $wpdb->query(
        $wpdb->prepare(
            "DELETE FROM {$wpdb->usermeta} WHERE meta_key LIKE %s",
            'ems_%'
        )
    );
}

// Run cleanup
ems_cleanup();
