#include "RfidManager.h"

#define RFID_TIMEOUT 2000
volatile unsigned long lastRfidTime = 0;

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance
void initRfid()
{
    SPI.begin();                        // Init SPI bus
    mfrc522.PCD_Init();                 // Init MFRC522 card
    Serial.println("RFID Initialized"); // shows in serial that it is ready to read
}

void scanRfidCard(char *uid)
{
    // Serial.println("Scanning RFID card");
    MFRC522::MIFARE_Key rfidKey;
    for (byte i = 0; i < 6; i++)
        rfidKey.keyByte[i] = 0xFF;

    if (!mfrc522.PICC_IsNewCardPresent())
    {
        // Serial.println("New card not present");
        return;
    }

    if (!mfrc522.PICC_ReadCardSerial())
    {
        return;
    }
    Serial.println("Card detected");
    unsigned long currentTime = millis();
    if (currentTime - lastRfidTime < RFID_TIMEOUT)
    {
        return;
    }
    lastRfidTime = millis();
    for (byte i = 0; i < mfrc522.uid.size; i++)
    {
        sprintf(&uid[i * 2], "%02X", mfrc522.uid.uidByte[i]);
    }
    Serial.print("Card UID: ");
    Serial.println(uid);
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
    return;
}