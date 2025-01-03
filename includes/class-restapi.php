<?php
if (!defined('ABSPATH')) {
    exit;
}

class EMSRestAPI {
    private static $instance = null;
    private $namespace = 'ems/v1';

    private function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function register_routes() {
        register_rest_route($this->namespace, '/employees', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_employees'),
                'permission_callback' => array($this, 'check_permission'),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_employee'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
        ));

        register_rest_route($this->namespace, '/sales', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_sales'),
                'permission_callback' => array($this, 'check_permission'),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_sale'),
                'permission_callback' => array($this, 'check_permission'),
            ),
        ));
    }

    public function check_permission() {
        return current_user_can('read');
    }

    public function check_admin_permission() {
        return current_user_can('manage_options');
    }

    // API endpoint methods will be added here
    public function get_employees($request) {
        // Implementation will be added
        return new WP_REST_Response(array(), 200);
    }

    public function create_employee($request) {
        // Implementation will be added
        return new WP_REST_Response(array(), 201);
    }

    public function get_sales($request) {
        // Implementation will be added
        return new WP_REST_Response(array(), 200);
    }

    public function create_sale($request) {
        // Implementation will be added
        return new WP_REST_Response(array(), 201);
    }
}
