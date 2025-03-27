#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <WiFi.h>

bool connectWifi(const char *ssid, const char *password);
bool checkWifi(const char *ssid, const char *password);

#endif