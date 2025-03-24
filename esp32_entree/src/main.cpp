#include <Arduino.h>
#include <WebServer.h>


#include "PairingManager.h"
#include "WiFiManager.h"
#include "ConfigManager.h"
#include "MqttManager.h"
#include "RfidManager.h"
#include "AuthManager.h"

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
    aes_init();
    connect_wifi(wifi_ssid.c_str(), wifi_password.c_str());
    connect_mqtt(mqtt_server.c_str(), mqtt_port.c_str(), mqtt_user.c_str(), mqtt_password.c_str());
    init_rfid();
    pairing = false;
  }
  Serial.println("Loop :");
}

void loop() {
  if (pairing){
    server.handleClient();
  } else{
    is_wifi_connected(wifi_ssid.c_str(), wifi_password.c_str());
    check_mqtt(mqtt_server.c_str(), mqtt_port.c_str(), mqtt_user.c_str(), mqtt_password.c_str());
    if (scanRfidCard()){
      test();
      // Serial.println("RFID Card Detected");
      // String first_name = read_rfid(1);
      // Serial.println("First Name : " + first_name);
      // String uid = read_rfid(0);
      // Serial.println("UID : " + uid);
      // if (authenticateUser(uid, first_name)){
      //   Serial.println("User Authenticated");
      // } else {
      //   Serial.println("User Not Authenticated");
      // }
    }
  }

  Serial.print(".");
  delay(1000);
}
