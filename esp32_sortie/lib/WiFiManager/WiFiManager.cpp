#include "WiFiManager.h"

bool connect_wifi(const char *ssid, const char *password){
  Serial.print("\nConnecting to WiFi : ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  int i = 0;
  while (WiFi.status() != WL_CONNECTED && i < 10)
  {
    delay(500);
    Serial.print(".");
    i++;
  }
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("\nWiFi connection failed");
    return false;
  }
  Serial.println("\nWiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  return true;  
}

bool check_wifi(const char *ssid, const char *password) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi deconnected");
    if (connect_wifi(ssid, password)){
      Serial.println("WiFi reconnected");
      return true;
    } else {
      Serial.println("WiFi reconnection failed");
      return false;
    }
  }
  return true;
}