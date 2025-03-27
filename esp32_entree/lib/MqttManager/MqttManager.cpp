#include "MqttManager.h"

extern char hostname[25];
extern char existingCardMqtt[38];
extern char displayTopicMqtt[35];
enum enumMachineState
{
    waitingRfid,
    waitingCode,
};
extern enum enumMachineState machineState;
extern char keys[5];

WiFiClient client;
PubSubClient mqtt(client);

bool connectMqtt(const char *mqttServer, const char *mqttPort, const char *mqttUser, const char *mqttPassword)
{
    Serial.print("Connecting to MQTT : ");
    Serial.print(mqttServer);
    Serial.print(":");
    Serial.println(mqttPort);

    mqtt.setServer(mqttServer, atoi(mqttPort));
    mqtt.setCallback(callbackMqtt);
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

bool checkMqtt(const char *mqttServer, const char *mqttPort, const char *mqttUser, const char *mqttPassword)
{
    if (!mqtt.connected())
    {
        Serial.println("\nMQTT deconnected");
        mqtt.disconnect();
        delay(1000);
        if (connectMqtt(mqttServer, mqttPort, mqttUser, mqttPassword))
        {
            Serial.println("MQTT reconnected");
            return true;
        }
        else
        {
            Serial.println("MQTT reconnection failed");
            return false;
        }
    }
    else
    {
        mqtt.loop();
    }
    return true;
}

void publishMqtt(const char *topic, const char *message)
{
    mqtt.publish(topic, message);
}

void subscribeMqtt(const char *topic)
{
    mqtt.subscribe(topic);
}

void callbackMqtt(char *topic, byte *payload, unsigned int length)
{
    if (strcmp(topic, existingCardMqtt) == 0)
    {
        char payloadChar[length + 1];
        for (int i = 0; i < length; i++)
        {
            payloadChar[i] = (char)payload[i];
        }
        payloadChar[length] = '\0';

        if (strcmp(payloadChar, "1") == 0)
        {
            Serial.println("Existing card detected");
            machineState = enumMachineState::waitingCode;
            publishMqtt(displayTopicMqtt, "Please enter the code");
            return;
        }
        else if (strcmp(payloadChar, "2") == 0)
        {
            Serial.println("Unauthorized card detected");
            publishMqtt(displayTopicMqtt, "Unauthorized card detected");
            machineState = enumMachineState::waitingRfid;
            memset(keys, 0, sizeof(keys));
        }
        else if (strcmp(payloadChar, "3") == 0)
        {
            Serial.println("Desactivated card detected");
            publishMqtt(displayTopicMqtt, "Desactivated card detected");
        }
        else
        {
            Serial.println("Unknown card detected");
            publishMqtt(displayTopicMqtt, "Unknown card detected");
        }
        machineState = enumMachineState::waitingRfid;
        memset(keys, 0, sizeof(keys));
    }
}