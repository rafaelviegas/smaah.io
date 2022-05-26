#include <Arduino.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include "SPIFFS.h"
#include "DHT.h"
#include <Wire.h>
#include "RTClib.h"
#include <WiFi.h>
#include <PubSubClient.h>
#include <HTTPClient.h>

//DHT11
#define DHTPIN 4
#define DHTTYPE DHT11

//RTC_DS3231
RTC_DS3231 rtc; 

// MQTT 
const char *mqtt_broker = "";
const char *topic_measurements = "measurements";
const char *topic_commands= "commands";
const char *mqtt_username = "";
const char *mqtt_password = "";
const int mqtt_port = 1883;
#define MSG_BUFFER_SIZE (500)
char msg[MSG_BUFFER_SIZE];
long lastMsg = 0;

//WIFI
WiFiClient espClient;
PubSubClient client(espClient);
int value = 0;


// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
int soilMoisture = 0;
const int sensorPin = 34;
//String redeSSID = "";
int intensidadeSinal = -9999;

// Search for parameter in HTTP POST request
const char* PARAM_INPUT_1 = "ssid";
const char* PARAM_INPUT_2 = "pass";
const char* PARAM_INPUT_3 = "ip";
const char* PARAM_INPUT_4 = "gateway";

//Variables to save values from HTML form
String ssid;
String pass;
String ip;
String gateway;

// File paths to save input values permanently
const char* ssidPath = "/ssid.txt";
const char* passPath = "/pass.txt";
const char* ipPath = "/ip.txt";
const char* gatewayPath = "/gateway.txt";

//IPAddress localIP(192, 168, 1, 200);
IPAddress localIP; 

// Set your Gateway IP address
IPAddress localGateway; 

IPAddress subnet(255, 255, 0, 0);

// Timer variables
unsigned long previousMillis = 0;
const long interval = 10000;  // interval to wait for Wi-Fi connection (milliseconds)

// Set LED GPIO
const int ledPin = 2;

// Set RELE GPIO
const int relePin = 27;

// Stores LED state
String ledState = "OFF";

// Initialize SPIFFS
void initSPIFFS() {
  if (!SPIFFS.begin(true)) {
    Serial.println("An error has occurred while mounting SPIFFS");
  }
  Serial.println("SPIFFS mounted successfully");
}

// Read File from SPIFFS
String readFile(fs::FS &fs, const char * path){
  
  Serial.printf("Reading file: %s\r\n", path);

  File file = fs.open(path);
  
  if(!file || file.isDirectory()){
    Serial.println("- failed to open file for reading");
    return String();
  }
  
  String fileContent;
  
  while(file.available()){
    fileContent = file.readStringUntil('\n');
    break;     
  }
  return fileContent;
}

// Write file to SPIFFS
void writeFile(fs::FS &fs, const char * path, const char * message){
  Serial.printf("Writing file: %s\r\n", path);

  File file = fs.open(path, FILE_WRITE);
  if(!file){
    Serial.println("- failed to open file for writing");
    return;
  }
  if(file.print(message)){
    Serial.println("- file written");
  } else {
    Serial.println("- frite failed");
  }
}

// Initialize WiFi
bool initWiFi() {
  if(ssid=="" || ip==""){
    Serial.println("Undefined SSID or IP address.");
    return false;
  }

  //WiFi.mode(WIFI_STA);
  //localIP.fromString(ip.c_str());
  //localGateway.fromString(gateway.c_str());


  //if (!WiFi.config(localIP, localGateway, subnet)){
  //  Serial.println("STA Failed to configure");
  //  return false;
 // }
  
  WiFi.begin(ssid.c_str(), pass.c_str());
  Serial.println("Trying to connect WiFi...");

  unsigned long currentMillis = millis();
  previousMillis = currentMillis;

  while(WiFi.status() != WL_CONNECTED) {
    currentMillis = millis();
    if (currentMillis - previousMillis >= interval) {
      Serial.println("Failed to connect.");
      return false;
    }
  }

  Serial.println("WiFi Connected.");

  return true;
}

