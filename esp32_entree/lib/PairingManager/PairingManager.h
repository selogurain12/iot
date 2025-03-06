#ifndef PAIRING_MH
#define PAIRING_H

#define PAIRING_NAME "ESP32E_Config"
#define PAIRING_PASSWORD "$yRTceLd7R$y39Bo"
#define PAIRING_IPADDRESS IPAddress(192, 168, 1, 1)

#include <Preferences.h>
#include <WiFi.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <WebServer.h>
#include <ArduinoJson.h>

void init_pairing();

#endif