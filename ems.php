<?php
/**
 * Employee Management System
 *
 * @package     EmployeeManagementSystem
 * @author      Maruf
 * @copyright   2024 Maruf
 * @license     GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name: Employee Management System
 * Plugin URI: https://github.com/marufmks/employee-management-system
 * Description: A comprehensive employee management system for WordPress
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Author: Maruf
 * Author URI: https://github.com/marufmks
 * Text Domain: ems
 * Domain Path: /languages
 * License: GPL v2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

// If this file is called directly, abort.
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('EMS_VERSION', '1.0.0');
define('EMS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('EMS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('EMS_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Plugin activation hook.
 *
 * @since 1.0.0
 * @return void
 */
function ems_activate() {
    require_once EMS_PLUGIN_DIR . 'includes/class-ems-database.php';
    $database = EMS_Database::instance();
    $database->create_tables();
    
    // Add activation timestamp
    add_option('ems_activation_time', time());
    
    // Clear the permalinks
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'ems_activate');

/**
 * Plugin deactivation hook.
 *
 * @since 1.0.0
 * @return void
 */
function ems_deactivate() {
    // Clear the permalinks
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'ems_deactivate');

/**
 * Initialize the plugin.
 *
 * @since 1.0.0
 * @return void
 */
function run_ems() {
    require_once EMS_PLUGIN_DIR . 'includes/class-ems-loader.php';
    $loader = new EMS_Loader();
    $loader->run();
}
run_ems();
