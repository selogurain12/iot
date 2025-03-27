#ifndef MQTT_MANAGER_H
#define MQTT_MANAGER_H

#include <WiFi.h>
#include <PubSubClient.h>

bool connectMqtt(const char *mqttServer, const char *mqttPort, const char *mqttUser, const char *mqttPassword);
bool checkMqtt(const char *mqttServer, const char *mqttPort, const char *mqttUser, const char *mqttPassword);
void publishMqtt(const char *topic, const char *message);
void subscribeMqtt(const char *topic);
void callbackMqtt(char *topic,byte *payload, unsigned int length);

#endif