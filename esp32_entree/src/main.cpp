#include <Arduino.h>
#include <WebServer.h>

#include "PairingManager.h"
#include "WiFiManager.h"
#include "ConfigManager.h"
#include "MqttManager.h"
#include "RfidManager.h"
#include "MatrixKeyboardManager.h"
#define RFID_TIMEOUT 10000
String wifiSsid;
String wifiPassword;
String mqttServer;
String mqttPort;
String mqttUser;
String mqttPassword;
String mqttTopic;

char hostname[25];
char accessTopicMqtt[32];
char displayTopicMqtt[33];
char cardTopicMqtt[31];
char existingCardMqtt[38];

enum enumMachineState
{
  waitingRfid,
  waitingCode,
};
enumMachineState machineState = waitingRfid;
unsigned long lastActiveTime = 0;

WebServer server(80);
bool pairing = false;
char uid[8];
char keys[5];

void generateHostname()
{
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char macStr[13];
  snprintf(macStr, sizeof(macStr), "%02X%02X%02X%02X%02X%02X", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  snprintf(hostname, sizeof(hostname), "ESP32_%s_%s", DEVICE_TYPE, macStr);
}

void setup()
{
  Serial.begin(115200);
  generateHostname();
  snprintf(accessTopicMqtt, sizeof(accessTopicMqtt), "/in/%s/access", hostname);
  snprintf(displayTopicMqtt, sizeof(displayTopicMqtt), "/in/%s/display", hostname);
  snprintf(cardTopicMqtt, sizeof(cardTopicMqtt), "/in/%s/card", hostname);
  snprintf(existingCardMqtt, sizeof(existingCardMqtt), "/in/%s/existingcard", hostname);
  resetManager();

  if (!loadConfig())
  {
    initPairing();
    pairing = true;
  }
  else
  {
    connectWifi(wifiSsid.c_str(), wifiPassword.c_str());
    connectMqtt(mqttServer.c_str(), mqttPort.c_str(), mqttUser.c_str(), mqttPassword.c_str());
    initRfid();
    initKeypad();
    subscribeMqtt(existingCardMqtt);
    pairing = false;
  }
  Serial.println("Loop :");
}

void loop()
{
  if (pairing)
  {
    server.handleClient();
  }
  else
  {
    isWifiConnected(wifiSsid.c_str(), wifiPassword.c_str());
    checkMqtt(mqttServer.c_str(), mqttPort.c_str(), mqttUser.c_str(), mqttPassword.c_str());
    // Serial.println(machineState);
    switch (machineState)
    {
    case enumMachineState::waitingRfid:
      memset(uid, 0, sizeof(uid));
      scanRfidCard(uid);
      if (strlen(uid) > 0)
      {
        publishMqtt(cardTopicMqtt, uid);
        resetKeypad();
        lastActiveTime = millis();
      }
      else
      {
        machineState = enumMachineState::waitingRfid;
        memset(keys, 0, sizeof(keys));
      }
      break;
    case enumMachineState::waitingCode:
      char key;
      key = '\0';
      scanKeypad(&key);
      switch (key)
      {
      case 'C':
        machineState = enumMachineState::waitingRfid;
        memset(uid, 0, sizeof(uid));
        memset(keys, 0, sizeof(keys));
        Serial.println("Code Cancelled");
        publishMqtt(displayTopicMqtt, "Code Cancelled");
        break;
      case 'D':
        if (strlen(keys) > 0)
        {
          keys[strlen(keys) - 1] = '\0';
          publishMqtt(displayTopicMqtt, keys);
          Serial.println("Last key Deleted");
        }
        lastActiveTime = millis();
        break;
      case '#':
        if (strlen(keys) == 4)
        {
          char code[14];
          Serial.println("Code sended");
          snprintf(code, sizeof(code), "%s:%s", uid, keys);
          publishMqtt(accessTopicMqtt, code);
          memset(keys, 0, sizeof(keys));
          machineState = enumMachineState::waitingRfid;
        }
        else
        {
          Serial.println("Code Incomplete");
          publishMqtt(displayTopicMqtt, "Code Incomplete");
        }
        lastActiveTime = millis();
        break;
      default:
        if (key != '\0')
        {
          if (strlen(keys) < 4)
          {
            keys[strlen(keys)] = key;
          }
          publishMqtt(displayTopicMqtt, keys);
          lastActiveTime = millis();
        }

        if (millis() - lastActiveTime > RFID_TIMEOUT)
        {
          machineState = enumMachineState::waitingRfid;
          memset(keys, 0, sizeof(keys));
          publishMqtt(displayTopicMqtt, "Timeout");
          Serial.println("Timeout");
        }
        break;
      }
      break;
    default:
      Serial.println(machineState);
      break;
    }
  }
  delay(100);
}