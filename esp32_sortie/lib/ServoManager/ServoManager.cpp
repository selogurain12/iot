#include "ServoManager.h"

static const int servoPin = 13;

Servo servo1;

void init_servo() {
  servo1.attach(servoPin, 0, 4000);
}

void turn()
{
    servo1.write(180);
}

void reset_servo()
{
    servo1.write(0);
}