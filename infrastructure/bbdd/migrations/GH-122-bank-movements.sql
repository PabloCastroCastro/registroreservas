CREATE TABLE casademiranda.bank_movements (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  date        DATE NOT NULL,
  type        ENUM('ingreso','gasto') NOT NULL,
  description VARCHAR(300) NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  notes       TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
