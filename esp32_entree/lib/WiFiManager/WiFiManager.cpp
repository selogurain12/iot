#include "WiFiManager.h"

bool connect_wifi(const char *ssid, const char *password){
  Serial.print("\nConnecting to WiFi : ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  int i = 0;
  while (WiFi.status() != WL_CONNECTED && i < 10)
  {
    delay(1000);
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
  Serial.println(get_local_ip());
  return true;  
}

void disconnect_wifi(){
  WiFi.disconnect();
}

bool is_wifi_connected(const char *ssid, const char *password) {
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

String get_local_ip(){
  if (WiFi.status() != WL_CONNECTED){
    return "";
  }
  return WiFi.localIP().toString();
}