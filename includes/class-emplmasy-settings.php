<?php
class EMPLMASY_Settings {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function get_setting($key, $default = '') {
        $option_name = 'emplmasy_' . preg_replace('/([A-Z])/', '_$1', $key);
        $option_name = strtolower($option_name);
        return get_option($option_name, $default);
    }

    public function format_date($date) {
        $format = $this->get_setting('dateFormat', 'Y-m-d');
        return gmdate($format, strtotime($date));
    }

    public function format_currency($amount) {
        $symbol = $this->get_setting('currencySymbol', '$');
        $position = $this->get_setting('currencyPosition', 'before');
        
        $formatted = number_format((float)$amount, 2);
        return $position === 'before' ? $symbol . $formatted : $formatted . $symbol;
    }
} 