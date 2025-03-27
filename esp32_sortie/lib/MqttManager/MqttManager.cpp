#include "MqttManager.h"
#include "ServoManager.h"
#include "ScreenManager.h"

extern char hostname[25];
extern char topicAccess[33];
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
    //mqtt.setCallback(callbackMqtt(topicDisplay.c_str()));

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

void callbackMqtt(char *topic,byte *payload, unsigned int length) {
    //String retour;
    char retour[length];
    for (int i = 0; i < length; i++)
    {
        retour[i] = (char)payload[i];
    }
    retour[length] = '\0';
    //String out = "/out/";
    //String topicAccess = out + hostname + "/access";
    //String topicMqtt = topic;
    /*
    if (topicMqtt == topicAccess && retour.equals("1")){
        openServo();
    }else{
        loopScreen(retour);
    }*/
    if (strcmp(topic,topicAccess)==0 && strcmp(retour,"1")== 0){
         openServo();
    }else{
        loopScreen(retour,length);
    }
}