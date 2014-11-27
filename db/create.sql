drop database if exists sandbox;
create database sandbox;

use sandbox;

CREATE TABLE test (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  data VARCHAR(100)
);