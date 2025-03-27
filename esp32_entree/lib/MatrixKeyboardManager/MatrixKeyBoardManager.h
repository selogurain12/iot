#ifndef MATRIX_KEYBOARD_MANAGER_H
#define MATRIX_KEYBOARD_MANAGER_H

#include <Arduino.h>

void IRAM_ATTR debounce(int col);
void IRAM_ATTR handleInterruptCol0();
void IRAM_ATTR handleInterruptCol1();
void IRAM_ATTR handleInterruptCol2();
void IRAM_ATTR handleInterruptCol3();
void initKeypad();
void resetKeypad();
void scanKeypad(char *key);

#endif