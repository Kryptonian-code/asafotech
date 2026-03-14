<?php

declare(strict_types=1);

namespace AsafoTech;

use PDO;
use PDOException;

final class Database
{
    public static function connect(): PDO
    {
        $host = Config::env('DB_HOST', '127.0.0.1');
        $port = Config::env('DB_PORT', '3306');
        $name = Config::env('DB_NAME', 'asafo_tech');
        $user = Config::env('DB_USER', 'root');
        $password = Config::env('DB_PASSWORD', '');

        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name);

        try {
            return new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $exception) {
            Response::json([
                'message' => 'Unable to connect to the database.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }
}
