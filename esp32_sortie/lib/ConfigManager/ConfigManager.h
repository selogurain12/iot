#ifndef CONFIG_MANAGER_H
#define CONFIG_MANAGER_H

#define MAX_RESET_COUNT 3

#include <Preferences.h>


bool loadConfig();
void resetConfig();
void resetManager();
void saveConfig(String _wifiSsid, String _wifiPassword, String _mqttServer, String _mqttPort, String _mqttUser, String _mqttPassword);

#endif