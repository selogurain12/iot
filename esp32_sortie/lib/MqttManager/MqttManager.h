#ifndef MQTT_MANAGER_H
#define MQTT_MANAGER_H

#include <WiFi.h>
#include <PubSubClient.h>

bool connect_mqtt(const char *mqtt_server, const char *mqtt_port, const char *mqtt_user, const char *mqtt_password);
bool check_mqtt(const char *mqtt_server, const char *mqtt_port, const char *mqtt_user, const char *mqtt_password);

#endif