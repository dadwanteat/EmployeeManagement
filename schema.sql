-- Drops the employeetracker_db if it exists currently --
DROP DATABASE IF EXISTS employeetracker_db;
-- Creates the "employeetracker_db" database --
CREATE DATABASE employeetracker_db;

-- Makes it so all of the following code will affect employeetracker_db --
USE employeetracker_db;

-- Creates the table "people" within employeetracker_db --
CREATE TABLE department (
  -- Makes a string column called "name" which cannot contain null --
  name VARCHAR(30) NOT NULL,
  ID INT NOT NULL PRIMARY KEY,
);
CREATE TABLE role (
  -- Makes a string column called "name" which cannot contain null --
  title VARCHAR(30) NOT NULL,
  ID INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY(ID),
  salary DECIMAL not NULL,
  department_id INT FOREIGN KEY

);

-- Creates new rows containing data in all named columns --
INSERT INTO department (name)
VALUES ("hr");


