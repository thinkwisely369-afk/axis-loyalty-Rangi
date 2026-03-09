<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected $apiKey;
    protected $apiUrl = 'https://api.mulerouter.ai/vendors/openai/v1/chat/completions';
    protected $model = 'qwen3-vl-plus';

    public function __construct()
    {
        $this->apiKey = config('services.mulerouter.key');
    }

    /**
     * Analyze a bill image using Qwen Vision via MuleRouter
     *
     * @param string $base64Image Base64 encoded image string (with data prefix)
     * @return array|null
     */
    public function analyzeBill(string $base64Image)
    {
        if (!$this->apiKey) {
            Log::error('MuleRouter API Key is missing');
            return null;
        }

        try {
            // Validate base64 image format
            if (!preg_match('/^data:image\/[a-zA-Z0-9+.-]+;base64,.+$/', $base64Image)) {
                Log::error('GeminiService: Invalid base64 image format');
                return null;
            }

            $systemPrompt = <<<'SYSTEM'
You are a precision OCR engine specialized in reading Sri Lankan retail receipts, bills and invoices. You output ONLY valid JSON. You never guess — if text is unreadable, use null. You spell-check all extracted location names against known Sri Lankan places.
SYSTEM;

            $prompt = <<<'PROMPT'
Analyze this bill image with extreme precision. Extract these fields as JSON:

{
  "merchant_name": "<brand name>",
  "location": "<branch/city>",
  "total_amount": <number>,
  "has_ch17_discount": <true/false>,
  "raw_text": "<all text line by line>"
}

FIELD RULES:

**merchant_name**: The store/restaurant brand at the TOP of the bill in large/bold text. Use the common brand name only (e.g. "Keells" not "John Keells Holdings PLC"). Known Sri Lankan merchants: Keells, Cargills, Arpico, KFC, Pizza Hut, Burger King, McDonald's, Laugfs, Softlogic, Abans, Singer, Odel, Cotton Collection, Food City, Laughs, Daimonds, Hameedia, COOL PLANET, Dilighar, Spa Ceylon, Barista, The Coffee Bean, Nandos, Crepe Runner, Taco Bell, Subway, Domino's.

**location**: The branch city/area from the address near the top. MUST be spelled correctly. Cross-check against these known Sri Lankan locations:
Colombo 01-15, Nugegoda, Dehiwala, Mount Lavinia, Maharagama, Kottawa, Piliyandala, Pannipitiya, Boralesgamuwa, Moratuwa, Ratmalana, Battaramulla, Rajagiriya, Nawala, Narahenpita, Wellawatte, Bambalapitiya, Kollupitiya, Fort, Pettah, Maradana, Dematagoda, Kotahena, Grandpass, Borella, Kirulapone, Havelock Town, Thimbirigasyaya, Kandy, Peradeniya, Katugastota, Gampola, Matale, Dambulla, Galle, Unawatuna, Hikkaduwa, Weligama, Matara, Hambantota, Tangalle, Negombo, Ja-Ela, Wattala, Kaduwela, Malabe, Kadawatha, Kiribathgoda, Kelaniya, Pelawatte, Thalawathugoda, Hokandara, Athurugiriya, Kurunegala, Anuradhapura, Jaffna, Trincomalee, Batticaloa, Nuwara Eliya, Badulla, Ratnapura, Kegalle, Chilaw, Puttalam, Kalutara, Panadura, Horana, Bandaragama, Ambalangoda, Elpitiya, Avissawella.

**total_amount**: The FINAL amount paid. Look for "Total", "Grand Total", "Net Total", "Net Amount", "Amount Due", "TOTAL (LKR)" — usually the LAST and LARGEST total near the bottom. Return as a plain number (e.g. 1250.00). Ignore subtotals, tax lines, item prices, and change/balance lines.

**has_ch17_discount**: Scan the ENTIRE bill for these EXACT terms only: "CH17", "CH-17", "CH 17", "Channel 17", "Channel17", "Ch17 Discount", "CH17 Member". If ANY of these specific terms appear as a discount line, return true. Otherwise false. Generic loyalty terms like "Member Discount", "Loyalty Discount", "Privilege Card" alone do NOT count.

**raw_text**: Every line of text from the bill, preserving layout.

CRITICAL:
- Temperature is 0. Be deterministic and precise.
- Read each character carefully, especially digits in amounts.
- Spell location names correctly using the reference list above.
- Return ONLY the JSON object. No markdown, no explanation, no extra text.
PROMPT;

            $response = Http::timeout(90)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post($this->apiUrl, [
                    'model' => $this->model,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $systemPrompt,
                        ],
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'text',
                                    'text' => $prompt,
                                ],
                                [
                                    'type' => 'image_url',
                                    'image_url' => [
                                        'url' => $base64Image,
                                        'detail' => 'high',
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'temperature' => 0,
                    'max_tokens' => 3000,
                ]);

            if ($response->successful()) {
                $result = $response->json();
                $text = $result['choices'][0]['message']['content'] ?? '';

                Log::info('MuleRouter raw response', ['text' => substr($text, 0, 500)]);

                // Clean any markdown wrapping
                $cleanJson = preg_replace('/^```(?:json)?\s*|\s*```$/', '', trim($text));
                $parsed = json_decode($cleanJson, true);

                if (!$parsed) {
                    Log::error('GeminiService: Failed to parse JSON response', ['raw' => $text]);
                    return null;
                }

                // Ensure total_amount is a float
                if (isset($parsed['total_amount'])) {
                    if (is_string($parsed['total_amount'])) {
                        $parsed['total_amount'] = (float) preg_replace('/[^0-9.]/', '', $parsed['total_amount']);
                    } else {
                        $parsed['total_amount'] = (float) $parsed['total_amount'];
                    }
                }

                Log::info('GeminiService: Bill analyzed', [
                    'merchant' => $parsed['merchant_name'] ?? 'unknown',
                    'location' => $parsed['location'] ?? 'unknown',
                    'amount' => $parsed['total_amount'] ?? 0,
                    'ch17' => $parsed['has_ch17_discount'] ?? false,
                ]);

                return $parsed;
            }

            Log::error('MuleRouter API Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('MuleRouter Service Exception: ' . $e->getMessage());
            return null;
        }
    }
}
