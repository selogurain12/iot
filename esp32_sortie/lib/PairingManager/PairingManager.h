#ifndef PAIRING_MH
#define PAIRING_H

#include <Preferences.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include "WiFiManager.h"
#include "MqttManager.h"
#include "ConfigManager.h"

void initPairing();
void startAccesspoint();

#endif