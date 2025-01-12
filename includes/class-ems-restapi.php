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

        register_rest_route('ems/v1', '/sales', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_sale'),
            'permission_callback' => function() {
                return is_user_logged_in();
            },
        ));

        register_rest_route('ems/v1', '/employee/stats', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_employee_stats'),
            'permission_callback' => function() {
                return is_user_logged_in();
            },
        ));

        // Get all sales
        register_rest_route($this->namespace, '/sales', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_all_sales'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
        ));

        // Download employee sales
        register_rest_route($this->namespace, '/sales/download/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_employee_sales_for_download'),
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
        $updated = $this->update_employee_data($id, $first_name, $last_name, $email, $department, $position, $hire_date);

        if ($updated) {
            return new WP_REST_Response(__('Employee updated successfully', 'ems'), 200);
        } else {
            return new WP_REST_Response(__('Failed to update employee', 'ems'), 500);
        }
    }

    public function update_employee_data($id, $first_name, $last_name, $email, $department, $position, $hire_date) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ems_employees';

        // Debugging: Log the SQL query
        $wpdb->show_errors();
        $result = $wpdb->update(
            $table_name,
            array(
                'firstName' => $first_name,
                'lastName' => $last_name,
                'email' => $email,
                'department' => $department,
                'position' => $position,
                'hireDate' => $hire_date
            ),
            array('id' => $id),
            array('%s', '%s', '%s', '%s', '%s', '%s'),
            array('%d')
        );

        if ($result === false) {
            error_log("Database update failed: " . $wpdb->last_error);
        }

        return $result !== false;
    }

    public function save_sale($request) {
        global $wpdb;

        $params = $request->get_params();
        $user_id = get_current_user_id();

        $data = array(
            'user_id' => $user_id,
            'date' => sanitize_text_field($params['date']),
            'amount' => floatval($params['amount']),
            'description' => sanitize_textarea_field($params['description']),
        );

        $result = $wpdb->insert(
            $wpdb->prefix . 'ems_employee_sales',
            $data,
            array('%d', '%s', '%f', '%s')
        );

        if ($result === false) {
            return new WP_Error('db_error', 'Could not save sale record', array('status' => 500));
        }

        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Sale recorded successfully',
            'id' => $wpdb->insert_id
        ), 200);
    }

    public function get_employee_stats() {
        global $wpdb;
        $user_id = get_current_user_id();
        $current_user = wp_get_current_user();

        // Get total sales with null check
        $total_sales = $wpdb->get_var($wpdb->prepare(
            "SELECT COALESCE(SUM(amount), 0) FROM {$wpdb->prefix}ems_employee_sales WHERE user_id = %d",
            $user_id
        ));

        // Get monthly reports count with null check
        $monthly_reports = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}ems_employee_sales 
            WHERE user_id = %d 
            AND MONTH(date) = MONTH(CURRENT_DATE()) 
            AND YEAR(date) = YEAR(CURRENT_DATE())",
            $user_id
        ));

        // Get highest sale with null check
        $highest_sale = $wpdb->get_row($wpdb->prepare(
            "SELECT amount, date FROM {$wpdb->prefix}ems_employee_sales 
            WHERE user_id = %d 
            AND amount IS NOT NULL 
            ORDER BY amount DESC LIMIT 1",
            $user_id
        ));

        // Calculate sales trend
        $current_month_sales = $wpdb->get_var($wpdb->prepare(
            "SELECT COALESCE(SUM(amount), 0) FROM {$wpdb->prefix}ems_employee_sales 
            WHERE user_id = %d 
            AND MONTH(date) = MONTH(CURRENT_DATE()) 
            AND YEAR(date) = YEAR(CURRENT_DATE())",
            $user_id
        )) ?: 0;

        $last_month_sales = $wpdb->get_var($wpdb->prepare(
            "SELECT COALESCE(SUM(amount), 0) FROM {$wpdb->prefix}ems_employee_sales 
            WHERE user_id = %d 
            AND MONTH(date) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) 
            AND YEAR(date) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))",
            $user_id
        )) ?: 0;

        // Calculate trend percentage
        $sales_trend = 0;
        if ($last_month_sales > 0) {
            $sales_trend = (($current_month_sales - $last_month_sales) / $last_month_sales) * 100;
        } elseif ($current_month_sales > 0) {
            $sales_trend = 100; // If last month was 0 and this month has sales, show 100% increase
        }

        $response_data = array(
            'name' => $current_user->display_name,
            'totalSales' => (float) $total_sales,
            'monthlyReports' => (int) $monthly_reports,
            'highestSale' => $highest_sale ? (float) $highest_sale->amount : 0,
            'highestSaleDate' => $highest_sale ? $this->format_date($highest_sale->date) : '',
            'salesTrend' => round($sales_trend, 1)
        );

        return rest_ensure_response($response_data);
    }

    private function format_date($date) {
        return date_i18n(get_option('date_format'), strtotime($date));
    }

    public function get_all_sales() {
        global $wpdb;
        
        $sales = $wpdb->get_results($wpdb->prepare(
            "SELECT s.*, u.display_name as employee_name 
            FROM {$wpdb->prefix}ems_employee_sales s 
            LEFT JOIN {$wpdb->users} u ON s.user_id = u.ID 
            ORDER BY s.date DESC"
        ));

        return rest_ensure_response($sales);
    }

    public function get_employee_sales_for_download($request) {
        global $wpdb;
        $employee_id = $request['id'];

        $sales = $wpdb->get_results($wpdb->prepare(
            "SELECT date, amount, description 
            FROM {$wpdb->prefix}ems_employee_sales 
            WHERE user_id = %d 
            ORDER BY date DESC",
            $employee_id
        ));

        return rest_ensure_response($sales);
    }
}
