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
  ID INT NOT NULL auto_increment,
  PRIMARY KEY (ID)
  
);
CREATE TABLE role (
  -- Makes a string column called "name" which cannot contain null --
  title VARCHAR(30) NOT NULL,
  ID INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY(ID),
  salary DECIMAL not NULL,
  department_id INT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES department (ID)

);
CREATE TABLE employee (
  -- Makes a string column called "name" which cannot contain null --
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT NOT NULL,
  ID INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY(ID),
  FOREIGN KEY (role_id) REFERENCES role (ID),
  FOREIGN KEY (manager_id) REFERENCES employee (ID)
  
);

-- Creates new rows containing data in all named columns --
INSERT INTO department (name)
VALUES ("hr");
INSERT INTO role (title,salary,department_id)
VALUES ("hr manager",30000,1);



