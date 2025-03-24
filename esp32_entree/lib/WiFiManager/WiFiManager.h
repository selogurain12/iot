#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <WiFi.h>

bool connect_wifi(const char *ssid, const char *password);
void disconnect_wifi();
bool is_wifi_connected(const char *ssid, const char *password);
String get_local_ip();

#endif