# 🚀 Smart TaskHub - AI-Powered Productivity & Task Management System

![MERN Stack](https://img.shields.io/badge/MERN-Full--Stack-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📖 Overview
Smart TaskHub is an advanced task management solution that leverages AI algorithms to optimize productivity and enable real-time team collaboration. Built with the MERN stack, it provides intelligent task prioritization, drag-and-drop functionality, and seamless real-time updates.

## 🎯 Key Features
- 🤖 **AI-Powered Task Prioritization** - Automatic priority scoring based on multiple factors
- 🔄 **Real-time Collaboration** - Live updates with Socket.io
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🎨 **Intuitive Drag & Drop** - Kanban-style task management
- 🔐 **Secure Authentication** - JWT-based security
- ⚡ **High Performance** - <200ms API response time

## 🛠 Tech Stack
**Frontend:** React, Redux, Tailwind CSS, Socket.io Client  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Socket.io  
**AI Features:** Custom priority algorithm, Real-time analytics

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Installation
```bash
# Clone repository
git clone https://github.com/lokeshjavvadi/Smart-taskhub-React.git
cd Smart-taskhub-React

# Backend Setup
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run dev

# Frontend Setup (new terminal)
cd frontend  
npm install
cp .env.example .env  # Configure API URL
npm start
