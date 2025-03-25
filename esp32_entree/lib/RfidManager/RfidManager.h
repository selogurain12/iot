#ifndef RFID_MANAGER_H
#define RFID_MANAGER_H

#define RST_PIN 4
#define SS_PIN 5

#include <SPI.h>
#include <MFRC522.h>

void initRfid();
void scanRfidCard(char *uid);
// String read_rfid(byte block);

#endif