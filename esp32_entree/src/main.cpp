#include <Arduino.h>
#include <WebServer.h>


#include "PairingManager.h"
#include "WiFiManager.h"
#include "ConfigManager.h"
#include "MqttManager.h"

#define MACHINE_NAME "ESP32E"



String wifi_ssid;
String wifi_password;
String mqtt_server;
String mqtt_port;
String mqtt_user;
String mqtt_password;
String mqtt_topic;

WebServer server(80);
bool pairing = false;






void setup() {
  Serial.begin(115200);
  reset_manager();

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

