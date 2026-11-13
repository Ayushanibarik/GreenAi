/**
 * GreenCompute AI — ESP32 INA219 Power Sensor Firmware
 *
 * Reads voltage and current from an INA219 sensor over I2C,
 * computes instantaneous power and cumulative energy, then
 * POSTs a JSON payload to the backend API every 1 second.
 *
 * Hardware: ESP32 DevKit + Adafruit INA219 breakout
 * Wiring:  SDA -> GPIO 21, SCL -> GPIO 22 (ESP32 defaults)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_INA219.h>

// ── Configuration ───────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* BACKEND_URL   = "http://192.168.1.100:8000/api/v1/sensors/readings";

const unsigned long SAMPLE_INTERVAL_MS = 1000;  // 1 second

// ── Globals ─────────────────────────────────────────────
Adafruit_INA219 ina219;

float cumulativeEnergy_mWh = 0.0;
unsigned long lastSampleTime = 0;

// ── Setup ───────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(100);

  // Initialize I2C and INA219
  Wire.begin();
  if (!ina219.begin()) {
    Serial.println("[ERROR] INA219 not found. Check wiring.");
    while (true) { delay(1000); }
  }
  Serial.println("[OK] INA219 initialized.");

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[WIFI] Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\n[WIFI] Connected — IP: %s\n", WiFi.localIP().toString().c_str());

  lastSampleTime = millis();
}

// ── Loop ────────────────────────────────────────────────
void loop() {
  unsigned long now = millis();
  if (now - lastSampleTime < SAMPLE_INTERVAL_MS) {
    return;
  }

  float elapsed_s = (now - lastSampleTime) / 1000.0;
  lastSampleTime = now;

  // Read sensor
  float voltage_V   = ina219.getBusVoltage_V() + (ina219.getShuntVoltage_mV() / 1000.0);
  float current_mA  = ina219.getCurrent_mA();
  float power_mW    = voltage_V * current_mA;  // P = V × I

  // Accumulate energy: E += P × Δt / 3600  (mW × s → mWh)
  cumulativeEnergy_mWh += (power_mW * elapsed_s) / 3600.0;

  // Build JSON payload
  String payload = String("{") +
    "\"voltage_V\":"    + String(voltage_V, 4)            + "," +
    "\"current_mA\":"   + String(current_mA, 4)           + "," +
    "\"power_mW\":"     + String(power_mW, 4)             + "," +
    "\"energy_mWh\":"   + String(cumulativeEnergy_mWh, 4) + "," +
    "\"timestamp_ms\":" + String(now)                     +
  "}";

  Serial.println(payload);

  // POST to backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(BACKEND_URL);
    http.addHeader("Content-Type", "application/json");

    int code = http.POST(payload);
    if (code > 0) {
      Serial.printf("[HTTP] POST → %d\n", code);
    } else {
      Serial.printf("[HTTP] POST failed: %s\n", http.errorToString(code).c_str());
    }
    http.end();
  } else {
    Serial.println("[WIFI] Disconnected — skipping POST.");
  }
}
