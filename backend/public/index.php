<?php

declare(strict_types=1);

ob_start();
ini_set('display_errors', '0');

use AsafoTech\Config;
use AsafoTech\Database;
use AsafoTech\PaystackService;
use AsafoTech\ProductRepository;
use AsafoTech\Response;

require_once dirname(__DIR__) . '/src/Config.php';
require_once dirname(__DIR__) . '/src/Response.php';
require_once dirname(__DIR__) . '/src/Database.php';
require_once dirname(__DIR__) . '/src/PaystackService.php';
require_once dirname(__DIR__) . '/src/ProductRepository.php';

Config::load(dirname(__DIR__));

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Response::json(['ok' => true]);
}

function request_payload(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);

    if (!is_array($decoded)) {
        throw new RuntimeException('Invalid JSON payload.');
    }

    return $decoded;
}

function bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['Authorization'] ?? '';

    if (!is_string($header) || !str_starts_with($header, 'Bearer ')) {
        return null;
    }

    return trim(substr($header, 7));
}

function upload_file_url(array $file): string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Image upload failed.');
    }

    $tmpPath = (string) ($file['tmp_name'] ?? '');
    $originalName = (string) ($file['name'] ?? 'upload');
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp'];

    if (!in_array($extension, $allowed, true)) {
        throw new RuntimeException('Only JPG, PNG, and WEBP images are allowed.');
    }

    $uploadDirectory = __DIR__ . DIRECTORY_SEPARATOR . 'uploads';

    if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0777, true) && !is_dir($uploadDirectory)) {
        throw new RuntimeException('Unable to create upload directory.');
    }

    $filename = uniqid('asafo-tech_', true) . '.' . $extension;
    $targetPath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file($tmpPath, $targetPath)) {
        throw new RuntimeException('Unable to store uploaded image.');
    }

    $scriptDirectory = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/backend/public/index.php')), '/');
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? '127.0.0.1:8000';

    return $scheme . '://' . $host . $scriptDirectory . '/uploads/' . $filename;
}

function storefront_base_url(): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $scriptDirectory = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/backend/public/index.php'));
    $storefrontPath = preg_replace('#/backend/public/?$#', '', rtrim($scriptDirectory, '/')) ?? '';

    return $scheme . '://' . $host . ($storefrontPath === '' ? '' : $storefrontPath);
}

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$path = parse_url($requestUri, PHP_URL_PATH) ?: '/';

if ($scriptName !== '' && str_starts_with($path, $scriptName)) {
    $path = substr($path, strlen($scriptName));
}

$path = '/' . trim($path, '/');

if (!str_starts_with($path, '/api')) {
    Response::json(['message' => 'Not Found'], 404);
}

$route = substr($path, 4);
$route = $route === '' ? '/' : $route;
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($route === '/health') {
    Response::json([
        'status' => 'ok',
        'app' => 'Asafo Tech Local API',
        'timestamp' => gmdate(DATE_ATOM),
    ]);
}

$repository = new ProductRepository(Database::connect());
$paystack = new PaystackService((string) Config::env('PAYSTACK_SECRET_KEY', ''));

