#include "AuthManager.h"

const String SERVER_URL = "https://monserveur.com/auth";  // 🔥 Remplace par ton URL

#define SECRET_KEY "1234567890123456"  // Clé AES-128 (16 caractères)
AESLib aesLib;

// String encryptAES(String plainText) {
//     byte iv[16] = {0};  // Initialisation du vecteur IV (16 bytes à 0)
//     char encrypted[64];
//     aesLib.encrypt64(plainText.c_str(),plainText.length(), encrypted, SECRET_KEY, iv);
//     return String(encrypted);
// }

// bool authenticateUser(const String &uid, const String &pin) {
//     if (uid.isEmpty() || pin.isEmpty()) {
//         Serial.println("[Auth] Erreur: UID ou PIN vide !");
//         return false;
//     }

//     if (WiFi.status() != WL_CONNECTED) {
//         Serial.println("[Auth] Erreur: Pas de connexion Wi-Fi !");
//         return false;
//     }

//     HTTPClient http;
//     http.begin(SERVER_URL);
//     http.addHeader("Content-Type", "application/json");

//     String encryptedData = encryptAES(uid + ":" + pin);
//     String payload = "{\"data\": \"" + encryptedData + "\"}";

//     Serial.println("[Auth] Envoi de la requête: " + payload);
    
//     int httpResponseCode = http.POST(payload);

//     if (httpResponseCode == 200) {
//         Serial.println("[Auth] Authentification réussie !");
//         http.end();
//         return true;
//     } 
//     Serial.print("[Auth] Échec de l'authentification. Code HTTP: ");
//     Serial.println(httpResponseCode);
//     http.end();
//     return false;

// }

// AES Encryption Key
byte aes_key[] = { 0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30 };

// General initialization vector (use your own)
byte aes_iv[16] = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };

// Generate IV (once)
void aes_init() {
  aesLib.gen_iv(aes_iv);
  aesLib.set_paddingmode((paddingMode)0);
}

char message[200] = {0};

String encode(String msg) {

  char output[256] = {0};
  char input[256] = {0};
  sprintf(input, msg.c_str());

  int inputLen = strlen(input);
  int enlen = base64_encode(output, input, msg.length());

  sprintf(message, output);
  return String(output);
}

String decode() {
    char decoded[200];
    int b64len = base64_decode(decoded, message, strlen(message));
    return String(decoded);
}

String encrypt(char * msg, byte iv[]) {
    int msgLen = strlen(msg);
    char encrypted[2 * msgLen];
    aesLib.encrypt64((byte*)msg, msgLen, encrypted, aes_key, sizeof(aes_key), iv);
    return String(encrypted);
}

String decrypt(char * msg, byte iv[]) {
    int msgLen = strlen(msg);
    char decrypted[msgLen]; // half may be enough
    aesLib.decrypt64(msg, msgLen, (byte*)decrypted, aes_key, sizeof(aes_key), iv);
    return String(decrypted);
}



char cleartext[256];
char ciphertext[512];

void test() {

    sprintf(cleartext, "Benjamin");
    Serial.println("ENCRYPTION (char*)");
    byte enc_iv[16] = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }; // iv_block gets written to, reqires always fresh copy.
    String encrypted = encrypt(cleartext, enc_iv);
    sprintf(ciphertext, "%s", encrypted.c_str());

    Serial.print("Encrypted Result: ");
    Serial.println(encrypted);
    Serial.println();

    Serial.println("DECRYPTION (char*)");
    Serial.println(ciphertext);
    byte dec_iv[16] = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }; // iv_block gets written to, reqires always fresh copy.
    String decrypted = decrypt(ciphertext, dec_iv);

    Serial.print("Decrypted Result: ");
    Serial.println(decrypted);

    String plain = String(cleartext);

    // decryped may contain mess if not properly padded
    if (decrypted.indexOf(plain) == -1) {
        Serial.println("Decryption FAILED!");
        Serial.print("At:");
        Serial.println(plain.indexOf(decrypted));
        delay(5000);
    } else {
        if (plain.length() == strlen(cleartext)) {
            Serial.println("Decryption successful.");
        } else {
            Serial.print("Decryption length incorrect. Plain: ");
            Serial.print(plain.length());
            Serial.print(" dec: ");
            Serial.println(decrypted.length());
        }
    }

    delay(500);
}