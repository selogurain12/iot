#include <Arduino.h>

const int ROWS 4
const int COLS 4

char keys[ROWS][COLS] = {
    {'1','2','3','A'},
    {'4','5','6','B'},
    {'7','8','9','C'},
    {'*','0','#','D'}
    };

int colPins[COLS] = {14, 27, 26, 25};
int rowPins[ROWS] = {33, 32, 21, 13};

int currentrow = 0;
volatile int lastPressedCol = -1;
bool isPressed = false;
volatile unsigned long lastInterruptTime = 0;
volatile unsigned long lastDetectionTime = 0;
volatile unsigned long lastDisplayTime = 0;
const unsigned long debounceDelay = 100;
const unsigned long releaseDelay = 160;
const unsigned long displayInterval = 3000;

void IRAM_ATTR debounce(int col) {
    unsigned long currentTime = millis();
    if (currentTime - lastInterruptTime > debounceDelay) {
      lastPressedCol = col;
      lastInterruptTime = currentTime;
    }
}

void IRAM_ATTR handleInterruptCol0() { debounce(0);}
void IRAM_ATTR handleInterruptCol1() { debounce(1);}
void IRAM_ATTR handleInterruptCol2() { debounce(2);}
void IRAM_ATTR handleInterruptCol3() { debounce(3); }

void init_keypad(){
    Serial.println("Initialisation du clavier");
    for (int row = 0; row < ROWS; row++) {
      pinMode(rowPins[row], OUTPUT);
      digitalWrite(rowPins[row], LOW);
    }
    for (int col = 0; col < COLS; col++) {
      pinMode(colPins[col], INPUT_PULLDOWN);
    }
  
    attachInterrupt(digitalPinToInterrupt(colPins[0]), handleInterruptCol0, RISING);
    attachInterrupt(digitalPinToInterrupt(colPins[1]), handleInterruptCol1, RISING);
    attachInterrupt(digitalPinToInterrupt(colPins[2]), handleInterruptCol2, RISING);
    attachInterrupt(digitalPinToInterrupt(colPins[3]), handleInterruptCol3, RISING);
}

void setup() {
    Serial.begin(115200);
    init_keypad();
  }

  void loop() {
    digitalWrite(rowPins[currentrow], LOW);
    if (lastPressedCol != -1) {
      char pressedKey = keys[currentrow][lastPressedCol];
      lastPressedCol = -1;
      unsigned long currentTime = millis();
      if (currentTime - lastDetectionTime > releaseDelay){
        lastDetectionTime = currentTime;
        Serial.printf("Touche appuyée : %c\n", pressedKey);
      }
    }
    currentrow++;
    if (currentrow >= ROWS) {
        currentrow = 0;
      isPressed = false;
    }
    digitalWrite(rowPins[currentrow], HIGH);
  }