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


void initScreen()
{
  // initialize LCD
  lcd.init();
  // turn on LCD backlight
  lcd.backlight();
}

void showScreen(String texte)
{
  lcd.clear();
  int espace = texte.indexOf(' '); // Trouve le premier espace

  if (texte.length() <= 16)
  {
    // Si le texte tient sur une ligne, affiche directement
    lcd.setCursor(0, 0);
    lcd.print(texte);
  }
  else if (espace == -1 || espace >= 16)
  {
    // Si pas d'espace ou si le premier mot est trop long
    lcd.setCursor(0, 0);
    lcd.print(texte.substring(0, 16)); // Coupe au 16e caractère
    lcd.setCursor(0, 1);
    lcd.print(texte.substring(16)); // Reste du texte
  }
  else
  {
    // Sinon répartir sur deux lignes
    lcd.setCursor(0, 0);
    lcd.print(texte.substring(0, espace)); // Affiche le premier mot sur la première ligne
    lcd.setCursor(0, 1);
    lcd.print(texte.substring(espace + 1)); // Le reste sur la deuxième ligne
  }
}

void clearScreen(){
  lcd.clear();
}

void loopScreen(String texte){
  int tailleTexte = texte.length();

  if (tailleTexte <= 32) {
    lcd.setCursor(0, 0);
    lcd.print(texte.substring(0, 16)); // Affiche la première partie
    lcd.setCursor(0, 1);
    lcd.print(texte.substring(16, 32)); // Affiche la deuxième partie
  } else {
    for (int i = 0; i < tailleTexte - 15; i++) {
      //lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print(texte.substring(i, i + 16)); // Fait défiler une ligne
      delay(300); // Ajuster la vitesse de défilement (en millisecondes)
    }
  }
}