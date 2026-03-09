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

    public function analyzeBill(string $base64Image)
    {
        if (!$this->apiKey) {
            Log::error('MuleRouter API Key is missing');
            return null;
        }

        try {
            if (!preg_match('/^data:image\/[a-zA-Z0-9+.-]+;base64,.+$/', $base64Image)) {
                Log::error('GeminiService: Invalid base64 image format');
                return null;
            }

            $systemPrompt = 'You are a precision OCR engine and fraud detection system specialized in reading Sri Lankan retail receipts, bills and invoices. You output ONLY valid JSON. You never guess — if text is unreadable, use null. You spell-check all extracted location names against known Sri Lankan places. You also detect signs of bill tampering, handwriting edits, or forgery.';

            $prompt = <<<'PROMPT'
Analyze this bill image with extreme precision. Extract these fields as JSON:

{
  "merchant_name": "<brand name or null>",
  "location": "<branch/city or null>",
  "total_amount": <number or 0>,
  "has_ch17_discount": <true/false>,
  "is_valid_bill": <true/false>,
  "rejection_reason": "<reason string or null>",
  "raw_text": "<all text line by line>"
}

FIELD RULES:

**merchant_name**: The store/restaurant brand at the TOP of the bill in large/bold text. Use the common brand name only (e.g. "Keells" not "John Keells Holdings PLC"). If NO merchant name is visible or readable, return null. Known Sri Lankan merchants: Keells, Cargills, Arpico, KFC, Pizza Hut, Burger King, McDonalds, Laugfs, Softlogic, Abans, Singer, Odel, Cotton Collection, Food City, Laughs, Daimonds, Hameedia, COOL PLANET, Dilighar, Spa Ceylon, Barista, The Coffee Bean, Nandos, Crepe Runner, Taco Bell, Subway, Dominos.

**location**: The branch city/area from the address near the top. MUST be spelled correctly. If not visible, return null. Cross-check against these known Sri Lankan locations:
Colombo 01-15, Nugegoda, Dehiwala, Mount Lavinia, Maharagama, Kottawa, Piliyandala, Pannipitiya, Boralesgamuwa, Moratuwa, Ratmalana, Battaramulla, Rajagiriya, Nawala, Narahenpita, Wellawatte, Bambalapitiya, Kollupitiya, Fort, Pettah, Maradana, Dematagoda, Kotahena, Grandpass, Borella, Kirulapone, Havelock Town, Thimbirigasyaya, Kandy, Peradeniya, Katugastota, Gampola, Matale, Dambulla, Galle, Unawatuna, Hikkaduwa, Weligama, Matara, Hambantota, Tangalle, Negombo, Ja-Ela, Wattala, Kaduwela, Malabe, Kadawatha, Kiribathgoda, Kelaniya, Pelawatte, Thalawathugoda, Hokandara, Athurugiriya, Kurunegala, Anuradhapura, Jaffna, Trincomalee, Batticaloa, Nuwara Eliya, Badulla, Ratnapura, Kegalle, Chilaw, Puttalam, Kalutara, Panadura, Horana, Bandaragama, Ambalangoda, Elpitiya, Avissawella.

**total_amount**: The FINAL amount paid. Look for "Total", "Grand Total", "Net Total", "Net Amount", "Amount Due", "TOTAL (LKR)" — usually the LAST and LARGEST total near the bottom. Return as a plain number (e.g. 1250.00). Ignore subtotals, tax lines, item prices, and change/balance lines. If no amount is found, return 0.

**has_ch17_discount**: Scan the ENTIRE bill for: "CH17", "CH-17", "CH 17", "Channel 17", "Channel17", "Ch17 Discount", "Privilege Card", "Loyalty Discount", "Loyalty Card Discount", "Member Discount", "CH17 Member". If ANY appear as a discount line, return true. Otherwise false.

**is_valid_bill**: Set to FALSE if ANY of these are detected:
1. The image is NOT a real printed receipt/bill/invoice (e.g. a screenshot, a photo of a screen, a blank page, random photo, non-bill document)
2. Handwritten text or pen/marker edits are visible on the bill (especially amounts, dates, or totals that appear hand-modified or overwritten by hand)
3. The bill appears digitally altered, photoshopped, or manipulated (inconsistent fonts, cut-paste artifacts, misaligned text, blur around specific areas)
4. The merchant name is completely unreadable or missing
5. No total amount is visible anywhere on the bill
6. The image is too blurry, dark, or unclear to reliably read
7. The bill appears to be a duplicate/photocopy with suspicious quality
Set to TRUE only if this is a genuine, unmodified, machine-printed receipt with readable merchant name and total amount.

**rejection_reason**: If is_valid_bill is false, provide a short reason. Examples: "No merchant name found", "Total amount not visible", "Handwritten edits detected on bill", "Bill appears digitally altered", "Image is not a receipt", "Image too blurry to read". If is_valid_bill is true, return null.

**raw_text**: Every line of text from the bill, preserving layout.

CRITICAL:
- Temperature is 0. Be deterministic and precise.
- Read each character carefully, especially digits in amounts.
- Spell location names correctly using the reference list above.
- Be STRICT about fraud detection. Any sign of handwriting, manual edits, or fakery must flag is_valid_bill as false.
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

                $cleanJson = preg_replace('/^```(?:json)?\s*|\s*```$/', '', trim($text));
                $parsed = json_decode($cleanJson, true);

                if (!$parsed) {
                    Log::error('GeminiService: Failed to parse JSON response', ['raw' => $text]);
                    return null;
                }

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
                    'valid' => $parsed['is_valid_bill'] ?? true,
                    'rejection' => $parsed['rejection_reason'] ?? null,
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
