#include "ServoManager.h"

static const int servoPin = 13;

Servo servo1;

void initServo() {
  servo1.attach(servoPin, 0, 4000);
}

void openServo()
{
    servo1.write(180);
}

void resetServo()
{
    servo1.write(0);
}