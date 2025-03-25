#ifndef CONFIG_MANAGER_H
#define CONFIG_MANAGER_H

#define MAX_RESET_COUNT 5

#include <Preferences.h>

bool loadConfig();
void resetConfig();
void resetManager();
void saveConfig(String _wifi_ssid, String _wifi_password, String _mqtt_server, String _mqtt_port, String _mqtt_user, String _mqtt_password);

#endif