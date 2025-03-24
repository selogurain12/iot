#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "ScreenManager.h"
// set the LCD number of columns and rows
int lcdColumns = 20;
int lcdRows = 4;

// set LCD address, number of columns and rows
// if you don't know your display address, run an I2C scanner sketch
LiquidCrystal_I2C lcd(0x27, lcdColumns, lcdRows);


void init_screen()
{
  // initialize LCD
  lcd.init();
  // turn on LCD backlight
  lcd.backlight();
}

void show_screen(String texte)
{
    lcd.clear();
  // set cursor to first column, first row
  lcd.setCursor(0, 1);
  // print static message
  lcd.print(texte);
  // print scrolling message
}