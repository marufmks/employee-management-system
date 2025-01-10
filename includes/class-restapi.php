<?php
if (!defined('ABSPATH')) {
    exit;
}

class EMSRestAPI {
    private static $instance = null;
    private $namespace = 'ems/v1';
    private $settings_key = 'ems_settings';
    private $database;

    private function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
        $this->database = EMSDatabase::instance();
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
            array(
                'methods' => 'PUT',
                'callback' => array($this, 'update_employee'),
                'permission_callback' => function () {
                    return current_user_can('edit_posts');
                },
            ),
        ));

        // Register settings endpoints
        register_rest_route($this->namespace, '/settings', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_settings'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'update_settings'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
        ));
    }

    public function check_admin_permission() {
        return current_user_can('manage_options');
    }

    public function get_settings($request) {
        $settings = get_option($this->settings_key, array(
            'dateFormat' => 'Y-m-d',
            'emailNotifications' => 'yes'
        ));
        
        return new WP_REST_Response($settings, 200);
    }

    public function update_settings($request) {
        $params = $request->get_params();
        
        // Fetch current settings
        $current_settings = get_option($this->settings_key, array(
            'dateFormat' => 'Y-m-d',
            'emailNotifications' => 'yes'
        ));

        // Check if the new settings are different from the current settings
        if ($current_settings['dateFormat'] === $params['dateFormat'] &&
            $current_settings['emailNotifications'] === $params['emailNotifications']) {
            return new WP_REST_Response(__('No changes detected', 'ems'), 200);
        }

        $settings = array(
            'dateFormat' => sanitize_text_field($params['dateFormat']),
            'emailNotifications' => sanitize_text_field($params['emailNotifications'])
        );
        
        $result = update_option($this->settings_key, $settings);
        
        if ($result === false) {
            return new WP_Error('update_failed', __('Failed to update settings', 'ems'), array('status' => 500));
        }
        
        return new WP_REST_Response($settings, 200);
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

    public function update_employee($request) {
        $id = $request['id'];
        $employee_data = $request->get_json_params();

        // Validate and sanitize input data
        $first_name = sanitize_text_field($employee_data['firstName']);
        $last_name = sanitize_text_field($employee_data['lastName']);
        $email = sanitize_email($employee_data['email']);
        $department = sanitize_text_field($employee_data['department']);
        $position = sanitize_text_field($employee_data['position']);
        $hire_date = sanitize_text_field($employee_data['hireDate']);

        // Debugging: Log the data being processed
        error_log("Updating employee ID: $id");
        error_log(print_r($employee_data, true));

        // Update employee in the database
        $updated = $this->database->update_employee($id, $first_name, $last_name, $email, $department, $position, $hire_date);

        if ($updated) {
            return new WP_REST_Response(__('Employee updated successfully', 'ems'), 200);
        } else {
            return new WP_REST_Response(__('Failed to update employee', 'ems'), 500);
        }
    }
}
