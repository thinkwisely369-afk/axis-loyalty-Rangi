<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DialogSmsService
{
    protected $apiUrl;
    protected $username;
    protected $mask;

    public function __construct()
    {
        $this->apiUrl = config('services.dialog.api_url', 'https://richcommunication.dialog.lk/api/sms/inline/send');
        $this->username = config('services.dialog.username', '343deab3020bda1');
        $this->mask = config('services.dialog.mask', 'CH17Loyalty');
    }

    /**
     * Send SMS via Dialog Inline GET API
     *
     * @param string $mobileNumber
     * @param string $message
     * @return array
     */
    public function sendSms(string $mobileNumber, string $message): array
    {
        try {
            $formattedNumber = $this->formatMobileNumberForInline($mobileNumber);

            $params = [
                'q' => $this->username,
                'destination' => $formattedNumber,
                'message' => $message,
                'from' => $this->mask
            ];

            $response = Http::get($this->apiUrl, $params);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'SMS sent successfully',
                    'response' => $response->body()
                ];
            }

            Log::error('Dialog Inline SMS API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'mobile' => $mobileNumber
            ]);

            return [
                'success' => false,
                'message' => 'Failed to send SMS via Dialog Inline API'
            ];

        } catch (\Exception $e) {
            Log::error('Dialog SMS Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'An exception occurred while sending SMS'
            ];
        }
    }

    /**
     * Format mobile number for inline API (dest format like 777777453)
     */
    protected function formatMobileNumberForInline($number): string
    {
        // Remove spaces, dashes, etc.
        $number = preg_replace('/[^0-9]/', '', $number);

        // If starts with 94, remove it (Dialog destination often expects local format)
        if (substr($number, 0, 2) === '94') {
            $number = substr($number, 2);
        }

        // If starts with 0, remove it
        if (substr($number, 0, 1) === '0') {
            $number = substr($number, 1);
        }

        return $number;
    }
}
