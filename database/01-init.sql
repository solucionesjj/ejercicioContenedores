-- Script de inicialización para MySQL container
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor

-- Crear base de datos ToDo
CREATE DATABASE IF NOT EXISTS ToDo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ToDo;

-- Crear tabla User
CREATE TABLE IF NOT EXISTS User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'This column is used for authentication',
    password VARCHAR(255) NOT NULL COMMENT 'This column is used for authentication, Store hashed password only',
    name VARCHAR(300) NOT NULL,
    insertDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastUpdateDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear índices para User
CREATE INDEX idx_user_email ON User(email);

-- Crear tabla Activities
CREATE TABLE IF NOT EXISTS Activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    activity VARCHAR(1000) NOT NULL,
    status ENUM('To do', 'Doing', 'Done') NOT NULL DEFAULT 'To do',
    insertDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastUpdateDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear índices para Activities
CREATE INDEX idx_activities_status ON Activities(status);
CREATE INDEX idx_activities_insert_date ON Activities(insertDate DESC);