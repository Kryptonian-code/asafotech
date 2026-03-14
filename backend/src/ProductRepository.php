<?php

declare(strict_types=1);

namespace AsafoTech;

use PDO;
use RuntimeException;

final class ProductRepository
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    private const ENV_ADMIN_TOKEN_PREFIX = 'envadmin:';

    public function categories(): array
    {
        $statement = $this->pdo->query(
            'SELECT id, name, slug, icon_name AS iconName, display_order AS displayOrder
             FROM categories
             ORDER BY display_order ASC, name ASC'
        );

        return $statement->fetchAll();
    }

    public function createCategory(array $payload): array
    {
        $slug = $this->slugify((string) ($payload['slug'] ?? $payload['name'] ?? ''));

        $statement = $this->pdo->prepare(
            'INSERT INTO categories (name, slug, icon_name, display_order)
             VALUES (:name, :slug, :iconName, :displayOrder)'
        );
        $statement->execute([
            'name' => trim((string) ($payload['name'] ?? '')),
            'slug' => $slug,
            'iconName' => trim((string) ($payload['iconName'] ?? 'Smartphone')),
            'displayOrder' => (int) ($payload['displayOrder'] ?? 0),
        ]);

        return $this->categoryById((int) $this->pdo->lastInsertId());
    }

    public function updateCategory(int $id, array $payload): array
    {
        $existing = $this->categoryById($id);
        $slug = $this->slugify((string) ($payload['slug'] ?? $payload['name'] ?? $existing['slug']));

        $statement = $this->pdo->prepare(
            'UPDATE categories
             SET name = :name, slug = :slug, icon_name = :iconName, display_order = :displayOrder
             WHERE id = :id'
        );
        $statement->execute([
            'id' => $id,
            'name' => trim((string) ($payload['name'] ?? $existing['name'])),
            'slug' => $slug,
            'iconName' => trim((string) ($payload['iconName'] ?? $existing['iconName'])),
            'displayOrder' => (int) ($payload['displayOrder'] ?? $existing['displayOrder']),
        ]);

        return $this->categoryById($id);
    }

    public function deleteCategory(int $id): void
    {
        $statement = $this->pdo->prepare('DELETE FROM categories WHERE id = :id');
        $statement->execute(['id' => $id]);
    }

    public function products(?string $collection = null): array
    {
        $sql = 'SELECT
                    p.id,
                    p.name,
                    p.slug,
                    p.brand,
                    p.description,
                    p.condition_label AS conditionLabel,
                    p.warranty_months AS warrantyMonths,
                    p.key_specs AS keySpecs,
                    p.gallery_images AS galleryImages,
                    p.variants_json AS variantsJson,
                    p.status,
                    p.price,
                    p.original_price AS originalPrice,
                    p.rating,
                    p.reviews_count AS reviews,
                    p.image_url AS image,
                    p.inventory_count AS inventoryCount,
                    p.collection_tag AS collectionTag,
                    p.is_featured AS isFeatured,
                    p.category_id AS categoryId,
                    c.name AS categoryName,
                    c.slug AS categorySlug
                FROM products p
                INNER JOIN categories c ON c.id = p.category_id';

        $params = [];

        if ($collection !== null && $collection !== '') {
            $sql .= ' WHERE p.collection_tag = :collection';
            $params['collection'] = $collection;
        }

        $sql .= ' ORDER BY p.is_featured DESC, p.created_at DESC';

        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function productBySlug(string $slug): array
    {
        $statement = $this->pdo->prepare(
            'SELECT
                p.id,
                p.name,
                p.slug,
                p.brand,
                p.description,
                p.condition_label AS conditionLabel,
                p.warranty_months AS warrantyMonths,
                p.key_specs AS keySpecs,
                p.gallery_images AS galleryImages,
                p.variants_json AS variantsJson,
                p.status,
                p.price,
                p.original_price AS originalPrice,
                p.rating,
                p.reviews_count AS reviews,
                p.image_url AS image,
                p.inventory_count AS inventoryCount,
                p.collection_tag AS collectionTag,
                p.is_featured AS isFeatured,
                p.category_id AS categoryId,
                c.name AS categoryName,
                c.slug AS categorySlug
             FROM products p
             INNER JOIN categories c ON c.id = p.category_id
             WHERE p.slug = :slug
             LIMIT 1'
        );
        $statement->execute(['slug' => $slug]);
        $product = $statement->fetch();

        if ($product === false) {
            throw new RuntimeException('Product not found.');
        }

        return $product;
    }

    public function createProduct(array $payload): array
    {
        $slug = $this->slugify((string) ($payload['slug'] ?? $payload['name'] ?? ''));

        $statement = $this->pdo->prepare(
            'INSERT INTO products
                (category_id, name, slug, brand, description, condition_label, warranty_months, key_specs, gallery_images, variants_json, status, price, original_price, rating, reviews_count, image_url, inventory_count, collection_tag, is_featured)
             VALUES
                (:categoryId, :name, :slug, :brand, :description, :conditionLabel, :warrantyMonths, :keySpecs, :galleryImages, :variantsJson, :status, :price, :originalPrice, :rating, :reviews, :image, :inventoryCount, :collectionTag, :isFeatured)'
        );
        $statement->execute([
            'categoryId' => (int) ($payload['categoryId'] ?? 0),
            'name' => trim((string) ($payload['name'] ?? '')),
            'slug' => $slug,
            'brand' => trim((string) ($payload['brand'] ?? '')),
            'description' => trim((string) ($payload['description'] ?? '')),
            'conditionLabel' => trim((string) ($payload['conditionLabel'] ?? 'Brand New')),
            'warrantyMonths' => $this->nullableInt($payload['warrantyMonths'] ?? null),
            'keySpecs' => $this->nullableString($payload['keySpecs'] ?? null),
            'galleryImages' => $this->jsonArrayString($payload['galleryImages'] ?? null, (string) ($payload['image'] ?? '')),
            'variantsJson' => $this->jsonArrayString($payload['variants'] ?? null),
            'status' => $this->productStatus((string) ($payload['status'] ?? 'active')),
            'price' => (float) ($payload['price'] ?? 0),
            'originalPrice' => $this->nullableFloat($payload['originalPrice'] ?? null),
            'rating' => (float) ($payload['rating'] ?? 0),
            'reviews' => (int) ($payload['reviews'] ?? 0),
            'image' => trim((string) ($payload['image'] ?? '')),
            'inventoryCount' => (int) ($payload['inventoryCount'] ?? 0),
            'collectionTag' => $this->nullableString($payload['collectionTag'] ?? null),
            'isFeatured' => !empty($payload['isFeatured']) ? 1 : 0,
        ]);

        return $this->productById((int) $this->pdo->lastInsertId());
    }

    public function updateProduct(int $id, array $payload): array
    {
        $existing = $this->productById($id);
        $slug = $this->slugify((string) ($payload['slug'] ?? $payload['name'] ?? $existing['name']));

        $statement = $this->pdo->prepare(
            'UPDATE products
             SET category_id = :categoryId,
                 name = :name,
                 slug = :slug,
                 brand = :brand,
                 description = :description,
                 condition_label = :conditionLabel,
                 warranty_months = :warrantyMonths,
                 key_specs = :keySpecs,
                 gallery_images = :galleryImages,
                 variants_json = :variantsJson,
                 status = :status,
                 price = :price,
                 original_price = :originalPrice,
                 rating = :rating,
                 reviews_count = :reviews,
                 image_url = :image,
                 inventory_count = :inventoryCount,
                 collection_tag = :collectionTag,
                 is_featured = :isFeatured
             WHERE id = :id'
        );
        $statement->execute([
            'id' => $id,
            'categoryId' => (int) ($payload['categoryId'] ?? $existing['categoryId']),
            'name' => trim((string) ($payload['name'] ?? $existing['name'])),
            'slug' => $slug,
            'brand' => trim((string) ($payload['brand'] ?? $existing['brand'])),
            'description' => trim((string) ($payload['description'] ?? ($existing['description'] ?? ''))),
            'conditionLabel' => trim((string) ($payload['conditionLabel'] ?? ($existing['conditionLabel'] ?? 'Brand New'))),
            'warrantyMonths' => array_key_exists('warrantyMonths', $payload)
                ? $this->nullableInt($payload['warrantyMonths'])
                : $this->nullableInt($existing['warrantyMonths'] ?? null),
            'keySpecs' => array_key_exists('keySpecs', $payload)
                ? $this->nullableString($payload['keySpecs'])
                : $this->nullableString($existing['keySpecs'] ?? null),
            'galleryImages' => array_key_exists('galleryImages', $payload)
                ? $this->jsonArrayString($payload['galleryImages'], (string) ($payload['image'] ?? $existing['image']))
                : $this->jsonArrayString($existing['galleryImages'] ?? null, (string) $existing['image']),
            'variantsJson' => array_key_exists('variants', $payload)
                ? $this->jsonArrayString($payload['variants'])
                : $this->jsonArrayString($existing['variantsJson'] ?? null),
            'status' => array_key_exists('status', $payload)
                ? $this->productStatus((string) $payload['status'])
                : $this->productStatus((string) ($existing['status'] ?? 'active')),
            'price' => (float) ($payload['price'] ?? $existing['price']),
            'originalPrice' => array_key_exists('originalPrice', $payload)
                ? $this->nullableFloat($payload['originalPrice'])
                : $this->nullableFloat($existing['originalPrice'] ?? null),
            'rating' => (float) ($payload['rating'] ?? $existing['rating']),
            'reviews' => (int) ($payload['reviews'] ?? $existing['reviews']),
            'image' => trim((string) ($payload['image'] ?? $existing['image'])),
            'inventoryCount' => (int) ($payload['inventoryCount'] ?? $existing['inventoryCount']),
            'collectionTag' => array_key_exists('collectionTag', $payload)
                ? $this->nullableString($payload['collectionTag'])
                : $this->nullableString($existing['collectionTag'] ?? null),
            'isFeatured' => array_key_exists('isFeatured', $payload)
                ? (!empty($payload['isFeatured']) ? 1 : 0)
                : (int) $existing['isFeatured'],
        ]);

        return $this->productById($id);
    }

    public function deleteProduct(int $id): void
    {
        $statement = $this->pdo->prepare('DELETE FROM products WHERE id = :id');
        $statement->execute(['id' => $id]);
    }

    public function createOrder(array $payload): array
    {
        $items = $payload['items'] ?? [];

        if (!is_array($items) || $items === []) {
            throw new RuntimeException('Order must contain at least one item.');
        }

        $customerName = trim((string) ($payload['customerName'] ?? ''));
        $customerPhone = $this->normalizePhone((string) ($payload['customerPhone'] ?? ''), true);
        $deliveryAddress = trim((string) ($payload['deliveryAddress'] ?? ''));
        $customerEmail = strtolower(trim((string) ($payload['customerEmail'] ?? '')));
        $customerFirebaseUid = trim((string) ($payload['customerFirebaseUid'] ?? ''));

        if ($customerName === '' || $customerPhone === '' || $deliveryAddress === '') {
            throw new RuntimeException('Customer details are required.');
        }

        $subtotal = 0.0;
        $normalizedItems = [];

        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }

            $productId = (int) ($item['productId'] ?? 0);
            $quantity = max(1, (int) ($item['quantity'] ?? 1));
            $product = $this->productById($productId);
            $variantLabel = trim((string) ($item['variantLabel'] ?? ''));
            $variantPrice = array_key_exists('variantPrice', $item) ? (float) $item['variantPrice'] : null;
            $unitPrice = $variantPrice !== null && $variantPrice > 0 ? $variantPrice : (float) $product['price'];
            $subtotal += $unitPrice * $quantity;

            $normalizedItems[] = [
                'productId' => $productId,
                'quantity' => $quantity,
                'unitPrice' => $unitPrice,
                'variantLabel' => $variantLabel !== '' ? $variantLabel : null,
            ];
        }

        if ($normalizedItems === []) {
            throw new RuntimeException('Order items are invalid.');
        }

        $deliveryFee = $subtotal >= 200 ? 0.0 : 15.0;
        $total = $subtotal + $deliveryFee;
        $userId = $this->resolveOrderUserId($customerEmail, $customerFirebaseUid);

        $this->pdo->beginTransaction();

        try {
            $statement = $this->pdo->prepare(
                'INSERT INTO orders
                    (user_id, order_number, status, payment_status, subtotal, delivery_fee, total, customer_name, customer_phone, delivery_address)
                 VALUES
                    (:userId, :orderNumber, :status, :paymentStatus, :subtotal, :deliveryFee, :total, :customerName, :customerPhone, :deliveryAddress)'
            );

            $orderNumber = 'ESH-' . strtoupper(bin2hex(random_bytes(4)));

            $statement->execute([
                'userId' => $userId,
                'orderNumber' => $orderNumber,
                'status' => 'pending',
                'paymentStatus' => 'pending',
                'subtotal' => $subtotal,
                'deliveryFee' => $deliveryFee,
                'total' => $total,
                'customerName' => $customerName,
                'customerPhone' => $customerPhone,
                'deliveryAddress' => $deliveryAddress,
            ]);

            $orderId = (int) $this->pdo->lastInsertId();

            $itemStatement = $this->pdo->prepare(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price, variant_label)
                 VALUES (:orderId, :productId, :quantity, :unitPrice, :variantLabel)'
            );

            foreach ($normalizedItems as $item) {
                $itemStatement->execute([
                    'orderId' => $orderId,
                    'productId' => $item['productId'],
                    'quantity' => $item['quantity'],
                    'unitPrice' => $item['unitPrice'],
                    'variantLabel' => $item['variantLabel'],
                ]);
            }

            $this->pdo->commit();

            return [
                'orderId' => $orderId,
                'orderNumber' => $orderNumber,
                'subtotal' => $subtotal,
                'deliveryFee' => $deliveryFee,
                'total' => $total,
            ];
        } catch (\Throwable $throwable) {
            $this->pdo->rollBack();
            throw $throwable;
        }
    }

    public function orders(): array
    {
        $statement = $this->pdo->query(
            'SELECT id, user_id AS userId, order_number AS orderNumber, status, payment_status AS paymentStatus, subtotal, delivery_fee AS deliveryFee, total, customer_name AS customerName, customer_phone AS customerPhone, delivery_address AS deliveryAddress, created_at AS createdAt
             FROM orders
             ORDER BY created_at DESC'
        );

        return $statement->fetchAll();
    }

    public function orderDetailsById(int $id): array
    {
        $statement = $this->pdo->prepare(
            'SELECT id, user_id AS userId, order_number AS orderNumber, status, payment_status AS paymentStatus, subtotal, delivery_fee AS deliveryFee, total, customer_name AS customerName, customer_phone AS customerPhone, delivery_address AS deliveryAddress, created_at AS createdAt
             FROM orders
             WHERE id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $order = $statement->fetch();

        if ($order === false) {
            throw new RuntimeException('Order not found.');
        }

        $order['items'] = $this->orderItems((int) $order['id']);

        return $order;
    }

    public function customerOrders(array $payload): array
    {
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $firebaseUid = trim((string) ($payload['firebaseUid'] ?? ''));

        if ($email === '' && $firebaseUid === '') {
            throw new RuntimeException('Customer identity is required.');
        }

        $userId = $this->resolveOrderUserId($email, $firebaseUid);

        if ($userId === null) {
            return [];
        }

        $statement = $this->pdo->prepare(
            'SELECT id, user_id AS userId, order_number AS orderNumber, status, payment_status AS paymentStatus, subtotal, delivery_fee AS deliveryFee, total, customer_name AS customerName, customer_phone AS customerPhone, delivery_address AS deliveryAddress, created_at AS createdAt
             FROM orders
             WHERE user_id = :userId
             ORDER BY created_at DESC'
        );
        $statement->execute(['userId' => $userId]);

        return $statement->fetchAll();
    }

    public function customerOrderDetails(array $payload, string $orderNumber): array
    {
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $firebaseUid = trim((string) ($payload['firebaseUid'] ?? ''));

        if ($email === '' && $firebaseUid === '') {
            throw new RuntimeException('Customer identity is required.');
        }

        $userId = $this->resolveOrderUserId($email, $firebaseUid);

        if ($userId === null) {
            throw new RuntimeException('Order not found.');
        }

        $statement = $this->pdo->prepare(
            'SELECT id, user_id AS userId, order_number AS orderNumber, status, payment_status AS paymentStatus, subtotal, delivery_fee AS deliveryFee, total, customer_name AS customerName, customer_phone AS customerPhone, delivery_address AS deliveryAddress, created_at AS createdAt
             FROM orders
             WHERE user_id = :userId AND order_number = :orderNumber
             LIMIT 1'
        );
        $statement->execute([
            'userId' => $userId,
            'orderNumber' => $orderNumber,
        ]);
        $order = $statement->fetch();

        if ($order === false) {
            throw new RuntimeException('Order not found.');
        }

        $order['items'] = $this->orderItems((int) $order['id']);

        return $order;
    }

    public function applyPaystackVerification(string $reference, array $verificationData): array
    {
        $order = $this->orderByReference($reference);
        $verifiedAmount = (int) ($verificationData['amount'] ?? 0);
        $expectedAmount = (int) round(((float) $order['total']) * 100);
        $paystackStatus = strtolower(trim((string) ($verificationData['status'] ?? '')));

        if ($verifiedAmount > 0 && $verifiedAmount !== $expectedAmount) {
            throw new RuntimeException('Paystack amount does not match the order total.');
        }

        $paymentStatus = $paystackStatus === 'success' ? 'paid' : ($paystackStatus === '' ? 'pending' : $paystackStatus);
        $orderStatus = $paystackStatus === 'success'
            ? ($order['status'] === 'pending' ? 'processing' : $order['status'])
            : $order['status'];

        $statement = $this->pdo->prepare(
            'UPDATE orders
             SET payment_status = :paymentStatus,
                 status = :status
             WHERE id = :id'
        );
        $statement->execute([
            'id' => (int) $order['id'],
            'paymentStatus' => $paymentStatus,
            'status' => $orderStatus,
        ]);

        return [
            'paymentStatus' => $paymentStatus,
            'message' => $paystackStatus === 'success'
                ? 'Payment verified successfully.'
                : 'Payment verification completed.',
            'order' => $this->orderByReference($reference),
        ];
    }

    public function bootstrapAdmin(array $payload): array
    {
        $existingCount = $this->adminCount();

        if ($existingCount > 0) {
            throw new RuntimeException('Admin account already exists.');
        }

        $fullName = trim((string) ($payload['fullName'] ?? ''));
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');

        if ($fullName === '' || $email === '' || $password === '') {
            throw new RuntimeException('Full name, email, and password are required.');
        }

        $statement = $this->pdo->prepare(
            'INSERT INTO admin_users (full_name, email, password_hash)
             VALUES (:fullName, :email, :passwordHash)'
        );
        $statement->execute([
            'fullName' => $fullName,
            'email' => $email,
            'passwordHash' => password_hash($password, PASSWORD_DEFAULT),
        ]);

        return $this->issueAdminSession((int) $this->pdo->lastInsertId());
    }

    public function loginAdmin(array $payload): array
    {
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');

        $configuredAdmin = $this->configuredAdminByEmail($email);

        if ($configuredAdmin !== null && hash_equals($configuredAdmin['password'], $password)) {
            return $this->issueConfiguredAdminSession($configuredAdmin);
        }

        $statement = $this->pdo->prepare(
            'SELECT id, full_name AS fullName, email, password_hash AS passwordHash
             FROM admin_users
             WHERE email = :email
             LIMIT 1'
        );
        $statement->execute(['email' => $email]);
        $admin = $statement->fetch();

        if ($admin === false || !password_verify($password, (string) $admin['passwordHash'])) {
            throw new RuntimeException('Invalid login credentials.');
        }

        return $this->issueAdminSession((int) $admin['id']);
    }

    public function adminCount(): int
    {
        return count($this->configuredAdmins()) + (int) $this->pdo->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
    }

    public function adminFromToken(string $token): array
    {
        $configuredAdmin = $this->configuredAdminFromToken($token);

        if ($configuredAdmin !== null) {
            return $configuredAdmin;
        }

        $statement = $this->pdo->prepare(
            'SELECT a.id, a.full_name AS fullName, a.email
             FROM admin_sessions s
             INNER JOIN admin_users a ON a.id = s.admin_user_id
             WHERE s.session_token = :token AND s.expires_at > NOW()
             LIMIT 1'
        );
        $statement->execute(['token' => $token]);
        $admin = $statement->fetch();

        if ($admin === false) {
            throw new RuntimeException('Unauthorized.');
        }

        return $admin;
    }

    public function revokeSession(string $token): void
    {
        if (str_starts_with($token, self::ENV_ADMIN_TOKEN_PREFIX)) {
            return;
        }

        $statement = $this->pdo->prepare('DELETE FROM admin_sessions WHERE session_token = :token');
        $statement->execute(['token' => $token]);
    }

    public function updateOrderStatus(int $id, array $payload): array
    {
        $statement = $this->pdo->prepare(
            'UPDATE orders
             SET status = :status, payment_status = :paymentStatus
             WHERE id = :id'
        );
        $statement->execute([
            'id' => $id,
            'status' => trim((string) ($payload['status'] ?? 'pending')),
            'paymentStatus' => trim((string) ($payload['paymentStatus'] ?? 'pending')),
        ]);

        $orderStatement = $this->pdo->prepare(
            'SELECT id, user_id AS userId, order_number AS orderNumber, status, payment_status AS paymentStatus, subtotal, delivery_fee AS deliveryFee, total, customer_name AS customerName, customer_phone AS customerPhone, delivery_address AS deliveryAddress, created_at AS createdAt
             FROM orders
             WHERE id = :id
             LIMIT 1'
        );
        $orderStatement->execute(['id' => $id]);
        $order = $orderStatement->fetch();

        if ($order === false) {
            throw new RuntimeException('Order not found.');
        }

        return $order;
    }

    public function syncFirebaseUser(array $payload): array
    {
        $firebaseUid = trim((string) ($payload['firebaseUid'] ?? ''));
        $fullName = trim((string) ($payload['fullName'] ?? ''));
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $phone = $this->normalizePhone((string) ($payload['phone'] ?? ''), false);
        $emailVerified = !empty($payload['emailVerified']) ? 1 : 0;

        if ($firebaseUid === '' || $email === '' || $fullName === '') {
            throw new RuntimeException('Firebase user details are required.');
        }

        $statement = $this->pdo->prepare(
            'SELECT id, full_name AS fullName, firebase_uid AS firebaseUid, email, phone
             FROM users
             WHERE firebase_uid = :firebaseUid OR email = :email
             LIMIT 1'
        );
        $statement->execute([
            'firebaseUid' => $firebaseUid,
            'email' => $email,
        ]);
        $user = $statement->fetch();

        if ($user === false) {
            $insert = $this->pdo->prepare(
                'INSERT INTO users (full_name, firebase_uid, email, password_hash, phone, email_verified)
                 VALUES (:fullName, :firebaseUid, :email, :passwordHash, :phone, :emailVerified)'
            );
            $insert->execute([
                'fullName' => $fullName,
                'firebaseUid' => $firebaseUid,
                'email' => $email,
                'passwordHash' => password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT),
                'phone' => $phone,
                'emailVerified' => $emailVerified,
            ]);

            return $this->userById((int) $this->pdo->lastInsertId());
        }

        $update = $this->pdo->prepare(
            'UPDATE users
             SET full_name = :fullName,
                 firebase_uid = :firebaseUid,
                 email = :email,
                 phone = COALESCE(:phone, phone),
                 email_verified = :emailVerified
             WHERE id = :id'
        );
        $update->execute([
            'id' => (int) $user['id'],
            'fullName' => $fullName,
            'firebaseUid' => $firebaseUid,
            'email' => $email,
            'phone' => $phone,
            'emailVerified' => $emailVerified,
        ]);

        return $this->userById((int) $user['id']);
    }

    public function registerUser(array $payload): array
    {
        $fullName = trim((string) ($payload['fullName'] ?? ''));
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');
        $phone = $this->normalizePhone((string) ($payload['phone'] ?? ''), false);

        if ($fullName === '' || $email === '' || $password === '') {
            throw new RuntimeException('Full name, email, and password are required.');
        }

        $statement = $this->pdo->prepare(
            'INSERT INTO users (full_name, email, password_hash, phone)
             VALUES (:fullName, :email, :passwordHash, :phone)'
        );
        $statement->execute([
            'fullName' => $fullName,
            'email' => $email,
            'passwordHash' => password_hash($password, PASSWORD_DEFAULT),
            'phone' => $phone === '' ? null : $phone,
        ]);

        return $this->issueUserSession((int) $this->pdo->lastInsertId());
    }

    public function loginUser(array $payload): array
    {
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');

        $statement = $this->pdo->prepare(
            'SELECT id, full_name AS fullName, email, phone, password_hash AS passwordHash
             FROM users
             WHERE email = :email
             LIMIT 1'
        );
        $statement->execute(['email' => $email]);
        $user = $statement->fetch();

        if ($user === false || !password_verify($password, (string) $user['passwordHash'])) {
            throw new RuntimeException('Invalid login credentials.');
        }

        return $this->issueUserSession((int) $user['id']);
    }

    public function userFromToken(string $token): array
    {
        $statement = $this->pdo->prepare(
            'SELECT u.id, u.full_name AS fullName, u.email, u.phone
             FROM user_sessions s
             INNER JOIN users u ON u.id = s.user_id
             WHERE s.session_token = :token AND s.expires_at > NOW()
             LIMIT 1'
        );
        $statement->execute(['token' => $token]);
        $user = $statement->fetch();

        if ($user === false) {
            throw new RuntimeException('Unauthorized.');
        }

        return $user;
    }

    public function revokeUserSession(string $token): void
    {
        $statement = $this->pdo->prepare('DELETE FROM user_sessions WHERE session_token = :token');
        $statement->execute(['token' => $token]);
    }

    private function issueAdminSession(int $adminUserId): array
    {
        $statement = $this->pdo->prepare(
            'SELECT id, full_name AS fullName, email
             FROM admin_users
             WHERE id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $adminUserId]);
        $admin = $statement->fetch();

        if ($admin === false) {
            throw new RuntimeException('Admin account not found.');
        }

        $token = bin2hex(random_bytes(32));
        $expiresAt = (new \DateTimeImmutable('+7 days'))->format('Y-m-d H:i:s');

        $insert = $this->pdo->prepare(
            'INSERT INTO admin_sessions (admin_user_id, session_token, expires_at)
             VALUES (:adminUserId, :sessionToken, :expiresAt)'
        );
        $insert->execute([
            'adminUserId' => $adminUserId,
            'sessionToken' => $token,
            'expiresAt' => $expiresAt,
        ]);

        return [
            'token' => $token,
            'admin' => $admin,
            'expiresAt' => $expiresAt,
        ];
    }

    private function issueConfiguredAdminSession(array $configuredAdmin): array
    {
        $email = strtolower(trim((string) $configuredAdmin['email']));
        $fullName = trim((string) $configuredAdmin['fullName']);
        $expiresAt = (new \DateTimeImmutable('+7 days'))->format('Y-m-d H:i:s');
        $signature = hash('sha256', $email . '|' . $configuredAdmin['password']);

        return [
            'token' => self::ENV_ADMIN_TOKEN_PREFIX . $email . ':' . $signature,
            'admin' => [
                'id' => 0,
                'fullName' => $fullName === '' ? 'Env Admin' : $fullName,
                'email' => $email,
            ],
            'expiresAt' => $expiresAt,
        ];
    }

    private function issueUserSession(int $userId): array
    {
        $user = $this->userById($userId);

        $token = bin2hex(random_bytes(32));
        $expiresAt = (new \DateTimeImmutable('+7 days'))->format('Y-m-d H:i:s');

        $insert = $this->pdo->prepare(
            'INSERT INTO user_sessions (user_id, session_token, expires_at)
             VALUES (:userId, :sessionToken, :expiresAt)'
        );
        $insert->execute([
            'userId' => $userId,
            'sessionToken' => $token,
            'expiresAt' => $expiresAt,
        ]);

        return [
          'token' => $token,
          'user' => $user,
          'expiresAt' => $expiresAt,
        ];
    }

    private function categoryById(int $id): array
    {
        $statement = $this->pdo->prepare(
            'SELECT id, name, slug, icon_name AS iconName, display_order AS displayOrder
             FROM categories
             WHERE id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $category = $statement->fetch();

        if ($category === false) {
            throw new RuntimeException('Category not found.');
        }

        return $category;
    }

    private function productById(int $id): array
    {
        $statement = $this->pdo->prepare(
            'SELECT
                p.id,
                p.name,
                p.slug,
                p.brand,
                p.description,
                p.condition_label AS conditionLabel,
                p.warranty_months AS warrantyMonths,
                p.key_specs AS keySpecs,
                p.status,
                p.price,
                p.original_price AS originalPrice,
                p.rating,
                p.reviews_count AS reviews,
                p.image_url AS image,
                p.inventory_count AS inventoryCount,
                p.collection_tag AS collectionTag,
                p.is_featured AS isFeatured,
                p.category_id AS categoryId,
                c.name AS categoryName,
                c.slug AS categorySlug
             FROM products p
             INNER JOIN categories c ON c.id = p.category_id
             WHERE p.id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $product = $statement->fetch();

        if ($product === false) {
            throw new RuntimeException('Product not found.');
        }

        return $product;
    }

    private function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return max(0, (int) $value);
    }

    private function jsonArrayString(mixed $value, string ...$fallbackValues): ?string
    {
        $items = [];

        if (is_string($value)) {
          $decoded = json_decode($value, true);
          if (is_array($decoded)) {
              $items = $decoded;
          } else {
              $items = preg_split('/\r?\n/', $value) ?: [];
          }
        } elseif (is_array($value)) {
            $items = $value;
        }

        $normalized = [];

        foreach ($items as $item) {
            if (is_array($item)) {
                $normalized[] = $item;
                continue;
            }

            $text = trim((string) $item);

            if ($text !== '') {
                $normalized[] = $text;
            }
        }

        if ($normalized === []) {
            foreach ($fallbackValues as $fallback) {
                $fallback = trim($fallback);

                if ($fallback !== '') {
                    $normalized[] = $fallback;
                }
            }
        }

        return $normalized === [] ? null : json_encode(array_values($normalized), JSON_THROW_ON_ERROR);
    }

    private function productStatus(string $value): string
    {
        $normalized = strtolower(trim($value));
        $allowed = ['active', 'draft', 'archived'];

        return in_array($normalized, $allowed, true) ? $normalized : 'active';
    }

    private function userById(int $id): array
    {
        $statement = $this->pdo->prepare(
            'SELECT id, full_name AS fullName, firebase_uid AS firebaseUid, email, phone
             FROM users
             WHERE id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $user = $statement->fetch();

        if ($user === false) {
            throw new RuntimeException('User account not found.');
        }

        return $user;
    }

    private function orderByReference(string $reference): array
    {
        $statement = $this->pdo->prepare(
            'SELECT id, user_id AS userId, order_number AS orderNumber, status, payment_status AS paymentStatus, subtotal, delivery_fee AS deliveryFee, total, customer_name AS customerName, customer_phone AS customerPhone, delivery_address AS deliveryAddress, created_at AS createdAt
             FROM orders
             WHERE order_number = :reference
             LIMIT 1'
        );
        $statement->execute(['reference' => $reference]);
        $order = $statement->fetch();

        if ($order === false) {
            throw new RuntimeException('Order not found for payment verification.');
        }

        return $order;
    }

    private function orderItems(int $orderId): array
    {
        $statement = $this->pdo->prepare(
            'SELECT
                oi.id,
                oi.product_id AS productId,
                oi.quantity,
                oi.unit_price AS unitPrice,
                oi.variant_label AS variantLabel,
                p.name AS productName,
                p.slug AS productSlug,
                p.image_url AS image,
                p.brand
             FROM order_items oi
             INNER JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = :orderId
             ORDER BY oi.id ASC'
        );
        $statement->execute(['orderId' => $orderId]);

        return $statement->fetchAll();
    }

    private function resolveOrderUserId(string $email, string $firebaseUid): ?int
    {
        if ($email === '' && $firebaseUid === '') {
            return null;
        }

        $statement = $this->pdo->prepare(
            'SELECT id
             FROM users
             WHERE (:firebaseUid <> "" AND firebase_uid = :firebaseUid)
                OR (:email <> "" AND email = :email)
             LIMIT 1'
        );
        $statement->execute([
            'firebaseUid' => $firebaseUid,
            'email' => $email,
        ]);
        $userId = $statement->fetchColumn();

        return $userId === false ? null : (int) $userId;
    }

    private function slugify(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
        $value = trim($value, '-');

        if ($value === '') {
            throw new RuntimeException('A valid name or slug is required.');
        }

        return $value;
    }

    private function nullableString(mixed $value): ?string
    {
        $normalized = trim((string) $value);

        return $normalized === '' ? null : $normalized;
    }

    private function nullableFloat(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (float) $value;
    }

    private function normalizePhone(string $value, bool $required): ?string
    {
        $normalized = trim($value);

        if ($normalized === '') {
            if ($required) {
                throw new RuntimeException('Phone number is required.');
            }

            return null;
        }

        if (!preg_match('/^[0-9]+$/', $normalized)) {
            throw new RuntimeException('Phone number must contain digits only.');
        }

        return $normalized;
    }

    private function configuredAdmins(): array
    {
        $admins = [];
        $indexed = [];

        foreach (array_merge($_ENV, $_SERVER) as $key => $value) {
            if (!is_string($key) || !is_string($value)) {
                continue;
            }

            if (preg_match('/^ADMIN_(\d+)_(EMAIL|PASSWORD|FULL_NAME)$/', $key, $matches) !== 1) {
                continue;
            }

            $index = (int) $matches[1];
            $field = $matches[2];
            $indexed[$index][$field] = trim($value);
        }

        ksort($indexed);

        foreach ($indexed as $entry) {
            $email = strtolower(trim((string) ($entry['EMAIL'] ?? '')));
            $password = (string) ($entry['PASSWORD'] ?? '');
            $fullName = trim((string) ($entry['FULL_NAME'] ?? ''));

            if ($email === '' || $password === '') {
                continue;
            }

            $admins[] = [
                'email' => $email,
                'password' => $password,
                'fullName' => $fullName === '' ? 'Admin User' : $fullName,
            ];
        }

        $singleEmail = strtolower(trim((string) Config::env('ADMIN_EMAIL', '')));
        $singlePassword = (string) Config::env('ADMIN_PASSWORD', '');
        $singleFullName = trim((string) Config::env('ADMIN_FULL_NAME', ''));

        if ($singleEmail !== '' && $singlePassword !== '') {
            $admins[] = [
                'email' => $singleEmail,
                'password' => $singlePassword,
                'fullName' => $singleFullName === '' ? 'Admin User' : $singleFullName,
            ];
        }

        return $admins;
    }

    private function configuredAdminByEmail(string $email): ?array
    {
        foreach ($this->configuredAdmins() as $configuredAdmin) {
            if ($configuredAdmin['email'] === $email) {
                return $configuredAdmin;
            }
        }

        return null;
    }

    private function configuredAdminFromToken(string $token): ?array
    {
        if (!str_starts_with($token, self::ENV_ADMIN_TOKEN_PREFIX)) {
            return null;
        }

        $payload = substr($token, strlen(self::ENV_ADMIN_TOKEN_PREFIX));
        [$email, $signature] = array_pad(explode(':', $payload, 2), 2, '');

        if ($email === '' || $signature === '') {
            return null;
        }

        $configuredAdmin = $this->configuredAdminByEmail(strtolower($email));

        if ($configuredAdmin === null) {
            return null;
        }

        $expectedSignature = hash('sha256', $configuredAdmin['email'] . '|' . $configuredAdmin['password']);

        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        return [
            'id' => 0,
            'fullName' => $configuredAdmin['fullName'],
            'email' => $configuredAdmin['email'],
        ];
    }
}
