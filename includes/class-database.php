<?php
if (!defined('ABSPATH')) {
    exit;
}

class EMSDatabase {
    private static $instance = null;
    private $wpdb;
    private $employees_table;
    private $sales_table;

    private function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->employees_table = $wpdb->prefix . 'ems_employees';
        $this->sales_table = $wpdb->prefix . 'ems_sales';
    }

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function create_tables() {
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        $charset_collate = $this->wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS {$this->employees_table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            department varchar(100) NOT NULL,
            position varchar(100) NOT NULL,
            hire_date date NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY user_id (user_id)
        ) $charset_collate;";

        dbDelta($sql);

        $sql = "CREATE TABLE IF NOT EXISTS {$this->sales_table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            employee_id bigint(20) unsigned NOT NULL,
            amount decimal(10,2) NOT NULL,
            sale_date date NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY employee_id (employee_id)
        ) $charset_collate;";

        dbDelta($sql);
    }
}
