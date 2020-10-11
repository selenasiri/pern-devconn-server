$psql -U dba -d postgres

$psql -U dba -d pern_devconn_database

CREATE DATABASE pern_devconn_database;

\c pern_devconn_database
--users

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  date TIMESTAMPTZ DEFAULT Now()
);

--fake users data

insert into users (name, email, password) values ('test11', 'test11@gmail.com', 'test123');

