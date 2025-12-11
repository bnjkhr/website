<?php
header('Content-Type: application/json');

// Resend API Konfiguration
// API Key muss als Umgebungsvariable auf dem Server gesetzt werden
$resend_api_key = getenv('RESEND_API_KEY');
$to = 'ben.kohler@me.com';
$from = 'website@benkohler.de';

// Prüfen ob API Key vorhanden
if (empty($resend_api_key)) {
    http_response_code(500);
    error_log('RESEND_API_KEY environment variable not set');
    echo json_encode(['success' => false, 'message' => 'Server-Konfigurationsfehler']);
    exit;
}

// Formulardaten abrufen
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$message = $_POST['message'] ?? '';

// Validierung
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Bitte alle Felder ausfüllen']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ungültige E-Mail-Adresse']);
    exit;
}

// E-Mail Inhalt
$subject = 'Kontakt von Website: ' . $name;
$html_body = "
<h2>Neue Kontaktanfrage</h2>
<p><strong>Name:</strong> {$name}</p>
<p><strong>E-Mail:</strong> <a href='mailto:{$email}'>{$email}</a></p>
<p><strong>Nachricht:</strong></p>
<p>" . nl2br(htmlspecialchars($message)) . "</p>
<hr>
<p style='color: #666; font-size: 12px;'>Gesendet am: " . date('d.m.Y H:i:s') . "</p>
";

// Resend API Request
$data = [
    'from' => "Ben Kohler Website <{$from}>",
    'to' => [$to],
    'reply_to' => $email,
    'subject' => $subject,
    'html' => $html_body
];

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $resend_api_key,
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($data)
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Response auswerten
if ($http_code === 200) {
    echo json_encode(['success' => true, 'message' => 'E-Mail erfolgreich gesendet']);
} else {
    http_response_code(500);
    error_log('Resend Error: ' . $response);
    echo json_encode(['success' => false, 'message' => 'Fehler beim Senden der E-Mail']);
}
?>
