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
        // Register employees endpoints
        register_rest_route($this->namespace, '/employees', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_employees'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_employee'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
        ));

        // Register single employee endpoints
        register_rest_route($this->namespace, '/employees/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array($this, 'delete_employee'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
        ));
    }

    public function check_admin_permission() {
        return current_user_can('manage_options');
    }

    public function get_employees($request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ems_employees';
        
        $employees = $wpdb->get_results("SELECT * FROM $table_name ORDER BY id DESC");
        
        // Always return an array, even if empty
        $employees = is_array($employees) ? $employees : array();
        
        return new WP_REST_Response($employees, 200);
    }

    public function create_employee($request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ems_employees';
        
        $params = $request->get_params();
        
        $employee_data = array(
            'firstName' => sanitize_text_field($params['firstName']),
            'lastName' => sanitize_text_field($params['lastName']),
            'email' => sanitize_email($params['email']),
            'department' => sanitize_text_field($params['department']),
            'position' => sanitize_text_field($params['position']),
            'hireDate' => sanitize_text_field($params['hireDate']),
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql')
        );
        
        $result = $wpdb->insert($table_name, $employee_data);
        
        if ($result === false) {
            return new WP_Error('insert_failed', 'Failed to create employee', array('status' => 500));
        }
        
        $employee_data['id'] = $wpdb->insert_id;
        return new WP_REST_Response($employee_data, 201);
    }

    public function delete_employee($request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ems_employees';
        
        $id = (int) $request['id'];
        
        $result = $wpdb->delete($table_name, array('id' => $id));
        
        if ($result === false) {
            return new WP_Error('delete_failed', 'Failed to delete employee', array('status' => 500));
        }
        
        return new WP_REST_Response(null, 204);
    }
}