// Replaces placeholder with LED state value
String processor(const String& var) {
  if(var == "STATE") {
    if(digitalRead(ledPin)) {
      ledState = "ON";
    }
    else {
      ledState = "OFF";
    }
    return ledState;
  }
  return String();
}

DHT dht(DHTPIN, DHTTYPE);


void setup() {  
  
   // Instrução para inicializar o Serial, utilizaremos apenas para log no monitor.
  Serial.begin(115200);
  
  initSPIFFS();
  
 pinMode(sensorPin, INPUT);
 pinMode(relePin, OUTPUT);
 pinMode(ledPin, OUTPUT);
 
 digitalWrite(relePin, HIGH); 

  dht.begin();
  
// Load values saved in SPIFFS
  ssid = readFile(SPIFFS, ssidPath);
  pass = readFile(SPIFFS, passPath);
  ip = readFile(SPIFFS, ipPath);
  gateway = readFile (SPIFFS, gatewayPath);
  Serial.println(ssid);
  Serial.println(pass);
  Serial.println(ip);
  Serial.println(gateway);

 if(!initWiFi()){
    // Connect to Wi-Fi network with SSID and password
    Serial.println("Setting AP (Access Point)");
    // NULL sets an open Access Point
    WiFi.softAP("Smaah.io", NULL);

    IPAddress IP = WiFi.softAPIP();
    Serial.print("AP IP address: ");
    Serial.println(IP); 

    // Web Server Root URL
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
      request->send(SPIFFS, "/wifi-manager.html", "text/html");
    });
    
    server.serveStatic("/", SPIFFS, "/");
    
    server.on("/", HTTP_POST, [](AsyncWebServerRequest *request) {
      int params = request->params();
      for(int i=0;i<params;i++){
        AsyncWebParameter* p = request->getParam(i);
        if(p->isPost()){
          // HTTP POST ssid value
          if (p->name() == PARAM_INPUT_1) {
            ssid = p->value().c_str();
            Serial.print("SSID set to: ");
            Serial.println(ssid);
            // Write file to save value
            writeFile(SPIFFS, ssidPath, ssid.c_str());
          }
          // HTTP POST pass value
          if (p->name() == PARAM_INPUT_2) {
            pass = p->value().c_str();
            Serial.print("Password set to: ");
            Serial.println(pass);
            // Write file to save value
            writeFile(SPIFFS, passPath, pass.c_str());
          }
          // HTTP POST ip value
          if (p->name() == PARAM_INPUT_3) {
            ip = p->value().c_str();
            Serial.print("IP Address set to: ");
            Serial.println(ip);
            // Write file to save value
            writeFile(SPIFFS, ipPath, ip.c_str());
          }
          // HTTP POST gateway value
          if (p->name() == PARAM_INPUT_4) {
            gateway = p->value().c_str();
            Serial.print("Gateway set to: ");
            Serial.println(gateway);
            // Write file to save value
            writeFile(SPIFFS, gatewayPath, gateway.c_str());
          }
          //Serial.printf("POST[%s]: %s\n", p->name().c_str(), p->value().c_str());
        }
      }
      request->send(200, "text/plain", "Done. ESP will restart, connect to your router and go to IP address: " + ip);
      delay(3000);
      ESP.restart();
    });

    server.begin();
  }

//inicio data e hora 
  if (! rtc.begin()) {                         //Se o RTC nao for inicializado, faz
    Serial.println("RTC NAO INICIALIZADO");    //Imprime o texto
    while (1);                                 //Trava o programa
  }
  //rtc.adjust(DateTime(2022, 4, 23, 02, 14, 00));//Ajusta o tempo do RTC para a data e hora definida pelo usuario.
