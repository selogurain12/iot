#ifndef AUTH_MANAGER_H
#define AUTH_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <AESLib.h>

// bool authenticateUser(const String &uid, const String &pin);
// String encryptAES(String plainText);  // (Optionnel si tu veux du chiffrement)
void aes_init();
void test();
String decrypt(char * msg, byte iv[]);
String encrypt(char * msg, byte iv[]);
String encode(String msg);
String decode();
void print_iv();


#endif