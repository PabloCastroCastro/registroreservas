CREATE TABLE casademiranda.app_settings (
    `key` VARCHAR(50) PRIMARY KEY,
    `value` TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO casademiranda.app_settings (`key`, `value`) VALUES ('last_booking_sync', NULL);
