#include "RfidManager.h"

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance

void initRfid()
{
    SPI.begin();                        // Init SPI bus
    mfrc522.PCD_Init();                 // Init MFRC522 card
    Serial.println("RFID Initialized"); // shows in serial that it is ready to read
}

void scanRfidCard(char *uid)
{
    MFRC522::MIFARE_Key rfidKey;
    for (byte i = 0; i < 6; i++)
        rfidKey.keyByte[i] = 0xFF;

    if (!mfrc522.PICC_IsNewCardPresent())
    {
        return;
    }

    if (!mfrc522.PICC_ReadCardSerial())
    {
        return;
    }

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