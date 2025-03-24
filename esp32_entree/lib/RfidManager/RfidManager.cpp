#include "RfidManager.h"

MFRC522 mfrc522(SS_PIN, RST_PIN);   // Create MFRC522 instance
String uid = "";

void init_rfid()
{
  SPI.begin();                  // Init SPI bus
  mfrc522.PCD_Init();           // Init MFRC522 card
  Serial.println("RFID Initialized");    //shows in serial that it is ready to read
}

// String read_rfid(byte block){
//     byte buffer[18];
//     byte len = sizeof(buffer);
//     MFRC522::MIFARE_Key key;
//     MFRC522::StatusCode status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, 4, &key, &(mfrc522.uid));
//     if (status != MFRC522::STATUS_OK) {
//         Serial.print(F("Authentication failed: "));
//         Serial.println(mfrc522.GetStatusCodeName(status));
//         return "";
//     }
//     status = mfrc522.MIFARE_Read(block, buffer, &len);
//     if (status != MFRC522::STATUS_OK) {
//         Serial.print(F("Reading failed: "));
//         Serial.println(mfrc522.GetStatusCodeName(status));
//         return "";
//     }
//     String first_name = "";
//     for (int i = 0; i < 16; i++)
//     {
//         if (buffer[i] != 32)
//         {
//             first_name += (char)buffer[i];
//         }
//     }
//     if (first_name == "")
//     {
//         first_name = "Unknown";
//     }
//     return first_name;
// }

bool scanRfidCard(){
    MFRC522::MIFARE_Key key;
    for (byte i = 0; i < 6; i++) key.keyByte[i] = 0xFF;
    
    if ( ! mfrc522.PICC_IsNewCardPresent()) {
        uid = "";
        return false;
    }

    if ( ! mfrc522.PICC_ReadCardSerial()) {
        return false;
    }


    Serial.println("\nCard Detected");
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        uid += String(mfrc522.uid.uidByte[i], HEX);
    }
    Serial.print("Card UID: ");
    Serial.println(uid);
    mfrc522.PICC_DumpDetailsToSerial(&(mfrc522.uid)); //dump some details about the card
    // Serial.println(read_rfid(4));
    // Serial.println(read_rfid(1));

    // String test = "Lionel";
    // test.toCharArray((char *)buffer1, 16);
    // block = 1;
    // status = mfrc522.MIFARE_Write(block, buffer1, 16);
    // if (status != MFRC522::STATUS_OK) {
    // Serial.print(F("Échec de l'écriture: "));
    // Serial.println(mfrc522.GetStatusCodeName(status));
    // return;
    // }
    // Serial.print("First Name: ");
    // Serial.println(first_name);
    // Serial.print("Last Name: ");
    // Serial.println(last_name);
    Serial.println("Card Readed");

    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
    return true;
}