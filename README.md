# Meeting Room Booking Management System

A full-stack room booking and management platform developed using FastAPI, MongoDB, Firebase Authentication, and Azure Blob Storage. The application enables users to manage meeting rooms, schedule bookings, monitor occupancy, and handle reservations through a responsive and user-friendly web interface.

---

## Project Overview

This project was developed to streamline meeting room scheduling and reservation management within an organisation. The system provides secure authentication, real-time booking validation, occupancy monitoring, and calendar-based scheduling to ensure efficient room utilisation and conflict-free reservations.

The application follows a modern full-stack architecture with RESTful API integration, cloud-based image storage, and dynamic frontend interactions.

---

## Key Features

### Authentication & User Management

* Secure user authentication using Firebase Authentication
* Login and registration functionality
* User-specific booking management

### Room Management

* Create, update, and delete meeting rooms
* Upload and manage room images
* View room details and booking schedules
* Track room occupancy percentages

### Booking System

* Real-time booking validation
* Conflict detection for overlapping reservations
* Edit and delete booking functionality
* Calendar-based room scheduling
* Earliest available slot detection

### Cloud Integration

* Azure Blob Storage integration for room image uploads
* MongoDB database integration for persistent data storage

### Frontend Functionality

* Responsive user interface using HTML, CSS, and JavaScript
* Dynamic room and booking updates
* Booking filters and user-specific views

---

## Technologies Used

### Backend

* Python
* FastAPI
* MongoDB
* PyMongo

### Frontend

* HTML
* CSS
* JavaScript
* Jinja2 Templates

### Cloud & Authentication

* Firebase Authentication
* Azure Blob Storage (Azurite)

---

## System Architecture

```bash
Frontend (HTML/CSS/JavaScript)
        ↓
FastAPI Backend
        ↓
MongoDB Database
        ↓
Azure Blob Storage
```

---

## Core Functionalities

### Room Management APIs

* Add and remove rooms
* Retrieve room details
* Occupancy calculation
* Room calendar generation
* Earliest free slot detection

### Booking Management APIs

* Create bookings
* Update reservations
* Delete bookings
* Booking conflict validation
* User booking history management

### Image Storage APIs

* Upload room images
* Delete room images
* Azure Blob Storage integration

---

## Installation & Setup

### Clone Repository

```bash
git clone https://github.com/Tittuerothu/RoomBooking3195210.git
```

### Navigate to Project Directory

```bash
cd RoomBooking3195210
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Application

```bash
uvicorn main:app --reload
```

---

## Future Enhancements

* Email notifications for bookings
* Admin dashboard and analytics
* Mobile-responsive UI improvements
* Advanced reporting features
* Multi-organisation support

---

## Repository Structure

```bash
RoomBooking3195210/
│
├── main.py
├── static/
├── templates/
├── README.md
└── requirements.txt
```

---

## Author

**Tittu Erothu**
MSc Computing Science
Griffith College Dublin

GitHub: https://github.com/Tittuerothu
