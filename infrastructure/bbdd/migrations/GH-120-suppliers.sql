CREATE TABLE casademiranda.suppliers (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(200) NOT NULL,
  domain VARCHAR(200) NOT NULL,
  UNIQUE KEY uniq_supplier_domain (domain)
);
