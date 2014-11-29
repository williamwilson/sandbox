drop database if exists sandbox;
create database sandbox;

use sandbox;

CREATE TABLE user (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username varchar(100) NOT NULL UNIQUE,
  password_hash varchar(500) NULL
);