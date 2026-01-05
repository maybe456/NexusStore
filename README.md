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

Before starting, you need **Node.js** installed on your computer.

### Installing Node.js

**Check if you already have it:**
1. Open Terminal (Mac/Linux) or Command Prompt (Windows)
2. Type: `node --version`
3. If you see a version number (like `v18.x.x` or higher), you're good! Skip to Quick Start.
4. If you see "command not found" or an error, follow the steps below:

**Install Node.js:**

**For Windows:**
1. Go to https://nodejs.org/
2. Click the big green button that says "Download Node.js (LTS)"
3. Run the downloaded installer
4. Click "Next" through all the steps (keep default settings)
5. Restart your computer
6. Open Command Prompt and type `node --version` to verify

**For Mac:**
1. Go to https://nodejs.org/
2. Click the big green button that says "Download Node.js (LTS)"
3. Open the downloaded `.pkg` file
4. Click "Continue" through all the steps
5. Restart Terminal
6. Type `node --version` to verify

**For Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

## 🚀 Complete Setup Guide

### Step 1: Clone the Repository

Open Terminal (Mac/Linux) or Command Prompt (Windows) and run:

```bash
git clone https://github.com/maybe456/NexusStore.git
cd NexusStore
```

**Note:** If you get "git: command not found", install Git from https://git-scm.com/ first, then try again.

### Step 2: Add the .env File

### Step 3: Install Dependencies

In your Terminal/Command Prompt (make sure you're in the `NexusStore` folder):

```bash
npm install
```

### Step 4: Start the Application

In the same Terminal/Command Prompt window:

```bash
npm run dev
```

**What you should see:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Keep this terminal window open!** The server needs to stay running.

### Step 5: Open in Browser

1. Open your web browser (Chrome, Firefox, Safari, etc.)
2. Go to: **http://localhost:5173/**
3. You should see the Nexus Store homepage! 🎉

**To stop the server later:** Go back to the Terminal and press `Ctrl+C`

## 📝 Using the Application

### Regular Users
- **Register/Login**: Create an account or sign in
- **Browse Products**: Explore the shop and product categories
- **Shopping Cart**: Add items and checkout
- **AI Chatbot**: Click the chat icon for product recommendations

### Admin Features

To access admin features, you need an admin account:

1. Register a regular account in the app
2. Contact the project owner to upgrade your account to admin
3. Once upgraded, you'll see the Admin Dashboard with analytics and product management.


```
NexusStore/
├── public/              # Static assets (images, icons)
├── src/
│   ├── components/      # Reusable React components
│   │   ├── AdminRoute.jsx
│   │   ├── Chatbot.jsx
│   │   ├── Navbar.jsx
│   │   └── PrivateRoute.jsx
│   ├── context/         # React Context providers
│   │   ├── AuthContext.jsx    # User authentication
│   │   └── CartContext.jsx    # Shopping cart
│   ├── lib/             # Configuration files
│   │   ├── firebase.js        # Firebase setup
│   │   ├── gemini.js          # AI chatbot setup
│   │   └── categories.js      # Product categories
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── Cart.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Admin.jsx
│   │   └── ProductDetails.jsx
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── .env                 # Environment variables (GET FROM PROJECT OWNER!)
├── .gitignore           # Files Git should ignore
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── README.md            # This file!
```

---

**Happy coding! 🚀**
