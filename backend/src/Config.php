<?php

declare(strict_types=1);

namespace AsafoTech;

final class Config
{
    public static function load(string $projectRoot): void
    {
        $appRoot = dirname($projectRoot);

        self::loadFile($appRoot . DIRECTORY_SEPARATOR . '.env');
        self::loadFile($projectRoot . DIRECTORY_SEPARATOR . '.env');

        $appEnv = self::env('APP_ENV', 'local');

        if ($appEnv === 'production') {
            self::loadFile($appRoot . DIRECTORY_SEPARATOR . '.env.production');
            self::loadFile($projectRoot . DIRECTORY_SEPARATOR . '.env.production');
        }
    }

    private static function loadFile(string $envFile): void
    {
        if (!is_file($envFile)) {
            return;
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $trimmed = trim($line);

            if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $trimmed, 2);
            $key = trim($key);
            $value = trim($value);

            if ($key === '') {
                continue;
            }

            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
            putenv(sprintf('%s=%s', $key, $value));
        }
    }

    public static function env(string $key, ?string $default = null): ?string
    {
        $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);

        return $value === false ? $default : ($value !== null ? (string) $value : $default);
    }
}
