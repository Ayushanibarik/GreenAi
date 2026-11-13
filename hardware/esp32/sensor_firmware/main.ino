/**
 * GreenCompute AI — ESP32 + INA219 Power Telemetry Firmware
 * =========================================================
 * Reads real-time voltage and current from Adafruit INA219 high-side
 * current sensor breakout over I2C, computes instantaneous electrical power
 * P = V * I and discrete cumulative energy E = sum(P * dt) / 3600, then
 * POSTs structured JSON telemetry to the GreenCompute AI backend endpoint
 * (/api/hardware/telemetry) every 1.0 second.
 *
 * Hardware Pinout (ESP32 DevKit V1):
 *   - 3V3   -> INA219 VCC (3.3V Logic)
 *   - GND   -> INA219 GND (System Common Ground)
 *   - GPIO21 -> INA219 SDA (I2C Data)
 *   - GPIO22 -> INA219 SCL (I2C Clock)
 *   - VIN+  -> 5V DC Source (+5V USB VBUS)
 *   - VIN-  -> 5V Device Under Test (Edge Accelerator / DUT)
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_INA219.h>

// ── Configuration ────────────────────────────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* BACKEND_URL   = "http://192.168.1.100:8000/api/hardware/telemetry";
const char* DEVICE_ID     = "esp32_ina219_node1";

const unsigned long SAMPLE_INTERVAL_MS = 1000;  // 1.0 second sample rate

// ── Global Hardware Instances & State ────────────────────────────────────────
Adafruit_INA219 ina219;

float cumulativeEnergy_Wh = 0.0;
unsigned long lastSampleTimeMs = 0;
unsigned long sampleCounter = 0;

void setup() {
  Serial.begin(115200);
  delay(200);

  Serial.println("\n========================================================");
  Serial.println(" GreenCompute AI — ESP32 + INA219 Telemetry Transmitter");
  Serial.println("========================================================");

  // Initialize I2C bus on GPIO 21 (SDA) and GPIO 22 (SCL)
  Wire.begin(21, 22);

  if (!ina219.begin()) {
    Serial.println("[ERROR] Failed to find INA219 sensor on I2C bus (0x40)!");
    Serial.println("[ERROR] Check wiring: SDA->GPIO21, SCL->GPIO22, VCC->3V3, GND->GND.");
    while (true) {
      delay(2000);
      Serial.println("[ERROR] Halting: INA219 unavailable.");
    }
  }

  // Calibrate INA219 for 32V, 2A range (default) or 32V, 1A
  ina219.setCalibration_32V_2A();
  Serial.println("[OK] INA219 sensor initialized (32V, 2A range).");

  // Connect to Local Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.printf("[WIFI] Connecting to '%s'", WIFI_SSID);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 30) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WIFI] Connected! Assigned IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WIFI] Connection timeout. Sensor will accumulate offline and retry.");
  }

  lastSampleTimeMs = millis();
}

void loop() {
  unsigned long now = millis();
  if (now - lastSampleTimeMs < SAMPLE_INTERVAL_MS) {
    return;
  }

  float elapsedSeconds = (now - lastSampleTimeMs) / 1000.0f;
  lastSampleTimeMs = now;
  sampleCounter++;

  // Read high-side shunt and bus voltage
  float shuntVoltage_mV = ina219.getShuntVoltage_mV();
  float busVoltage_V    = ina219.getBusVoltage_V();
  float loadVoltage_V   = busVoltage_V + (shuntVoltage_mV / 1000.0f);
  float current_mA      = ina219.getCurrent_mA();

  // Guard against reverse leakage or negative ADC offset
  if (current_mA < 0.0f) {
    current_mA = 0.0f;
  }

  // Calculate electrical power: P = V * I (Watts)
  float power_W = loadVoltage_V * (current_mA / 1000.0f);

  // Cumulative energy accumulation: E += P * dt / 3600 (Watt-hours)
  cumulativeEnergy_Wh += (power_W * elapsedSeconds) / 3600.0f;

  // Build JSON telemetry packet adhering to GreenCompute AI schema
  char payload[512];
  snprintf(
    payload,
    sizeof(payload),
    "{"
      "\"device_id\":\"%s\","
      "\"voltage_v\":%.3f,"
      "\"current_ma\":%.2f,"
      "\"power_w\":%.4f,"
      "\"energy_wh\":%.6f,"
      "\"shunt_voltage_mv\":%.3f,"
      "\"power_mw\":%.2f,"
      "\"energy_mwh\":%.3f,"
      "\"voltage\":%.3f,"
      "\"current\":%.2f,"
      "\"power\":%.4f,"
      "\"energy\":%.6f,"
      "\"timestamp_ms\":%lu,"
      "\"sample_index\":%lu"
    "}",
    DEVICE_ID,
    loadVoltage_V,
    current_mA,
    power_W,
    cumulativeEnergy_Wh,
    shuntVoltage_mV,
    power_W * 1000.0f,
    cumulativeEnergy_Wh * 1000.0f,
    loadVoltage_V,
    current_mA,
    power_W,
    cumulativeEnergy_Wh,
    now,
    sampleCounter
  );

  // Stream packet to Serial monitor
  Serial.printf("[SENSOR #%lu] V=%.3fV | I=%.1fmA | P=%.3fW | E=%.4fWh\n",
                sampleCounter, loadVoltage_V, current_mA, power_W, cumulativeEnergy_Wh);

  // Transmit telemetry to GreenCompute AI backend over HTTP POST
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(BACKEND_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("User-Agent", "ESP32-INA219-PhysicalNode/1.0");
    http.setTimeout(2000);

    int httpCode = http.POST(payload);
    if (httpCode > 0) {
      Serial.printf("[HTTP] POST %s -> Response %d\n", BACKEND_URL, httpCode);
    } else {
      Serial.printf("[HTTP] Ingest failed: %s (will retry next tick)\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  } else {
    Serial.println("[WIFI] Offline. Telemetry accumulated locally in memory.");
    // Attempt non-blocking reconnection
    WiFi.reconnect();
  }
}
