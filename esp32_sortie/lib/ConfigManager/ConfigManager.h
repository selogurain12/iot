#ifndef CONFIG_MANAGER_H
#define CONFIG_MANAGER_H

#define MAX_RESET_COUNT 3

#include <Preferences.h>


bool load_config();
void reset_config();
void reset_manager();
void save_config(String _wifi_ssid, String _wifi_password, String _mqtt_server, String _mqtt_port, String _mqtt_user, String _mqtt_password, String _mqtt_topic);

#endif