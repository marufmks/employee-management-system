<?php
if (!defined('ABSPATH')) {
    exit;
}

class EMS_RestAPI
{
    private static $instance = null;
    private $namespace = 'ems/v1';
    private $settings_key = 'ems_settings';
    private $database;

    private function __construct()
    {
        add_action('rest_api_init', array($this, 'register_routes'));
        $this->database = EMS_Database::instance();
    }

    public static function instance()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function register_routes()
    {
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
            'permission_callback' => function () {
                return is_user_logged_in();
            },
        ));

        // Frontend employee stats endpoint (for logged-in employee)
        register_rest_route('ems/v1', '/employee/stats', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_frontend_employee_stats'),
            'permission_callback' => function () {
                return is_user_logged_in();
            },
        ));

        // Admin dashboard employee stats (existing route)
        register_rest_route($this->namespace, '/dashboard/employee-stats', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_employee_stats'),
            'permission_callback' => array($this, 'check_admin_permission'),
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

        register_rest_route($this->namespace, '/dashboard/monthly-sales', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_monthly_sales'),
            'permission_callback' => array($this, 'check_admin_permission'),
        ));

        register_rest_route($this->namespace, '/employee/access', array(
            'methods' => 'GET',
            'callback' => array($this, 'check_employee_access'),
            'permission_callback' => '__return_true'
        ));

        // Add this new endpoint in register_routes()
        register_rest_route($this->namespace, '/available-users', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_available_users'),
            'permission_callback' => array($this, 'check_admin_permission'),
        ));
    }

    public function check_admin_permission()
    {
        return current_user_can('manage_options');
    }

    /**
     * Get plugin settings
     */
    public function get_settings($request) {
        $default_settings = array(
            // General Settings
            'dateFormat' => get_option('ems_date_format', 'Y-m-d'),
            'currencySymbol' => get_option('ems_currency_symbol', '$'),
            'currencyPosition' => get_option('ems_currency_position', 'before'),
            
            // System Settings
            'deleteDataOnUninstall' => get_option('ems_delete_data_uninstall', false)
        );

        return rest_ensure_response($default_settings);
    }

    /**
     * Update plugin settings
     */
    public function update_settings($request) {
        $params = $request->get_params();
        
        // Validate and sanitize inputs
        $settings = array(
            'dateFormat' => sanitize_text_field($params['dateFormat']),
            'currencySymbol' => sanitize_text_field($params['currencySymbol']),
            'currencyPosition' => sanitize_text_field($params['currencyPosition']),
            'deleteDataOnUninstall' => (bool) $params['deleteDataOnUninstall']
        );

        // Update options in WordPress
        foreach ($settings as $key => $value) {
            $option_name = 'ems_' . preg_replace('/([A-Z])/', '_$1', $key);
            $option_name = strtolower($option_name);
            update_option($option_name, $value);
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => __('Settings updated successfully', 'employee-management-system'),
            'settings' => $settings
        ));
    }

    /**
     * Get employees with caching.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response
     */
    public function get_employees($request)
    {
        $employees = wp_cache_get('ems_all_employees');

        if (false === $employees) {
            global $wpdb;
            $employees = $wpdb->get_results(
                "SELECT * FROM {$wpdb->prefix}ems_employees ORDER BY id DESC"
            );
            wp_cache_set('ems_all_employees', $employees, '', 300);
        }

        $employees = is_array($employees) ? $employees : array();
        return new WP_REST_Response($employees, 200);
    }

    /**
     * Create employee with cache invalidation.
     */
    public function create_employee($request)
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ems_employees';
        $params = $request->get_params();

        $employee_data = array(
            'user_id' => absint($params['user_id']),
            'department' => sanitize_text_field($params['department']),
            'designation' => sanitize_text_field($params['designation']),
            'join_date' => sanitize_text_field($params['join_date']),
            'leave_date' => !empty($params['leave_date']) ? sanitize_text_field($params['leave_date']) : null,
            'starting_salary' => floatval($params['starting_salary']),
            'current_salary' => floatval($params['current_salary']),
            'phone' => sanitize_text_field($params['phone']),
            'street_address' => sanitize_text_field($params['street_address']),
            'city' => sanitize_text_field($params['city']),
            'state' => sanitize_text_field($params['state']),
            'postal_code' => sanitize_text_field($params['postal_code']),
            'country' => sanitize_text_field($params['country']),
            'emergency_contact_name' => sanitize_text_field($params['emergency_contact_name']),
            'emergency_contact_phone' => sanitize_text_field($params['emergency_contact_phone']),
            'emergency_contact_relation' => sanitize_text_field($params['emergency_contact_relation']),
            'marital_status' => sanitize_text_field($params['marital_status']),
            'status' => sanitize_text_field($params['status']),
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql')
        );

        $result = $wpdb->insert($table_name, $employee_data);

        if ($result === false) {
            return new WP_Error('insert_failed', __('Failed to create employee', 'employee-management-system'), array('status' => 500));
        }

        // Invalidate cache
        wp_cache_delete('ems_all_employees');

        $employee_data['id'] = $wpdb->insert_id;
        return new WP_REST_Response($employee_data, 201);
    }

    public function delete_employee($request)
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ems_employees';

        $id = (int) $request['id'];

        $result = $wpdb->delete($table_name, array('id' => $id));

        if ($result === false) {
            return new WP_Error('delete_failed', 'Failed to delete employee', array('status' => 500));
        }

        return new WP_REST_Response(null, 204);
    }

    public function update_employee($request)
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ems_employees';
        $id = (int) $request['id'];
        $params = $request->get_json_params();

        $employee_data = array(
            'user_id' => absint($params['user_id']),
            'department' => sanitize_text_field($params['department']),
            'designation' => sanitize_text_field($params['designation']),
            'join_date' => sanitize_text_field($params['join_date']),
            'leave_date' => !empty($params['leave_date']) ? sanitize_text_field($params['leave_date']) : null,
            'starting_salary' => floatval($params['starting_salary']),
            'current_salary' => floatval($params['current_salary']),
            'phone' => sanitize_text_field($params['phone']),
            'street_address' => sanitize_text_field($params['street_address']),
            'city' => sanitize_text_field($params['city']),
            'state' => sanitize_text_field($params['state']),
            'postal_code' => sanitize_text_field($params['postal_code']),
            'country' => sanitize_text_field($params['country']),
            'emergency_contact_name' => sanitize_text_field($params['emergency_contact_name']),
            'emergency_contact_phone' => sanitize_text_field($params['emergency_contact_phone']),
            'emergency_contact_relation' => sanitize_text_field($params['emergency_contact_relation']),
            'marital_status' => sanitize_text_field($params['marital_status']),
            'status' => sanitize_text_field($params['status']),
            'updated_at' => current_time('mysql')
        );

        $result = $wpdb->update(
            $table_name,
            $employee_data,
            array('id' => $id)
        );

        if ($result === false) {
            return new WP_Error(
                'update_failed',
                __('Failed to update employee', 'employee-management-system'),
                array('status' => 500)
            );
        }

        // Invalidate cache
        wp_cache_delete('ems_all_employees');

        return new WP_REST_Response(
            array(
                'message' => __('Employee updated successfully', 'employee-management-system'),
                'data' => $employee_data
            ),
            200
        );
    }

    /**
     * Save sale with cache invalidation.
     */
    public function save_sale($request)
    {
        global $wpdb;

        $params = $request->get_params();
        $user_id = get_current_user_id();

        // Validate required fields
        $required_fields = ['date', 'amount', 'description'];
        foreach ($required_fields as $field) {
            if (empty($params[$field])) {
                return new WP_Error(
                    'missing_field',
                    sprintf(
                        /* translators: %s: field name that is missing (e.g., 'date', 'amount', or 'description') */
                        __('Missing required field: %s', 'employee-management-system'), 
                        $field
                    ),
                    ['status' => 400]
                );
            }
        }

        // Validate amount
        if (!is_numeric($params['amount']) || $params['amount'] <= 0) {
            return new WP_Error(
                'invalid_amount',
                __('Amount must be a positive number', 'employee-management-system'),
                ['status' => 400]
            );
        }

        // Validate date
        $date = sanitize_text_field($params['date']);
        if (!strtotime($date)) {
            return new WP_Error(
                'invalid_date',
                __('Invalid date format', 'employee-management-system'),
                ['status' => 400]
            );
        }

        $data = array(
            'user_id' => absint($user_id),
            'date' => $date,
            'amount' => floatval($params['amount']),
            'description' => sanitize_textarea_field($params['description']),
        );

        $result = $wpdb->insert(
            $wpdb->prefix . 'ems_employee_sales',
            $data,
            array('%d', '%s', '%f', '%s')
        );

        if (false === $result) {
            return new WP_Error(
                'db_error',
                __('Could not save sale record', 'employee-management-system'),
                ['status' => 500]
            );
        }

        // Invalidate relevant caches
        wp_cache_delete('ems_employee_stats_' . $user_id);
        wp_cache_delete('ems_all_sales');

        return rest_ensure_response([
            'success' => true,
            'message' => __('Sale recorded successfully', 'employee-management-system'),
            'id' => $wpdb->insert_id
        ]);
    }

    /**
     * Get employee stats with caching.
     */
    public function get_employee_stats($request)
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ems_employees';

        // Remove unnecessary prepare and fix interpolated variables
        $stats = array(
            'totalEmployees' => $wpdb->get_var(
                "SELECT COUNT(*) FROM {$wpdb->prefix}ems_employees"
            ),
            'activeEmployees' => $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->prefix}ems_employees WHERE status = %s",
                    'active'
                )
            ),
            'inactiveEmployees' => $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->prefix}ems_employees WHERE status = %s",
                    'inactive'
                )
            ),
            'blockedEmployees' => $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->prefix}ems_employees WHERE status = %s",
                    'blocked'
                )
            )
        );

        // Get sales data
        $sales_table = $wpdb->prefix . 'ems_employee_sales';
        $sales_data = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}ems_employee_sales WHERE user_id = %d ORDER BY date DESC",
                get_current_user_id()
            )
        );

        // Calculate monthly stats using proper date handling
        $current_month = gmdate('Y-m');
        $monthly_stats = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT COUNT(*) as count, SUM(amount) as total 
                FROM {$wpdb->prefix}ems_employee_sales 
                WHERE user_id = %d 
                AND DATE_FORMAT(date, '%%Y-%%m') = %s",
                get_current_user_id(),
                $current_month
            )
        );

        // Format response
        return rest_ensure_response($stats);
    }

    public function get_monthly_sales() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ems_employee_sales';

        $results = $wpdb->get_results(
            "SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as total
             FROM {$wpdb->prefix}ems_employee_sales
             WHERE date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
             GROUP BY month
             ORDER BY month ASC"
        );

        $data = array(
            'labels' => array(),
            'data' => array(),
        );

        foreach ($results as $row) {
            $data['labels'][] = gmdate('M Y', strtotime($row->month));
            $data['data'][] = floatval($row->total);
        }

        return rest_ensure_response($data);
    }

    private function format_date($date)
    {
        return date_i18n(get_option('date_format'), strtotime($date));
    }

    /**
     * Get all sales with caching.
     */
    public function get_all_sales()
    {
        // Try to get from cache first
        $sales = wp_cache_get('ems_all_sales');

        if (false === $sales) {
            global $wpdb;

            // Remove unnecessary prepare since there are no variables to escape
            $sales = $wpdb->get_results(
                "SELECT s.*, u.display_name as employee_name 
                FROM {$wpdb->prefix}ems_employee_sales s 
                LEFT JOIN {$wpdb->users} u ON s.user_id = u.ID 
                ORDER BY s.date DESC"
            );

            // Cache for 5 minutes
            wp_cache_set('ems_all_sales', $sales, '', 300);
        }

        return rest_ensure_response($sales);
    }

    public function get_employee_sales_for_download($request)
    {
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

    public function prepare_employee_for_response($employee) {
        return array(
            'user_id' => $employee->user_id,
            'department' => $employee->department,
            'designation' => $employee->designation,
            'join_date' => $employee->join_date,
            'leave_date' => $employee->leave_date,
            'starting_salary' => $employee->starting_salary,
            'current_salary' => $employee->current_salary,
            'phone' => $employee->phone,
            'street_address' => $employee->street_address,
            'city' => $employee->city,
            'state' => $employee->state,
            'postal_code' => $employee->postal_code,
            'country' => $employee->country,
            'emergency_contact_name' => $employee->emergency_contact_name,
            'emergency_contact_phone' => $employee->emergency_contact_phone,
            'emergency_contact_relation' => $employee->emergency_contact_relation,
            'marital_status' => $employee->marital_status,
            'status' => $employee->status,
            'created_at' => $employee->created_at,
            'updated_at' => $employee->updated_at
        );
    }

    public function check_employee_access() {
        global $wpdb;
        $user_id = get_current_user_id();
        
        if (!$user_id) {
            return new WP_Error(
                'not_logged_in',
                __('Please log in to access the dashboard.', 'employee-management-system'),
                array('status' => 401)
            );
        }

        $employee = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}ems_employees WHERE user_id = %d",
            $user_id
        ));

        if (!$employee) {
            return new WP_Error(
                'not_employee',
                __('You are not registered as an employee.', 'employee-management-system'),
                array('status' => 403)
            );
        }

        if ($employee->status !== 'active') {
            return new WP_Error(
                'employee_inactive',
                __('Your employee account is not active. Please contact your administrator.', 'employee-management-system'),
                array('status' => 403)
            );
        }

        return rest_ensure_response(array(
            'status' => 'success',
            'employee' => $employee
        ));
    }

    /**
     * Get frontend employee stats for logged-in user
     */
    public function get_frontend_employee_stats($request) {
        global $wpdb;
        $current_user_id = get_current_user_id();
        $sales_table = $wpdb->prefix . 'ems_employee_sales';

        // Fix interpolated variables in queries
        $sales = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}ems_employee_sales WHERE user_id = %d ORDER BY date DESC",
                $current_user_id
            )
        );

        // Fix date() usage
        $highest_sale_date = '';
        if (!empty($sales)) {
            $highest_sale_date = gmdate('Y-m-d', strtotime($sales[0]->date));
        }

        // Fix monthly sales query
        $monthly_sales = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->prefix}ems_employee_sales 
                WHERE user_id = %d 
                AND YEAR(date) = %s 
                AND MONTH(date) = %s",
                $current_user_id,
                gmdate('Y'),
                gmdate('m')
            )
        );

        // Fix current and previous month sales queries
        $current_month_sales = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT SUM(amount) FROM {$wpdb->prefix}ems_employee_sales 
                WHERE user_id = %d 
                AND YEAR(date) = %s 
                AND MONTH(date) = %s",
                $current_user_id,
                gmdate('Y'),
                gmdate('m')
            )
        );

        $previous_month_sales = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT SUM(amount) FROM {$wpdb->prefix}ems_employee_sales 
                WHERE user_id = %d 
                AND YEAR(date) = %s 
                AND MONTH(date) = %s",
                $current_user_id,
                gmdate('Y', strtotime('-1 month')),
                gmdate('m', strtotime('-1 month'))
            )
        );

        // Format response data
        $response = array(
            'name' => get_userdata($current_user_id)->display_name,
            'totalSales' => (float) array_sum(array_column($sales, 'amount')),
            'monthlyReports' => (int) $monthly_sales,
            'highestSale' => !empty($sales) ? (float) max(array_column($sales, 'amount')) : 0,
            'highestSaleDate' => $highest_sale_date,
            'salesTrend' => $this->calculate_sales_trend($current_month_sales, $previous_month_sales)
        );

        return rest_ensure_response($response);
    }

    private function calculate_sales_trend($current, $previous) {
        if (!$previous || $previous <= 0) {
            return 0;
        }
        return round((($current - $previous) / $previous) * 100, 2);
    }

    /**
     * Get users who are not already employees
     */
    public function get_available_users() {
        global $wpdb;
        // Fix: Remove unnecessary prepare and use direct query
        $users = $wpdb->get_results(
            "SELECT u.ID, u.display_name 
            FROM {$wpdb->users} u 
            LEFT JOIN {$wpdb->prefix}ems_employees e ON u.ID = e.user_id 
            WHERE e.id IS NULL"
        );

        if (empty($users)) {
            return rest_ensure_response(array());
        }

        $formatted_users = array_map(function($user) {
            return array(
                'value' => $user->ID,
                'label' => $user->display_name
            );
        }, $users);

        return rest_ensure_response($formatted_users);
    }
}
