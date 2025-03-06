#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <WiFi.h>

bool connect_wifi(const char *ssid, const char *password);
bool check_wifi(const char *ssid, const char *password);

#endif