
#include "ConfigManager.h"

extern Preferences prefs;
extern String wifi_ssid;
extern String wifi_password;
extern String mqtt_server;
extern String mqtt_port;
extern String mqtt_user;
extern String mqtt_password;
extern String mqtt_topic;

bool load_config()
{
  Serial.println("Loading configuration");
  prefs.begin("config", false);
  String _wifi_ssid = prefs.getString("wifi_ssid", "");
  String _wifi_password = prefs.getString("wifi_password", "");
  String _mqtt_server = prefs.getString("mqtt_server", "");
  String _mqtt_port = prefs.getString("mqtt_port", "");
  String _mqtt_user = prefs.getString("mqtt_user", "");
  String _mqtt_password = prefs.getString("mqtt_password", "");
  String _mqtt_topic = prefs.getString("mqtt_topic", "");

  prefs.end();
  
  if (_wifi_ssid != "" && _wifi_password != "" && _mqtt_server != "" && _mqtt_port != "" && _mqtt_user != "" && _mqtt_password != "" && _mqtt_topic != "")
  {
    wifi_ssid = _wifi_ssid;
    wifi_password = _wifi_password;
    mqtt_server = _mqtt_server;
    mqtt_port = _mqtt_port;
    mqtt_user = _mqtt_user;
    mqtt_password = _mqtt_password;
    mqtt_topic = _mqtt_topic;
    Serial.println("Configuration loaded");
    return true;
  }
  else
  {
    Serial.println("No configuration found");
    return false;
  }
}


void reset_config()
{
  prefs.begin("config", false);
  prefs.clear();
  prefs.end();
}