//fim data e hora

  client.setServer(mqtt_broker, mqtt_port);
  client.setCallback(callback);

}

  void callback(char *topic, byte *payload, unsigned int length) {
      Serial.print("Message arrived in topic: ");
      Serial.println(topic);
      Serial.print("Message:");
      String command;
      for (int i = 0; i < length; i++) {
          Serial.print((char) payload[i]);
          command += (char)payload[i];
      }
      Serial.println();
      if(command == "turnOnWater"){
        digitalWrite(relePin, LOW); 
        DateTime agora = rtc.now();     
        Serial.printf("A bomba d'água foi ligada às %02d:%02d",agora.hour(), agora.minute());
      }
      if(command == "turnOffWater"){
        digitalWrite(relePin, HIGH); 
        DateTime agora = rtc.now();     
        Serial.printf("A bomba d'água foi desligada às %02d:%02d",agora.hour(), agora.minute());
      }
      Serial.println();
      Serial.println("-----------------------");
  }
  
  void reconnect() {
    
    while (!client.connected()) {
        String client_id = "smaah.io-";
        client_id += String(WiFi.macAddress());
        Serial.println();
        Serial.printf("The client %s connects to the public mqtt broker\n", client_id.c_str());
        if (client.connect(client_id.c_str(), mqtt_username, mqtt_password)) {
            Serial.println("MQTT broker connected");
            client.subscribe(topic_commands);
        } else {
            Serial.print("failed with state ");
            Serial.print(client.state());
            delay(5000);
        }
        Serial.println();
    }
    
    
  }


void loop() {

  if(WiFi.status() != WL_CONNECTED){

    //Liga led vermelho
    ledState = "OFF";
    digitalWrite(ledPin, LOW);  
     
    
    initWiFi();
    
  }else{
    
    //Desliga led vermelho
      ledState = "ON";
      digitalWrite(ledPin, HIGH);  
    
    soilMoisture = abs(analogRead(sensorPin));

   //Serial.print("Umidade do solo: ");
   //Serial.print(soilMoisture);
   //Serial.println("\n------------------------------------------------------------------------------------\n");
   
   
  }

  // Reading temperature or humidity takes about 250 milliseconds!
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();
  // Read temperature as Fahrenheit (isFahrenheit = true)
  
  float f = dht.readTemperature(true);
  // deixa um intervalo de 10 segundos para fazer um novo escaneamento

 // Compute heat index in Fahrenheit (the default)
  float hif = dht.computeHeatIndex(f, h);
  
  // Compute heat index in Celsius (isFahreheit = false)
  float hic = dht.computeHeatIndex(t, h, false);


  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t) || isnan(f)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }
  
 // Serial.print(F("Umidade: "));
 // Serial.print(h);
  
 // Serial.print(F("%  Temperatura: "));
 // Serial.print(t);
 //  Serial.print(F("°C "));

//inicio data e hora
  DateTime agora = rtc.now();                             // Faz a leitura de dados de data e hora
//fim data e hora

//inicio MQTT

  if (!client.connected()) {
    reconnect();
  }
  
  client.loop();


  // Publishing data via MQTT

  long now = millis();
  if (now - lastMsg > 60000) {

    //Verifica se API está de pé
      Serial.println();
      Serial.print("Status do servidor: ");
      HTTPClient http;
      String serverPath = "";
      http.begin(serverPath.c_str());
      
      // Send HTTP GET request
      int httpResponseCode = http.GET();
      
      if (httpResponseCode>0) {
        Serial.println(httpResponseCode);
        String payload = http.getString();
        Serial.println(payload);
      }
      else {
        Serial.print("Error code: ");
        Serial.println(httpResponseCode);
      }
      // Free resources
      http.end();

    //Fim da verificação da API
    
  char created_on[30];
  String client_id = "smaah.io-" + String(WiFi.macAddress());
  sprintf(created_on, "%02d-%02d-%02dT%02d:%02d:%02d.000+03:00", agora.year(),agora.month(),agora.day(),agora.hour(), agora.minute(),agora.second()); 

  snprintf (msg, MSG_BUFFER_SIZE, "{'client_id':'%s','temperature':%f,'humidity':%f,'soilMoisture':%d,'created_on':'%s'}",client_id.c_str(), t, h, soilMoisture, created_on);


  client.publish(topic_measurements, msg);
   lastMsg = now;
  }
//fim MQTT
  delay(2000);
}
