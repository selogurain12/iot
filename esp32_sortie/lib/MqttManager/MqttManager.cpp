#include "MqttManager.h"

WiFiClient client;
PubSubClient mqtt(client);

bool connect_mqtt(const char *mqtt_server, const char *mqtt_port, const char *mqtt_user, const char *mqtt_password)
{
    Serial.print("Connecting to MQTT : ");
    Serial.print(mqtt_server);
    Serial.print(":");
    Serial.println(mqtt_port);

    mqtt.setServer(mqtt_server, atoi(mqtt_port));
    int j = 0;
    while (!mqtt.connect("ESP32E", mqtt_user, mqtt_password) && j < 10)
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

bool check_mqtt(const char *mqtt_server, const char *mqtt_port, const char *mqtt_user, const char *mqtt_password) {
    if (!mqtt.connected()) {
        Serial.println("\nMQTT deconnected");

        if (connect_mqtt(mqtt_server, mqtt_port, mqtt_user, mqtt_password)) {
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