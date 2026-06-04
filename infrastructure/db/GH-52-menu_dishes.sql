CREATE TABLE casademiranda.menu_dishes (
    dish_id     INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    category    VARCHAR(50)  NOT NULL,
    price_full  DECIMAL(8,2) NOT NULL,
    price_half  DECIMAL(8,2),
    observations TEXT,
    active      TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
