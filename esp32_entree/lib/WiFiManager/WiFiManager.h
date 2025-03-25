#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <WiFi.h>

bool connectWifi(const char *ssid, const char *password);
void disconnectWifi();
bool isWifiConnected(const char *ssid, const char *password);
String getLocalIp();

#endif