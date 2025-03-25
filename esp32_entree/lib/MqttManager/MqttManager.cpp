#include "MqttManager.h"

extern char hostname[25];

WiFiClient client;
PubSubClient mqtt(client);


bool connectMqtt(const char *mqttServer, const char *mqttPort, const char *mqttUser, const char *mqttPassword)
{
    Serial.print("Connecting to MQTT : ");
    Serial.print(mqttServer);
    Serial.print(":");
    Serial.println(mqttPort);

    mqtt.setServer(mqttServer, atoi(mqttPort));
    int j = 0;
    while (!mqtt.connect(hostname, mqttUser, mqttPassword) && j < 10)
    {
        delay(500);
        Serial.print(".");
        j++;
    }
    if (!mqtt.connected())
    {
        Serial.println();
        Serial.println("MQTT connection failed");
        return false;
    }
    Serial.println("MQTT connected");
    return true;
}

bool checkMqtt(const char *mqttServer, const char *mqttPort, const char *mqttUser, const char *mqttPassword) {
    if (!mqtt.connected()) {
        Serial.println("\nMQTT deconnected");
        mqtt.disconnect();
        delay(1000);
        if (connectMqtt(mqttServer, mqttPort, mqttUser, mqttPassword)) {
            Serial.println("MQTT reconnected");
            return true;
        } else {
            Serial.println("MQTT reconnection failed");
            return false;
        }
    } else{
        mqtt.loop();
    }
    return true;
}

void publishMqtt(const char *topic, const char *message) {
    mqtt.publish(topic, message);
}

void subscribeMqtt(const char *topic) {
    mqtt.subscribe(topic);
}

void callbackMqtt(char *topic, byte *payload, unsigned int length) {
    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("] ");
    for (int i = 0; i < length; i++)
    {
        Serial.print((char)payload[i]);
    }
    Serial.println();
}