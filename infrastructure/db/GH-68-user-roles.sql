ALTER TABLE casademiranda.users ADD COLUMN role ENUM('admin', 'manager') NOT NULL DEFAULT 'admin';
