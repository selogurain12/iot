# IoT Project

## Overview

This project is focused on developing an IoT system that allows users to securely control their door locks using a web application and ESP32 microcontrollers with RFID readers and numeric keypads along with a MQTT broker.

## Setup and Installation

To set up the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/selogurain12/iot.git
   ```
2. Navigate to the project directory:
   ```bash
   cd iot
   ```
3. Run Docker Compose to start the application:
   ```bash
   docker-compose up
   ```
4. Open your browser and go to `http://localhost:3000` to view the api endpoints.

5. Open your browser and go to `http://localhost:8080` to view the frontend.

## Technologies Used

- React/Typescript for the frontend
- Node.js/Express for the backend
- Docker for containerization
- PostgreSQL for the database
- Mosquitto for MQTT broker
- PlatformIO for embedded systems

## Project Structure

The project is structured as follows:

- `projet_web_front/` contains the frontend code.
- `projet_back/` contains the backend code.
- `docker-compose.yml` contains the Docker Compose configuration.
- `docker/` contains the persistent data for the database and the conf file for the MQTT broker.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.
