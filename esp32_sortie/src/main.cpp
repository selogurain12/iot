#include <Arduino.h>
#include <WebServer.h>


#include "PairingManager.h"
#include "WiFiManager.h"
#include "ConfigManager.h"
#include "MqttManager.h"
#include "ScreenManager.h"
#include "ServoManager.h"
#define MACHINE_NAME "ESP32O"



String wifiSsid;
String wifiPassword;
String mqttServer;
String mqttPort;
String mqttUser;
String mqttPassword;
unsigned long previousMillisScreen;
unsigned long previousMillisServo;

const long intervalScreen = 10000;
const long intervalServo = 10000;

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
  initScreen();
  resetManager();
  initServo();
  resetServo();
  
  if (!loadConfig())
  {
    initPairing();
    pairing = true;
  }
  else
  {
    connectWifi(wifiSsid.c_str(), wifiPassword.c_str());
    connectMqtt(mqttServer.c_str(), mqttPort.c_str(), mqttUser.c_str(), mqttPassword.c_str());
    pairing = false;
    String out = "/out/";
    String topicAccess = out + hostname + "/access";
    String topicDisplay = out + hostname + "/display";

    subscribeMqtt(topicAccess.c_str());
    subscribeMqtt(topicDisplay.c_str());
  }
  Serial.println("Loop :");
}

void loop() {
  if (pairing){
    server.handleClient();
  } else{
    checkWifi(wifiSsid.c_str(), wifiPassword.c_str());
    checkMqtt(mqttServer.c_str(), mqttPort.c_str(), mqttUser.c_str(), mqttPassword.c_str());
  }
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillisScreen >= intervalScreen) {
    previousMillisScreen = currentMillis;
    clearScreen();
  }
  if (currentMillis - previousMillisServo >= intervalServo) {
    previousMillisServo = currentMillis;
    resetServo();
  }
}

