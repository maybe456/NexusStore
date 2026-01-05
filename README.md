# Nexus Store

A modern e-commerce web application built with React, Vite, Firebase, and Google Gemini AI. Features include user authentication, product browsing, shopping cart, admin dashboard, and an AI-powered chatbot.

## 🌟 Features

- 🛍️ Product browsing and search
- 🛒 Shopping cart functionality
- 🔐 User authentication (login/register)
- 👤 User dashboard
- 👨‍💼 Admin panel for product management
- 🤖 AI-powered chatbot using Google Gemini
- 📊 Analytics dashboard for admins
- 🎨 Modern UI with Tailwind CSS and Framer Motion

## 📋 Prerequisites

**You only need Node.js installed!**

- **Node.js** (version 18 or higher)
  - Download from: https://nodejs.org/
  - To check if you have it: Open Terminal/Command Prompt and type `node --version`

## 🚀 Quick Start (4 Easy Steps!)

### Step 1: Clone the Repository

Open Terminal (Mac/Linux) or Command Prompt (Windows) and run:

```bash
git clone <your-repository-url>
cd nexus-store
```

### Step 2: Add the .env File

**Ask the project owner for the `.env` file** (they'll send it to you privately via email/message).

Once you receive it:
1. Copy the `.env` file
2. Paste it in the `nexus-store` folder (the main project folder)
3. Make sure it's named exactly `.env` (starts with a dot)

### Step 3: Install Dependencies

```bash
npm install
```

This downloads all necessary packages. Takes 1-3 minutes.

### Step 4: Start the App

```bash
npm run dev
```

Open your browser and go to: **http://localhost:5173/**

**That's it! 🎉** The app is ready to use with a shared backend!

## 📝 Using the Application

### Regular Users
- **Register/Login**: Create an account or sign in
- **Browse Products**: Explore the shop and product categories
- **Shopping Cart**: Add items and checkout
- **AI Chatbot**: Click the chat icon for product recommendations

### Admin Features

To access admin features, you need an admin account:

### Admin Features

To access admin features, you need an admin account:

1. Register a regular account in the app
2. Contact the project owner to upgrade your account to admin
3. Once upgraded, you'll see the Admin Dashboard with analytics and product management

## 🛠️ Troubleshooting

**"npm: command not found"**
- Install Node.js from https://nodejs.org/

**"Port 5173 is already in use"**
- Close other apps or the server will use a different port

**Blank page or errors**
- Make sure you ran `npm install` first
- Try: `rm -rf node_modules && npm install`
- Restart the dev server

## ⚠️ Important Notes

- This app uses a **shared Firebase backend** - everyone uses the same database
- The `.env` file contains sensitive credentials - **don't share it publicly** or commit it to GitHub
- Be respectful: Don't delete other users' data
- The chatbot uses a shared API key with usage limits
- For production use, set up your own Firebase project following standard setup guides

## 📂 Project Structure

```
nexus-store/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React components
│   ├── context/         # React Context providers (Auth, Cart)
│   ├── lib/             # Configuration files (Firebase, Gemini)
│   ├── pages/           # Page components
│   ├── assets/          # Images and other assets
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── .env                 # Environment variables (get from project owner)
└── package.json         # Dependencies and scripts
```

---

**Happy coding! 🚀**
