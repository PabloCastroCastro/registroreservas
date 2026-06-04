CREATE TABLE casademiranda.room_base_prices (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    room_name       VARCHAR(50)  NOT NULL,
    season          ENUM('low','high') NOT NULL,
    price           DECIMAL(8,2) NOT NULL,
    price_extra_bed DECIMAL(8,2) NOT NULL DEFAULT 15.00,
    UNIQUE KEY uq_room_season (room_name, season)
);

CREATE TABLE casademiranda.season_config (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    high_season_start   VARCHAR(5) NOT NULL DEFAULT '06-15',
    high_season_end     VARCHAR(5) NOT NULL DEFAULT '09-15'
);

-- Datos iniciales
INSERT INTO casademiranda.season_config (high_season_start, high_season_end) VALUES ('06-15', '09-15');

INSERT INTO casademiranda.room_base_prices (room_name, season, price, price_extra_bed) VALUES
    ('A Fonte',       'low',  75.00, 15.00),
    ('A Fonte',       'high', 90.00, 15.00),
    ('O Carpinteiro', 'low',  75.00, 15.00),
    ('O Carpinteiro', 'high', 90.00, 15.00),
    ('O Cuberto',     'low',  95.00, 15.00),
    ('O Cuberto',     'high',105.00, 15.00),
    ('O Faiado',      'low',  75.00, 15.00),
    ('O Faiado',      'high', 90.00, 15.00);
