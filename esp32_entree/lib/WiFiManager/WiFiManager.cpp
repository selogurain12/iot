#include "WiFiManager.h"

extern String wifi_ssid;
extern String wifi_password;

void init_wifi()
{
  Serial.println();
  Serial.print("Connexion au WiFi ");
  Serial.println(wifi_ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(wifi_ssid.c_str(), wifi_password.c_str());
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connecté, IP : ");
  Serial.println(WiFi.localIP());
}