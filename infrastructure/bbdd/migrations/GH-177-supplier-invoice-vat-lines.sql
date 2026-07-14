CREATE TABLE casademiranda.supplier_invoice_vat_lines (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  supplier_invoice_id INT NOT NULL,
  base_amount         DECIMAL(10,2) NOT NULL,
  vat_rate            DECIMAL(5,4) NOT NULL,
  vat_amount          DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (supplier_invoice_id) REFERENCES casademiranda.supplier_invoices(id) ON DELETE CASCADE
);

INSERT INTO casademiranda.supplier_invoice_vat_lines (supplier_invoice_id, base_amount, vat_rate, vat_amount)
SELECT id, base_amount, vat_rate, vat_amount FROM casademiranda.supplier_invoices
WHERE base_amount IS NOT NULL AND vat_rate IS NOT NULL AND vat_amount IS NOT NULL;

ALTER TABLE casademiranda.supplier_invoices
  DROP COLUMN base_amount,
  DROP COLUMN vat_rate,
  DROP COLUMN vat_amount;
