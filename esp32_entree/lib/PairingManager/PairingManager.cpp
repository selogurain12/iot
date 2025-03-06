
#include "PairingManager.h"

extern WebServer server;
extern Preferences prefs;

void init_pairing()
{
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(PAIRING_IPADDRESS, IPAddress(192, 168, 1, 1), IPAddress(255, 255, 255, 0));
  WiFi.softAP(PAIRING_NAME, PAIRING_PASSWORD);

  Serial.print("IP Address: ");
  Serial.println(WiFi.softAPIP());

  server.on("/",HTTP_GET,[](){
    Serial.println("Root page");
    server.send(200, "text/html", "<h1>ESP32 Config</h1><p><a href='/scan'>Scan WiFi</a></p>");
  });

  server.on("/scan",HTTP_GET, [](){
    int n = WiFi.scanNetworks();
    JsonDocument doc;
    JsonArray networks = doc["networks"].to<JsonArray>();
    for (int i = 0; i < n; i++)
    {
      JsonObject network = networks.add<JsonObject>();
      network["ssid"] = WiFi.SSID(i);
    }

    String response;
    serializeJson(doc, response);

    server.send(200, "application/json", response);
  });

  server.on("/connect", HTTP_POST, [](){
    if (server.hasArg("plain") == false) {
      server.send(400, "text/plain", "Body not received");
      return;
    }
    String body = server.arg("plain");
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, body);
    if (error) {
      server.send(400, "text/plain", "Invalid JSON");
      return;
    }
    String _wifi_ssid = doc["ssid"];
    String _wifi_password = doc["password"];
    String _mqtt_server = doc["mqtt_server"];
    String _mqtt_port = doc["mqtt_port"];
    String _mqtt_user = doc["mqtt_user"];
    String _mqtt_password = doc["mqtt_password"];
    String _mqtt_topic = doc["mqtt_topic"];

    Serial.print("Wifi SSID: ");
    Serial.println(_wifi_ssid);
    Serial.print("Wifi Password: ");
    Serial.println(_wifi_password);
    Serial.print("MQTT Server: ");
    Serial.println(_mqtt_server);
    Serial.print("MQTT Port: ");
    Serial.println(_mqtt_port);
    Serial.print("MQTT User: ");
    Serial.println(_mqtt_user);
    Serial.print("MQTT Password: ");
    Serial.println(_mqtt_password);
    Serial.print("MQTT Topic: ");
    Serial.println(_mqtt_topic);

    Serial.println("Testing WiFi connection");
    WiFi.begin(_wifi_ssid.c_str(), _wifi_password.c_str());
    int i = 0;
    while (WiFi.status() != WL_CONNECTED && i < 20)
    {
      delay(500);
      Serial.print(".");
      i++;
    }
    if (WiFi.status() != WL_CONNECTED)
    {
      server.send(400, "text/plain", "Connection failed");
      return;
    }


    Serial.println("Testing MQTT connection");
    WiFiClient client;
    PubSubClient mqtt(client);
    mqtt.setServer(_mqtt_server.c_str(), _mqtt_port.toInt());

    if (!mqtt.connect("ESP32"))
    {
      server.send(400, "text/plain", "MQTT connection failed");
      return;
    }

    prefs.begin("wifi-config", false);
    prefs.putString("wifi_ssid", _wifi_ssid);
    prefs.putString("wifi_password", _wifi_password);
    prefs.putString("mqtt_server", _mqtt_server);
    prefs.putString("mqtt_port", _mqtt_port);
    prefs.putString("mqtt_user", _mqtt_user);
    prefs.putString("mqtt_password", _mqtt_password);
    prefs.putString("mqtt_topic", _mqtt_topic);
    prefs.end();
    server.send(200, "text/plain", "Configuration saved, rebooting");
    delay(500);
    ESP.restart();

  });

  server.begin();
  Serial.println("Pairing mode started");
}
