CREATE TABLE casademiranda.booking_room_prices (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(50) NOT NULL,
  season    ENUM('low','high') NOT NULL,
  price     DECIMAL(8,2) NOT NULL,
  UNIQUE KEY uq_booking_room_season (room_name, season)
);

INSERT INTO casademiranda.booking_room_prices (room_name, season, price) VALUES
    ('A Fonte',       'low',  80.00),
    ('A Fonte',       'high', 95.00),
    ('O Carpinteiro', 'low',  80.00),
    ('O Carpinteiro', 'high', 95.00),
    ('O Cuberto',     'low',  100.00),
    ('O Cuberto',     'high',110.00);
