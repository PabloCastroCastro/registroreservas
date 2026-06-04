CREATE TABLE casademiranda.booking_dishes (
    booking_dish_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id      INT          NOT NULL,
    dish_id         INT          NOT NULL,
    dish_name       VARCHAR(100) NOT NULL,
    portion_type    ENUM('full','half') NOT NULL DEFAULT 'full',
    price           DECIMAL(8,2) NOT NULL,
    quantity        INT          NOT NULL DEFAULT 1,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES casademiranda.bookings(booking_id),
    FOREIGN KEY (dish_id)    REFERENCES casademiranda.menu_dishes(dish_id)
);
