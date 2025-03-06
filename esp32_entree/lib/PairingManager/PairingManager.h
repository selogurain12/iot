#ifndef PAIRING_MH
#define PAIRING_H

#define PAIRING_NAME "ESP32E_Config"
#define PAIRING_PASSWORD "$yRTceLd7R$y39Bo"
#define PAIRING_IPADDRESS IPAddress(192, 168, 4, 1)

#include <Preferences.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include "WiFiManager.h"
#include "MqttManager.h"
#include "ConfigManager.h"

void init_pairing();
void start_accesspoint();

#endif