try {
    if ($route === '/admin/status' && $method === 'GET') {
        Response::json(['data' => ['hasAdmin' => $repository->adminCount() > 0]]);
    }

    if ($route === '/admin/bootstrap' && $method === 'POST') {
        Response::json(['data' => $repository->bootstrapAdmin(request_payload())], 201);
    }

    if ($route === '/admin/login' && $method === 'POST') {
        Response::json(['data' => $repository->loginAdmin(request_payload())]);
    }

    if ($route === '/auth/register' && $method === 'POST') {
        Response::json(['data' => $repository->registerUser(request_payload())], 201);
    }

    if ($route === '/auth/login' && $method === 'POST') {
        Response::json(['data' => $repository->loginUser(request_payload())]);
    }

    if ($route === '/auth/firebase-sync' && $method === 'POST') {
        Response::json(['data' => ['user' => $repository->syncFirebaseUser(request_payload())]]);
    }

    if ($route === '/categories' && $method === 'GET') {
        Response::json(['data' => $repository->categories()]);
    }

    if ($route === '/products' && $method === 'GET') {
        $collection = isset($_GET['collection']) ? trim((string) $_GET['collection']) : null;
        Response::json(['data' => $repository->products($collection)]);
    }

    if (preg_match('#^/products/([^/]+)$#', $route, $matches) === 1 && $method === 'GET') {
        Response::json(['data' => $repository->productBySlug((string) $matches[1])]);
    }

    if ($route === '/orders' && $method === 'POST') {
        Response::json(['data' => $repository->createOrder(request_payload())], 201);
    }

    if ($route === '/payments/paystack/initialize' && $method === 'POST') {
        $payload = request_payload();
        $order = $repository->createOrder($payload);
        $callbackUrl = Config::env('PAYSTACK_CALLBACK_URL', storefront_base_url() . '/order-success');

        $customerEmail = trim((string) ($payload['customerEmail'] ?? ''));

        if ($customerEmail === '') {
            throw new RuntimeException('A customer email is required for Paystack checkout.');
        }

        $paystackResponse = $paystack->initializeTransaction([
            'email' => $customerEmail,
            'amount' => (int) round(((float) $order['total']) * 100),
            'reference' => $order['orderNumber'],
            'currency' => 'GHS',
            'callback_url' => $callbackUrl,
            'metadata' => [
                'order_number' => $order['orderNumber'],
                'customer_name' => (string) ($payload['customerName'] ?? ''),
                'customer_phone' => (string) ($payload['customerPhone'] ?? ''),
            ],
          ]);

        Response::json(['data' => [
            'authorizationUrl' => $paystackResponse['data']['authorization_url'] ?? '',
            'accessCode' => $paystackResponse['data']['access_code'] ?? '',
            'reference' => $paystackResponse['data']['reference'] ?? $order['orderNumber'],
            'order' => $order,
        ]], 201);
    }

    if (preg_match('#^/payments/paystack/verify/([^/]+)$#', $route, $matches) === 1 && $method === 'POST') {
        $reference = rawurldecode((string) $matches[1]);
        $verification = $paystack->verifyTransaction($reference);
        $result = $repository->applyPaystackVerification($reference, $verification['data'] ?? []);

        Response::json(['data' => [
            'paymentStatus' => $result['paymentStatus'],
            'order' => $result['order'],
            'paystackStatus' => (string) ($verification['data']['status'] ?? ''),
            'message' => $result['message'],
        ]]);
    }

    if ($route === '/customer/orders' && $method === 'POST') {
        Response::json(['data' => $repository->customerOrders(request_payload())]);
    }

    if (preg_match('#^/customer/orders/([^/]+)$#', $route, $matches) === 1 && $method === 'POST') {
        Response::json(['data' => $repository->customerOrderDetails(request_payload(), rawurldecode((string) $matches[1]))]);
    }

    $token = bearer_token();

    if (in_array($route, ['/admin/me', '/admin/logout', '/uploads', '/orders'], true)
        || str_starts_with($route, '/categories')
        || ($route === '/products' && $method !== 'GET')
        || preg_match('#^/products/\d+$#', $route) === 1
        || preg_match('#^/orders/\d+$#', $route) === 1
    ) {
        $admin = $repository->adminFromToken((string) $token);

        if ($route === '/admin/me' && $method === 'GET') {
            Response::json(['data' => ['admin' => $admin]]);
        }

        if ($route === '/admin/logout' && $method === 'POST') {
            $repository->revokeSession((string) $token);
            Response::json(['ok' => true]);
        }

        if ($route === '/uploads' && $method === 'POST') {
            if (!isset($_FILES['image'])) {
                throw new RuntimeException('No image file was uploaded.');
            }

            Response::json(['data' => ['url' => upload_file_url($_FILES['image'])]], 201);
        }

        if ($route === '/orders' && $method === 'GET') {
            Response::json(['data' => $repository->orders()]);
        }

        if (preg_match('#^/orders/(\d+)$#', $route, $matches) === 1) {
            if ($method === 'GET') {
                Response::json(['data' => $repository->orderDetailsById((int) $matches[1])]);
            }

            if ($method === 'PUT' || $method === 'PATCH') {
                Response::json(['data' => $repository->updateOrderStatus((int) $matches[1], request_payload())]);
            }
        }

        if ($route === '/categories' && $method === 'POST') {
            Response::json(['data' => $repository->createCategory(request_payload())], 201);
        }

        if (preg_match('#^/categories/(\d+)$#', $route, $matches) === 1) {
            $id = (int) $matches[1];

            if ($method === 'PUT' || $method === 'PATCH') {
                Response::json(['data' => $repository->updateCategory($id, request_payload())]);
            }

            if ($method === 'DELETE') {
                $repository->deleteCategory($id);
                Response::json(['ok' => true]);
            }
        }

        if ($route === '/products' && $method === 'POST') {
            Response::json(['data' => $repository->createProduct(request_payload())], 201);
        }

        if (preg_match('#^/products/(\d+)$#', $route, $matches) === 1) {
            $id = (int) $matches[1];

            if ($method === 'PUT' || $method === 'PATCH') {
                Response::json(['data' => $repository->updateProduct($id, request_payload())]);
            }

            if ($method === 'DELETE') {
                $repository->deleteProduct($id);
                Response::json(['ok' => true]);
            }
        }
    }

    if (in_array($route, ['/auth/me', '/auth/logout'], true)) {
        $user = $repository->userFromToken((string) $token);

        if ($route === '/auth/me' && $method === 'GET') {
            Response::json(['data' => ['user' => $user]]);
        }

        if ($route === '/auth/logout' && $method === 'POST') {
            $repository->revokeUserSession((string) $token);
            Response::json(['ok' => true]);
        }
    }
} catch (RuntimeException $exception) {
    $message = $exception->getMessage();
    $status = $message === 'Unauthorized.' ? 401 : 422;
    Response::json(['message' => $message], $status);
} catch (\PDOException $exception) {
    $sqlState = (string) $exception->getCode();
    $driverCode = (string) ($exception->errorInfo[1] ?? '');
    $driverMessage = strtolower((string) ($exception->errorInfo[2] ?? $exception->getMessage()));

    if ($sqlState === '23000' && $driverCode === '1062') {
        if (str_contains($driverMessage, 'email')) {
            Response::json(['message' => 'An account with this email already exists. Please sign in instead.'], 409);
        }

        if (str_contains($driverMessage, 'slug')) {
            Response::json(['message' => 'That product or category slug already exists. Please use a different name or slug.'], 409);
        }

        Response::json(['message' => 'That record already exists. Please use a different value and try again.'], 409);
    }

    if ($sqlState === '42S02') {
        Response::json(['message' => 'A required database table is missing. Import backend/database/schema.sql and try again.'], 500);
    }

    if ($sqlState === '42S22') {
        Response::json(['message' => 'The database schema is out of date. Re-import backend/database/schema.sql and try again.'], 500);
    }

    Response::json(['message' => 'Database request failed.', 'error' => $exception->getMessage()], 500);
} catch (\Throwable $throwable) {
    Response::json(['message' => 'An unexpected error occurred.', 'error' => $throwable->getMessage()], 500);
}

Response::json(['message' => 'Not Found'], 404);
