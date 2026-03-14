<?php

declare(strict_types=1);

namespace AsafoTech;

use RuntimeException;

final class PaystackService
{
    private const BASE_URL = 'https://api.paystack.co';

    public function __construct(private readonly string $secretKey)
    {
    }

    public function initializeTransaction(array $payload): array
    {
        return $this->request('POST', '/transaction/initialize', $payload);
    }

    public function verifyTransaction(string $reference): array
    {
        return $this->request('GET', '/transaction/verify/' . rawurlencode($reference));
    }

    private function request(string $method, string $path, ?array $payload = null): array
    {
        if (trim($this->secretKey) === '') {
            throw new RuntimeException('Paystack is not configured yet. Add PAYSTACK_SECRET_KEY to your project .env.');
        }

        $ch = curl_init();

        if ($ch === false) {
            throw new RuntimeException('Unable to initialize Paystack request.');
        }

        $headers = [
            'Authorization: Bearer ' . $this->secretKey,
            'Accept: application/json',
        ];

        $options = [
            CURLOPT_URL => self::BASE_URL . $path,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 20,
        ];

        if ($payload !== null) {
            $json = json_encode($payload, JSON_THROW_ON_ERROR);
            $headers[] = 'Content-Type: application/json';
            $options[CURLOPT_HTTPHEADER] = $headers;
            $options[CURLOPT_POSTFIELDS] = $json;
        }

        curl_setopt_array($ch, $options);
        $raw = curl_exec($ch);

        if ($raw === false) {
            $error = curl_error($ch);
            curl_close($ch);
            throw new RuntimeException('Paystack request failed: ' . $error);
        }

        $statusCode = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        $decoded = json_decode($raw, true);

        if (!is_array($decoded)) {
            throw new RuntimeException('Paystack returned an invalid response.');
        }

        if ($statusCode >= 400 || !($decoded['status'] ?? false)) {
            $message = $decoded['message'] ?? 'Paystack request failed.';
            throw new RuntimeException(is_string($message) ? $message : 'Paystack request failed.');
        }

        return $decoded;
    }
}
