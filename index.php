<?php

declare(strict_types=1);

$distIndex = __DIR__ . DIRECTORY_SEPARATOR . 'dist' . DIRECTORY_SEPARATOR . 'index.html';

if (!is_file($distIndex)) {
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Build files not found. Run 'npm run build' in the project folder.";
    exit;
}

header('Content-Type: text/html; charset=utf-8');
readfile($distIndex);
