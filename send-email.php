<?php
header('Content-Type: application/json');

// Konfiguration
$to = 'mail@benkohler.de';
$from = 'website@benkohler.de';
$subject_prefix = 'Kontakt von Website';

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

// E-Mail vorbereiten
$subject = $subject_prefix . ': ' . $name;
$email_body = "Name: $name\n";
$email_body .= "E-Mail: $email\n\n";
$email_body .= "Nachricht:\n$message\n\n";
$email_body .= "---\n";
$email_body .= "Gesendet am: " . date('d.m.Y H:i:s');

// E-Mail Header
$headers = "From: $from\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// E-Mail senden
if (mail($to, $subject, $email_body, $headers)) {
    echo json_encode(['success' => true, 'message' => 'E-Mail erfolgreich gesendet']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Fehler beim Senden der E-Mail']);
}
?>