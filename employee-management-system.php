<?php
/**
 * Employee Management System
 *
 * @package     EmployeeManagementSystem
 * @author      Maruf
 * @copyright   2025 Maruf
 * @license     GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name: Employee Management System
 * Plugin URI: https://github.com/marufmks/employee-management-system
 * Description: A comprehensive employee and sales management solution for WordPress. Features include employee profiles, sales tracking, performance metrics, customizable dashboards, and detailed reporting.
 * Version: 1.0.1
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Author: Maruf
 * Author URI: https://github.com/marufmks
 * Text Domain: employee-management-system
 * Domain Path: /languages
 * License: GPL v2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

if ( ! defined( 'WPINC' ) ) {
    die;
}

/**
 * Main plugin class
 */
final class Employee_Management_System {

    /**
     * Plugin version
     */
    const VERSION = '1.0.1';

    /**
     * Plugin instance
     *
     * @var self
     */
    private static $instance = null;

    /**
     * Get plugin instance
     *
     * @return self
     */
    public static function instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->define_constants();
        $this->includes();
        $this->init_hooks();
    }

    /**
     * Define constants
     */
    private function define_constants() {
        define( 'EMS_VERSION', self::VERSION );
        define( 'EMS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
        define( 'EMS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
        define( 'EMS_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
    }

    /**
     * Include files
     */
    private function includes() {
        require_once EMS_PLUGIN_DIR . 'includes/class-ems-loader.php';
        require_once EMS_PLUGIN_DIR . 'includes/class-ems-database.php';
        require_once EMS_PLUGIN_DIR . 'includes/class-ems-settings.php';
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        register_activation_hook( __FILE__, [ $this, 'activate' ] );
        register_deactivation_hook( __FILE__, [ $this, 'deactivate' ] );
        add_action( 'plugins_loaded', [ $this, 'init_plugin' ] );
    }

    /**
     * Activate plugin
     */
    public function activate() {
        $database = EMS_Database::instance();
        $database->create_tables();
        
        add_option( 'ems_activation_time', time() );
        flush_rewrite_rules();
    }

    /**
     * Deactivate plugin
     */
    public function deactivate() {
        flush_rewrite_rules();
    }

    /**
     * Initialize plugin
     */
    public function init_plugin() {
        EMS_Loader::instance()->init();
        do_action( 'ems_loaded' );
    }

    /**
     * Prevent cloning
     */
    private function __clone() {}

    /**
     * Prevent unserializing
     */
    public function __wakeup() {}
}

// Initialize plugin
Employee_Management_System::instance();
