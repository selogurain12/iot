
#include "PairingManager.h"

extern WebServer server;
extern char hostname[25];
const char* PAIRING_PASSWORD = "$yRTceLd7R$y39Bo";
const IPAddress PAIRING_IPADDRESS(192, 168, 4, 1);

void startAccesspoint(){
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(PAIRING_IPADDRESS, PAIRING_IPADDRESS, IPAddress(255, 255, 255, 0));
  WiFi.softAP(hostname, PAIRING_PASSWORD);
  Serial.println("Access Point started with hostName: " + String(hostname));
  Serial.print("IP Address: ");
  Serial.println(WiFi.softAPIP());
}

void initPairing()
{
  startAccesspoint();

  server.on("/", HTTP_GET, [](){
    Serial.println("Root page");
    server.send(200, "text/html", "<h1>ESP32 Config</h1><p><a href='/scan'>Scan WiFi</a></p>");
  });

  server.on("/scan", HTTP_GET, [](){
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
    String _wifiSsid = doc["wifiSsid"];
    String _wifiPassword = doc["wifiPassword"];
    String _mqttServer = doc["mqttServer"];
    String _mqttPort = doc["mqttPort"];
    String _mqttUser = doc["mqttUser"];
    String _mqttPassword = doc["mqttPassword"];

    Serial.print("Wifi SSID: ");
    Serial.println(_wifiSsid);
    Serial.print("Wifi Password: ");
    Serial.println(_wifiPassword);
    Serial.print("MQTT Server: ");
    Serial.println(_mqttServer);
    Serial.print("MQTT Port: ");
    Serial.println(_mqttPort);
    Serial.print("MQTT User: ");
    Serial.println(_mqttUser);
    Serial.print("MQTT Password: ");
    Serial.println(_mqttPassword);

    if (!connectWifi(_wifiSsid.c_str(), _wifiPassword.c_str()))
    {
      server.send(400, "text/plain", "Wifi connection failed");
      startAccesspoint();
      return;
    }

    if (!connectMqtt(_mqttServer.c_str(), _mqttPort.c_str(), _mqttUser.c_str(), _mqttPassword.c_str()))
    {
      server.send(400, "text/plain", "MQTT connection failed");
      return;
    }

    saveConfig(_wifiSsid, _wifiPassword, _mqttServer, _mqttPort, _mqttUser, _mqttPassword);
    publishMqtt("arrivals",hostname);
    server.send(200, "text/plain", "Configuration saved, rebooting");
    delay(1000);
    ESP.restart();
    
  });

  server.begin();
  Serial.println("Pairing mode started");
}
