<?php
/**
 * Plugin Loader Class
 *
 * @package EmployeeManagementSystem
 */

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * EMS_Loader class
 */
class EMS_Loader {

    /**
     * Class instance
     *
     * @var self
     */
    private static $instance = null;

    /**
     * REST API instance
     *
     * @var EMS_RestAPI
     */
    private $rest_api;

    /**
     * Get class instance
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
     * Initialize loader
     */
    public function init() {
        $this->load_dependencies();
        $this->init_hooks();
    }

    /**
     * Load dependencies
     */
    private function load_dependencies() {
        require_once EMS_PLUGIN_DIR . 'includes/class-ems-restapi.php';
        $this->rest_api = EMS_RestAPI::instance();
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Text domain
        add_action( 'init', [ $this, 'load_textdomain' ] );

        // Admin hooks
        add_action( 'admin_menu', [ $this, 'register_admin_menu' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );

        // Frontend hooks
        add_shortcode( 'employee_dashboard', [ $this, 'render_employee_dashboard' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_frontend_assets' ] );
    }

    /**
     * Load text domain
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'employee-management-system',
            false,
            dirname( EMS_PLUGIN_BASENAME ) . '/languages/'
        );
    }

    /**
     * Register admin menu
     */
    public function register_admin_menu() {
        add_menu_page(
            __( 'Employee Management', 'employee-management-system' ),
            __( 'Employee Management', 'employee-management-system' ),
            'manage_options',
            'employee-management',
            [ $this, 'render_admin_page' ],
            'dashicons-groups',
            30
        );
    }

    /**
     * Render admin page
     */
    public function render_admin_page() {
        echo '<div id="ems-admin-root" class="wrap"></div>';
    }

    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets( $hook ) {
        if ( strpos( $hook, 'employee-management' ) === false ) {
            return;
        }

        $this->enqueue_assets( 'admin' );
    }

    /**
     * Enqueue frontend assets
     */
    public function enqueue_frontend_assets() {
        if ( ! has_shortcode( get_post()->post_content, 'employee_dashboard' ) ) {
            return;
        }

        $this->enqueue_assets( 'frontend' );
    }

    /**
     * Common asset enqueuing
     */
    private function enqueue_assets( $context = 'admin' ) {
        $asset_file = include EMS_PLUGIN_DIR . 'build/index.asset.php';
        
        wp_enqueue_script(
            "ems-{$context}",
            EMS_PLUGIN_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        wp_enqueue_style( 'wp-components' );
        wp_enqueue_style(
            "ems-{$context}-style",
            EMS_PLUGIN_URL . 'build/index.css',
            [ 'wp-components' ],
            $asset_file['version']
        );

        wp_localize_script( "ems-{$context}", 'emsData', [
            'restUrl' => esc_url_raw( rest_url( 'ems/v1' ) ),
            'nonce' => wp_create_nonce( 'wp_rest' ),
            'userId' => get_current_user_id(),
            'isAdmin' => $context === 'admin',
            'userName' => $context === 'frontend' ? wp_get_current_user()->display_name : ''
        ]);
    }

    /**
     * Render employee dashboard
     */
    public function render_employee_dashboard() {
        if ( ! is_user_logged_in() ) {
            return sprintf(
                '<div class="ems-frontend ems-dashboard-wrapper"><div class="notice notice-error"><p>%s <a href="%s">%s</a></p></div></div>',
                __( 'Please log in to view the dashboard', 'employee-management-system' ),
                esc_url( wp_login_url( get_permalink() ) ),
                __( 'Log in', 'employee-management-system' )
            );
        }
        return '<div id="ems-employee-root"></div>';
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