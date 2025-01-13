<?php
if (!defined('ABSPATH')) {
    exit;
}

class EMS_Database {
    private static $instance = null;
    private $wpdb;
    private $employees_table;

    private function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->employees_table = $wpdb->prefix . 'ems_employees';
    }

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Create plugin tables with proper collation.
     *
     * @return void
     */
    public function create_tables() {
        global $wpdb;
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        $charset_collate = $wpdb->get_charset_collate();

        // Employees table
        $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}ems_employees (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            department varchar(100) NOT NULL,
            designation varchar(100) NOT NULL,
            join_date date NOT NULL,
            leave_date date NULL,
            starting_salary decimal(10,2) NOT NULL DEFAULT '0.00',
            current_salary decimal(10,2) NOT NULL DEFAULT '0.00',
            phone varchar(20) NULL,
            street_address text NULL,
            city varchar(100) NULL,
            state varchar(100) NULL,
            postal_code varchar(20) NULL,
            country varchar(100) NULL,
            emergency_contact_name varchar(100) NULL,
            emergency_contact_phone varchar(20) NULL,
            emergency_contact_relation varchar(50) NULL,
            marital_status varchar(20) DEFAULT 'single',
            status varchar(20) DEFAULT 'active',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY department (department),
            KEY join_date (join_date),
            KEY leave_date (leave_date)
        ) $charset_collate;";
        
        dbDelta($sql);

        // Sales table
        $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}ems_employee_sales (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            date date NOT NULL,
            amount decimal(10,2) NOT NULL,
            description text NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY date (date)
        ) $charset_collate;";
        
        dbDelta($sql);
    }

    
}
