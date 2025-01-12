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
            firstName varchar(100) NOT NULL,
            lastName varchar(100) NOT NULL,
            email varchar(100) NOT NULL,
            department varchar(100) NOT NULL,
            position varchar(100) NOT NULL,
            hireDate date NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY email (email),
            KEY department (department),
            KEY hireDate (hireDate)
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
