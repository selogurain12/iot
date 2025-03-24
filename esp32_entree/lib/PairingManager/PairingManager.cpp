
#include "PairingManager.h"

extern WebServer server;

const char* PAIRING_NAME = "ESP32E_Config";
const char* PAIRING_PASSWORD = "$yRTceLd7R$y39Bo";
const IPAddress PAIRING_IPADDRESS(192, 168, 4, 1);

void start_accesspoint(){
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(PAIRING_IPADDRESS, PAIRING_IPADDRESS, IPAddress(255, 255, 255, 0));
  WiFi.softAP(PAIRING_NAME, PAIRING_PASSWORD);
  Serial.println("Access Point started");
  Serial.print("IP Address: ");
  Serial.println(WiFi.softAPIP());
}

void init_pairing()
{
  start_accesspoint();

  server.on("/",HTTP_GET,[](){
    Serial.println("Root page");
    server.send(200, "text/html", "<h1>ESP32 Config</h1><p><a href='/scan'>Scan WiFi</a></p>");
  });

  server.on("/scan",HTTP_GET, [](){
    Serial.println();
    Serial.println("GET /scan");
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
    Serial.println("Scan completed");
  });

  server.on("/connect", HTTP_POST, [](){
    Serial.println();
    Serial.println("POST /connect");
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
    String _wifi_ssid = doc["wifi_ssid"];
    String _wifi_password = doc["wifi_password"];
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

    if (!connect_wifi(_wifi_ssid.c_str(), _wifi_password.c_str()))
    {
      server.send(400, "text/plain", "Wifi connection failed");
      start_accesspoint();
      return;
    }

    if (!connect_mqtt(_mqtt_server.c_str(), _mqtt_port.c_str(), _mqtt_user.c_str(), _mqtt_password.c_str()))
    {
      server.send(400, "text/plain", "MQTT connection failed");
      return;
    }

    save_config(_wifi_ssid, _wifi_password, _mqtt_server, _mqtt_port, _mqtt_user, _mqtt_password, _mqtt_topic);
    server.send(200, "text/plain", "Configuration saved, rebooting");
    delay(1000);
    ESP.restart();
    
  });

  server.begin();
  Serial.println("Pairing mode started");
}
