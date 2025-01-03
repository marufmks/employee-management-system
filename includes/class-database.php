<?php
if (!defined('ABSPATH')) {
    exit;
}

class EMSDatabase {
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

    public function create_tables() {
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        $charset_collate = $this->wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS {$this->employees_table} (
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
            UNIQUE KEY email (email)
        ) $charset_collate;";

        dbDelta($sql);
    }
}
