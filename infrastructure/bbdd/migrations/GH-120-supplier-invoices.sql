CREATE TABLE casademiranda.supplier_invoices (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(100),
  nif           VARCHAR(20),
  date          DATE NOT NULL,
  supplier_name VARCHAR(200) NOT NULL,
  base_amount   DECIMAL(10,2),
  vat_rate      DECIMAL(5,4),
  vat_amount    DECIMAL(10,2),
  total_amount  DECIMAL(10,2) NOT NULL,
  reference     VARCHAR(200),
  notes         TEXT,
  file_path     VARCHAR(255),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE casademiranda.supplier_invoices
  ADD COLUMN email_uid INT NULL;
