CREATE TABLE IF NOT EXISTS `casademiranda`.`rooms` (
  `room_id` INT NOT NULL,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  `beds` INT NULL DEFAULT NULL,
  `bed_size` INT NULL DEFAULT NULL,
  PRIMARY KEY (`room_id`))
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

CREATE TABLE IF NOT EXISTS `casademiranda`.`bookings` (
  `booking_id` INT NOT NULL AUTO_INCREMENT,
  `check_in` DATE NULL DEFAULT NULL,
  `check_out` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`booking_id`))
  DEFAULT CHARACTER SET = utf8
  COLLATE = utf8_general_ci;

CREATE TABLE IF NOT EXISTS `casademiranda`.`customers` (
  `customer_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  `surname` VARCHAR(90) NULL DEFAULT NULL,
  `identifier` VARCHAR(45) NULL DEFAULT NULL,
  `email` VARCHAR(120) NULL DEFAULT NULL,
  `made_booking` BIT DEFAULT 0,
  PRIMARY KEY (`customer_id`),
  INDEX `fk_customers_identifier_idx` (`identifier` ASC),
  INDEX `fk_customers_email_idx` (`email` ASC))
  DEFAULT CHARACTER SET = utf8
  COLLATE = utf8_general_ci;

CREATE TABLE IF NOT EXISTS `casademiranda`.`booking_room` (
  `booking_room_id` INT NOT NULL AUTO_INCREMENT,
  `booking_id` INT NOT NULL,
  `room_id` INT NOT NULL,
  `price` INT NOT NULL,
  PRIMARY KEY (`booking_room_id`),
  INDEX `fk_bookings_rooms_bookings_idx` (`booking_id` ASC),
  CONSTRAINT `fk_bookings_rooms_bookings_idx` FOREIGN KEY (`booking_id`) REFERENCES `casademiranda`.`bookings` (`booking_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  INDEX `fk_bookings_rooms_rooms_idx` (`room_id` ASC),
  CONSTRAINT `fk_bookings_rooms_rooms_idx` FOREIGN KEY (`room_id`) REFERENCES `casademiranda`.`rooms` (`room_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);


CREATE TABLE IF NOT EXISTS `casademiranda`.`booking_customer` (
  `booking_customer_id` INT NOT NULL AUTO_INCREMENT,
  `booking_id` INT NOT NULL,
  `customer_id` INT NOT NULL,
  PRIMARY KEY (`booking_customer_id`),
  INDEX `fk_bookings_customers_bookings_idx` (`booking_id` ASC),
  CONSTRAINT `fk_bookings_customers_bookings_idx` FOREIGN KEY (`booking_id`) REFERENCES `casademiranda`.`bookings` (`booking_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  INDEX `fk_bookings_customers_customers_idx` (`customer_id` ASC),
  CONSTRAINT `fk_bookings_customers_customers_idx` FOREIGN KEY (`customer_id`) REFERENCES `casademiranda`.`customers` (`customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS `casademiranda`.`booking_room_extra_bed` (
  `booking_extra_bed_id` INT NOT NULL AUTO_INCREMENT,
  `booking_room_id` INT NOT NULL,
  `number_bed` INT NOT NULL,
  `price_bed` INT NOT NULL,
  PRIMARY KEY (`booking_extra_bed_id`),
  INDEX `fk_bookings_extra_beds_bookings_rooms_idx` (`booking_room_id` ASC),
   CONSTRAINT `fk_bookings_extra_beds_bookings_rooms_idx` FOREIGN KEY (`booking_room_id`) REFERENCES `casademiranda`.`booking_room` (`booking_room_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);

INSERT INTO `casademiranda`.`rooms` (
  `room_id`,
  `name`,
  `beds`,
  `bed_size`) VALUES (1, "O Cuberto", 1, 150);

  INSERT INTO `casademiranda`.`rooms` (
  `room_id`,
  `name`,
  `beds`,
  `bed_size`) VALUES (2, "A Fonte", 2, 90);

    INSERT INTO `casademiranda`.`rooms` (
  `room_id`,
  `name`,
  `beds`,
  `bed_size`) VALUES (3, "O Carpinteiro", 1, 150);

      INSERT INTO `casademiranda`.`rooms` (
  `room_id`,
  `name`,
  `beds`,
  `bed_size`) VALUES (4, "O Faiado", 1, 135);