
#include "ConfigManager.h"

Preferences prefs;
extern String wifiSsid;
extern String wifiPassword;
extern String mqttServer;
extern String mqttPort;
extern String mqttUser;
extern String mqttPassword;
extern String mqttTopic;

bool loadConfig()
{
  Serial.println("Loading configuration");
  prefs.begin("config", false);
  String _wifiSsid = prefs.getString("wifiSsid", "");
  String _wifiPassword = prefs.getString("wifiPassword", "");
  String _mqttServer = prefs.getString("mqttServer", "");
  String _mqttPort = prefs.getString("mqttPort", "");
  String _mqttUser = prefs.getString("mqttUser", "");
  String _mqttPassword = prefs.getString("mqttPassword", "");
  prefs.end();

  if (_wifiSsid != "" && _wifiPassword != "" && _mqttServer != "" && _mqttPort != "" && _mqttUser != "" && _mqttPassword != "")
  {
    wifiSsid = _wifiSsid;
    wifiPassword = _wifiPassword;
    mqttServer = _mqttServer;
    mqttPort = _mqttPort;
    mqttUser = _mqttUser;
    mqttPassword = _mqttPassword;
    Serial.println("Configuration loaded");
    return true;
  }
  Serial.println("No configuration found");
  return false;
}

void saveConfig(String _wifiSsid, String _wifiPassword, String _mqttServer, String _mqttPort, String _mqttUser, String _mqttPassword)
{
  prefs.begin("config", false);
  prefs.putString("wifiSsid", _wifiSsid);
  prefs.putString("wifiPassword", _wifiPassword);
  prefs.putString("mqttServer", _mqttServer);
  prefs.putString("mqttPort", _mqttPort);
  prefs.putString("mqttUser", _mqttUser);
  prefs.putString("mqttPassword", _mqttPassword);
  prefs.end();
}

void resetConfig()
{
  prefs.begin("config", false);
  prefs.clear();
  prefs.end();
}

void resetManager()
{
  prefs.begin("reset", false);
  int resetCount = 0;
  prefs.putInt("resetCount", resetCount);
  resetCount++;
  Serial.print("Reset count: ");
  Serial.println(resetCount);

  prefs.putInt("resetCount", resetCount);
  prefs.end();

  if (resetCount >= MAX_RESET_COUNT)
  {
    Serial.println("Resetting configuration");
    resetConfig();
    prefs.begin("reset", false);
    prefs.clear();
    prefs.end();
  }

  delay(1000);
  prefs.begin("reset", false);
  prefs.putInt("resetCount", 0);
  prefs.end();
};