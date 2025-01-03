<?php
/**
 * Plugin Name: Employee Management System
 * Description: Manage employees and their sales reports with employee dashboard.
 * Version: 1.0.0
 * Author: Maruf
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ems
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

define( 'EMS_VERSION', '1.0.0' );
define( 'EMS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'EMS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Load the main plugin class
require_once EMS_PLUGIN_DIR . 'includes/class-ems-loader.php';

// Add activation hook for database setup
register_activation_hook(__FILE__, 'ems_activate');

function ems_activate() {
    require_once EMS_PLUGIN_DIR . 'includes/class-database.php';
    $database = EMSDatabase::instance();
    $database->create_tables();
}

function run_ems() {
    $loader = new EMS_Loader();
    $loader->run();
}

run_ems();
