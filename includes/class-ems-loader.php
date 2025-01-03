<?php
if (!defined('ABSPATH')) {
    exit;
}

if (!function_exists('add_action')) {
    return;
}

class EMS_Loader {
    public function __construct() {
        $this->load_dependencies();
        $this->define_admin_hooks();
    }

    private function load_dependencies() {
        require_once EMS_PLUGIN_DIR . 'includes/class-database.php';
        require_once EMS_PLUGIN_DIR . 'includes/class-restapi.php';
    }

    private function define_admin_hooks() {
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        add_action('admin_menu', array($this, 'register_admin_menu'));
    }

    public function enqueue_admin_assets() {
        $asset_file = is_file(EMS_PLUGIN_DIR . 'build/index.asset.php')
            ? include(EMS_PLUGIN_DIR . 'build/index.asset.php')
            : [
                'dependencies' => ['wp-element', 'wp-components', 'wp-i18n'],
                'version' => EMS_VERSION,
            ];

        wp_enqueue_script(
            'ems-admin',
            EMS_PLUGIN_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        wp_localize_script('ems-admin', 'emsData', array(
            'restUrl' => esc_url_raw(rest_url('ems/v1')),
            'nonce' => wp_create_nonce('wp_rest'),
            'userId' => get_current_user_id()
        ));

        wp_enqueue_style('wp-components');
    }

    public function register_admin_menu() {
        add_menu_page(
            __('Employee Management', 'ems'),
            __('Employee Management', 'ems'),
            'manage_options',
            'employee-management',
            array($this, 'render_admin_page'),
            'dashicons-groups',
            30
        );

        add_submenu_page(
            'employee-management',
            __('Employee Dashboard', 'ems'),
            __('Employee Dashboard', 'ems'),
            'read',
            'employee-dashboard',
            array($this, 'render_employee_page')
        );
    }

    public function render_admin_page() {
        echo '<div id="ems-admin-dashboard" class="wrap"></div>';
    }

    public function render_employee_page() {
        echo '<div id="ems-employee-dashboard" class="wrap"></div>';
    }

    public function run() {
        EMSDatabase::instance();
        EMSRestAPI::instance();
    }
} 