<?php
if (!defined('ABSPATH')) {
    exit;
}

if (!function_exists('add_action')) {
    return;
}

class EMS_Loader {
    private $rest_api;

    public function __construct() {
        $this->load_dependencies();
        $this->load_plugin_textdomain();
        $this->define_admin_hooks();
        $this->init_rest_api();
        $this->define_employee_hooks();
    }

    

    private function load_dependencies() {
        require_once EMS_PLUGIN_DIR . 'includes/class-ems-database.php';
        require_once EMS_PLUGIN_DIR . 'includes/class-ems-restapi.php';
    }

    /**
     * Load the plugin text domain for translation.
     */
    private function load_plugin_textdomain() {
        add_action('init', array($this, 'load_textdomain'));
    }

    /**
     * Load plugin textdomain.
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'ems',
            false,
            dirname(dirname(plugin_basename(__FILE__))) . '/languages/'
        );
    }

    private function init_rest_api() {
        $this->rest_api = EMSRestAPI::instance();
    }

    private function define_admin_hooks() {
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        add_action('admin_menu', array($this, 'register_admin_menu'));
    }

    private function define_employee_hooks() {
        add_shortcode('employee_dashboard', array($this, 'render_employee_dashboard'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_employee_assets'));
    }

    public function render_employee_dashboard() {
        if (!is_user_logged_in()) {
            return sprintf(
                '%s <a href="%s">%s</a>',
                __('Please log in to view the dashboard', 'ems'),
                esc_url(wp_login_url(get_permalink())),
                __('Log in', 'ems')
            );
        }
        return '<div id="ems-employee-root"></div>';
    }

    public function enqueue_employee_assets() {
        if (!has_shortcode(get_post()->post_content, 'employee_dashboard')) {
            return;
        }

        $asset_file = is_file(EMS_PLUGIN_DIR . 'build/index.asset.php')
            ? include(EMS_PLUGIN_DIR . 'build/index.asset.php')
            : [
                'dependencies' => [
                    'wp-element',
                    'wp-components',
                    'wp-i18n',
                    'wp-primitives',
                    'wp-url'
                ],
                'version' => EMS_VERSION,
            ];

        wp_enqueue_script(
            'ems-frontend',
            EMS_PLUGIN_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        wp_enqueue_style('wp-components');

        wp_localize_script('ems-frontend', 'emsData', array(
            'restUrl' => esc_url_raw(rest_url('ems/v1')),
            'nonce' => wp_create_nonce('wp_rest'),
            'userId' => get_current_user_id()
        ));
    }

    public function enqueue_admin_assets() {
        $asset_file = is_file(EMS_PLUGIN_DIR . 'build/index.asset.php')
            ? include(EMS_PLUGIN_DIR . 'build/index.asset.php')
            : [
                'dependencies' => [
                    'wp-element',
                    'wp-components',
                    'wp-i18n',
                    'wp-primitives',
                    'wp-url'
                ],
                'version' => EMS_VERSION,
            ];

        wp_enqueue_script(
            'ems-admin',
            EMS_PLUGIN_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        wp_enqueue_style(
            'wp-components'
        );
        
        wp_localize_script('ems-admin', 'emsData', array(
            'restUrl' => esc_url_raw(rest_url('ems/v1')),
            'nonce' => wp_create_nonce('wp_rest'),
            'userId' => get_current_user_id()
        ));
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
    }

    public function render_admin_page() {
        echo '<div id="ems-admin-root" class="wrap"></div>';
    }

    public function run() {
        EMSDatabase::instance();
    }
} 