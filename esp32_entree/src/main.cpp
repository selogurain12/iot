#include <Arduino.h>
#include <WiFi.h>
#include <Preferences.h>
#include <WebServer.h>

#include "PairingManager.h"
#include "WiFiManager.h"
#include "ConfigManager.h"

#define MACHINE_NAME "ESP32E"
#define MAX_RESET_COUNT 3


String wifi_ssid;
String wifi_password;
String mqtt_server;
String mqtt_port;
String mqtt_user;
String mqtt_password;
String mqtt_topic;
WebServer server(80);
Preferences prefs;


void reconnect_mqtt();



void reset_manager(){
  prefs.begin("reset", false);
  int reset_count = prefs.getInt("reset_count", 0);
  reset_count++;
  Serial.print("Reset count: ");
  Serial.println(reset_count);

  prefs.putInt("reset_count", reset_count);
  prefs.end();

  
  if (reset_count >= MAX_RESET_COUNT)
  {
    Serial.println("Resetting configuration");
    reset_config();
    prefs.begin("reset", false);
    prefs.clear();
    prefs.end();
  }

  delay(1000);
  prefs.begin("reset", false);
  prefs.putInt("reset_count", 0);
  prefs.end();
};

void setup() {
  Serial.begin(115200);
  reset_manager();

  if (!load_config())
  {
    init_pairing();
  }
  else
  {
    init_wifi();
  }
  Serial.println("Loop :");
}

void loop() {
  server.handleClient();
  Serial.print(".");
  delay(1000);
}

