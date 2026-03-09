<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'insurance' => [
        'api_url' => env('INSURANCE_API_URL'),
        'api_key' => env('INSURANCE_API_KEY'),
    ],

    'dialog' => [
        'api_url' => env('DIALOG_SMS_API_URL', 'https://richcommunication.dialog.lk/api/sms/inline/send'),
        'username' => env('DIALOG_API_USERNAME'),
        'password' => env('DIALOG_API_PASSWORD'),
        'mask' => env('DIALOG_SMS_MASK', 'CH17Loyalty'),
    ],

    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
    ],

    'openrouter' => [
        'key' => env('OPENROUTER_API_KEY'),
    ],

    'mulerouter' => [
        'key' => env('MULEROUTER_API_KEY'),
    ],

];
