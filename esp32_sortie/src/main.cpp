#include <Arduino.h>
#include <WebServer.h>


#include "PairingManager.h"
#include "WiFiManager.h"
#include "ConfigManager.h"
#include "MqttManager.h"
#include "ScreenManager.h"
#include "ServoManager.h"
#define MACHINE_NAME "ESP32O"



String wifi_ssid;
String wifi_password;
String mqtt_server;
String mqtt_port;
String mqtt_user;
String mqtt_password;
String mqtt_topic;
char hostname[25];

WebServer server(80);
bool pairing = false;

void generateHostname() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  // Generate a hostname based on the MAC address
  char macStr[13];
  snprintf(macStr, sizeof(macStr), "%02X%02X%02X%02X%02X%02X", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  snprintf(hostname, sizeof(hostname), "ESP32_%s_%s",DEVICE_TYPE, macStr);
}


void setup() {
  Serial.begin(115200);
  generateHostname();
  init_screen();
  reset_manager();
  init_servo();
  reset_servo();
  
  if (!load_config())
  {
    init_pairing();
    pairing = true;
  }
  else
  {
    connect_wifi(wifi_ssid.c_str(), wifi_password.c_str());
    connect_mqtt(mqtt_server.c_str(), mqtt_port.c_str(), mqtt_user.c_str(), mqtt_password.c_str());
    pairing = false;
    subscribe(mqtt_topic.c_str());
  }
  Serial.println("Loop :");
}

void loop() {
  if (pairing){
    server.handleClient();
  } else{
    check_wifi(wifi_ssid.c_str(), wifi_password.c_str());
    check_mqtt(mqtt_server.c_str(), mqtt_port.c_str(), mqtt_user.c_str(), mqtt_password.c_str());
  }
  Serial.print(".");
  delay(1000);
}

