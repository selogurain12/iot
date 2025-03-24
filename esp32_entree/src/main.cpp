#include <Arduino.h>
#include <WebServer.h>


#include "PairingManager.h"
#include "WiFiManager.h"
#include "ConfigManager.h"
#include "MqttManager.h"
#include "RfidManager.h"

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
      String pin = "1234";
      // create a topic with the mac address

      // publish();
      // if (authenticateUser(uid, pin)){
      //   Serial.println("User Authenticated");
      // } else {
      //   Serial.println("User Not Authenticated");
      // }
      // sendEncryptedData(uid, test);
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
