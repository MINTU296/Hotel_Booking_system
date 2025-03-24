# Hotel Booking System (Airbnb Clone)

A full-stack hotel booking system modeled as an Airbnb clone. This project is divided into a client (front-end) and an API (back-end) and is configured for deployment on Vercel.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview
This project is a clone of Airbnb’s hotel booking platform. It allows users to browse available hotels, view details, and make bookings. The project demonstrates a modern full-stack application built using JavaScript and deployed with Vercel.

## Features
- **User Authentication:** Secure login and registration system.
- **Hotel Listings:** Browse and search for available hotels.
- **Booking System:** Make and manage hotel reservations.
- **Responsive Design:** Optimized for both desktop and mobile devices.
- **Serverless API:** Utilizes serverless functions for backend operations.
- **Real-time Updates:** Instant booking confirmations and availability status.

## Tech Stack
- **Front-End:** JavaScript, React (or your chosen framework)
- **Back-End:** Node.js, Express (or serverless functions)
- **Deployment:** Vercel
- **Styling:** CSS / Tailwind CSS (adjust as needed)
- **Database:** (To be configured – MongoDB, Firebase, etc.)

## Project Structure
```
Hotel_Booking_system/
└── airbnb-clone/
    │   README.md
    │   vercel.json
    │
    ├── api/         # API endpoints and serverless functions
    │
    └── client/      # Front-end application
```

## Installation
1. **Clone the repository:**
    ```bash
    git clone https://github.com/MINTU296/Hotel_Booking_system.git
    ```
2. **Navigate to the project directory:**
    ```bash
    cd Hotel_Booking_system/airbnb-clone
    ```
3. **Install client dependencies:**
    ```bash
    cd client
    npm install
    ```
4. **Install API dependencies (if required):**
    ```bash
    cd ../api
    npm install
    ```

## Running the Project
1. **Start the client:**
    ```bash
    cd client
    npm start
    ```
2. **Start the API (if running locally):**
    ```bash
    cd ../api
    npm start
    ```
3. **Open your browser and visit:**
    ```bash
    http://localhost:3000
    ```

## Deployment
This project is configured for deployment on Vercel. The `vercel.json` file defines the settings for both the client and API. Push your changes to GitHub and Vercel will automatically deploy your updates.
