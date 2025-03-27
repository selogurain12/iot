#include <Arduino.h>

const int ROWS = 4;
const int COLS = 4;

char keysValues[ROWS][COLS] = {
    {'1', '2', '3', 'A'},
    {'4', '5', '6', 'B'},
    {'7', '8', '9', 'C'},
    {'*', '0', '#', 'D'}};

int colPins[COLS] = {14, 27, 26, 25};
int rowPins[ROWS] = {33, 32, 21, 3};

int currentRow = 0;
volatile int lastPressedCol = -1;
volatile unsigned long lastInterruptTime = 0;
unsigned long lastDetectionTime = 0;
unsigned long lastDisplayTime = 0;
const unsigned long debounceDelay = 100;
const unsigned long releaseDelay = 100;

void IRAM_ATTR debounce(int col)
{
  unsigned long currentTime = millis();
  if (currentTime - lastInterruptTime > debounceDelay)
  {
    lastPressedCol = col;
    lastInterruptTime = currentTime;
  }
}

void IRAM_ATTR handleInterruptCol0() { debounce(0); }
void IRAM_ATTR handleInterruptCol1() { debounce(1); }
void IRAM_ATTR handleInterruptCol2() { debounce(2); }
void IRAM_ATTR handleInterruptCol3() { debounce(3); }

void initKeypad()
{

  for (int row = 0; row < ROWS; row++)
  {
    pinMode(rowPins[row], OUTPUT);
    digitalWrite(rowPins[row], LOW);
  }
  for (int col = 0; col < COLS; col++)
  {
    pinMode(colPins[col], INPUT_PULLDOWN);
  }

  attachInterrupt(digitalPinToInterrupt(colPins[0]), handleInterruptCol0, RISING);
  attachInterrupt(digitalPinToInterrupt(colPins[1]), handleInterruptCol1, RISING);
  attachInterrupt(digitalPinToInterrupt(colPins[2]), handleInterruptCol2, RISING);
  attachInterrupt(digitalPinToInterrupt(colPins[3]), handleInterruptCol3, RISING);

  Serial.println("Keypad initialized");
}

void resetKeypad()
{
  lastPressedCol = -1;
}

void scanKeypad(char *key)
{
  digitalWrite(rowPins[currentRow], LOW);
  if (lastPressedCol != -1)
  {
    char tmppressedKey = keysValues[currentRow][lastPressedCol];
    resetKeypad();
    unsigned long currentTime = millis();
    if (currentTime - lastDetectionTime > releaseDelay)
    {
      lastDetectionTime = currentTime;
      Serial.printf("Touche appuyée : %c\n", tmppressedKey);
      *key = tmppressedKey;
    }
  }
  currentRow++;
  if (currentRow >= ROWS)
  {
    currentRow = 0;
  }
  digitalWrite(rowPins[currentRow], HIGH);
}