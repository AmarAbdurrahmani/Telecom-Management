🚀 TelekomMS - Enterprise Management System
TelekomMS is a comprehensive, enterprise-level platform designed for managing telecommunications services. Built with a modern Full-Stack architecture, the system handles subscriber management, automated billing, live payment integration, and AI-driven customer assistance.

🛠 Tech Stack
Backend (Core Engine)
Laravel 11: Powering the business logic and robust API infrastructure.

MySQL: Relational database management for 12 core CRUD modules.

Laravel Sanctum: Secure authentication using Personal Access Tokens (PAT) and HttpOnly Cookies.

SMTP Service: Real-time email notifications for contract activations and billing.

Frontend (User Experience)
React.js: Modular and reactive UI development.

Tailwind CSS: Modern "Glassmorphism" aesthetics with a fully responsive layout.

Zustand: Global state management for sessions and authentication tokens.

External Integrations
Stripe API: Live processing for Online, Card, and Bank Transfer payments.

Grok AI (xAI): Integrated intelligent chatbot providing real-time support for packages, invoices, and technical troubleshooting.

📊 Project Statistics
Developed by a dedicated team of two, the project boasts:

Total Lines of Code: 35,820

API Endpoints: 109 routes

Core CRUDs: 12 management modules

Total Files: 214

🛡 Security & Access Control
The system implements Role-Based Access Control (RBAC) to ensure data integrity across 4 privilege levels:

Admin: Full system access and staff management.

Team Lead: Operations and infrastructure oversight.

Supervisor: Monitoring of contracts and financial billing.

Agent: Handling subscriber registrations and complaints.

🚀 Installation & Setup
1. Clone the Repository
Bash
git clone https://github.com/AmarAbdurrahmani/Telecom-Management.git
cd telekom-ms
2. Backend Configuration (Laravel)
Bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
Note: Ensure SMTP, Stripe, and xAI (Grok) keys are configured in your .env file.

3. Frontend Configuration (React)
Bash
cd ../frontend
npm install
npm run dev
4. Optimization
To ensure all mail and system configurations are active:

Bash
php artisan config:clear

© 2026 TelekomMS Team - Developed as an academic project at UBT (University for Business and Technology).
