# ☁️ CloudPocket

CloudPocket is a secure, personal document management system designed to help users organize, store, and share critical documents with family members. Built with a focus on simplicity and security, it allows users to maintain a digital "pocket" of their most important files.

## ✨ Features

-   **� Email OTP Verification**: Secure signup with email verification via EmailJS (free tier: 200 emails/month).
-   **🔐 Smart Login Flow**: Phone + Email combination for account identification with strict validation.
-   **�📁 Categorized Storage**: Organize documents into 13+ categories (Identity, Education, Medical, Financial, etc.).
-   **👨‍👩‍👧‍👦 Family Linking**: Securely link family members using Phone + Email + Password verification.
-   **👁️ Read-Only Sharing**: Linked members can view and download documents, but cannot edit or delete.
-   **� Secure Unlinking**: Easily manage and remove linked access with password verification.
-   **🖼️ Rich Document Previews**: Built-in viewer for images and PDFs.
-   **� Mobile Camera Upload**: Direct camera capture for document uploads on mobile devices.
-   **📱 Responsive Design**: Optimized for mobile, tablet, and desktop with smooth UI transitions.

## 🛠️ Tech Stack

-   **Frontend**: React (Vite)
-   **Backend/Database**: Firebase Firestore
-   **Authentication**: Custom Firebase-backed authentication with session management.
-   **Email Service**: EmailJS (for OTP verification)
-   **File Storage**: Cloudinary (Automatic resource detection and optimized delivery).
-   **Password Security**: SHA-256 Hashing via Web Crypto API (with fallback for HTTP dev).

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18+)
-   npm
-   Firebase account with a project set up
-   Cloudinary account
-   EmailJS account (for OTP emails)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/tensedLad/CloudPocket.git
    cd CloudPocket
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure environment variables**:
    Create a `.env` file with the following variables:
    ```env
    # Firebase Configuration
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id

    # Cloudinary Configuration
    VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
    VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

    # EmailJS Configuration (for OTP)
    VITE_EMAILJS_SERVICE_ID=your_service_id
    VITE_EMAILJS_TEMPLATE_ID=your_template_id
    VITE_EMAILJS_PUBLIC_KEY=your_public_key
    ```

4.  **Run locally**:
    ```bash
    npm run dev
    ```


## 📜 License & Copyright

**Proprietary Software - All Rights Reserved**

Copyright © 2025. This project is private and proprietary. It is not open-source. 

Permission to use, copy, modify, or distribute this software for any purpose is strictly prohibited without prior written consent from the owner. This repository is intended for showcase purposes only.

---
*Developed with ❤️ for organized digital living.*
