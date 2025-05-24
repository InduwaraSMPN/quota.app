# Quota.app - Fuel Quota Management System

A comprehensive fuel quota management system connecting vehicle owners, fuel station owners, and administrators.

## 🏗️ Architecture

- **Backend**: Java Spring Boot with JWT authentication, JPA, and PostgreSQL
- **Frontend**: 3 Next.js applications (Vehicle, Station, Admin)
- **Mobile**: Expo/React Native app for fuel station operators
- **Database**: PostgreSQL with dual connections (quota.app + DMT)

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL
- Bun (package manager)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/InduwaraSMPN/quota.app.git
   cd quota.app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   # Copy environment template
   cp src/main/resources/application-example.properties src/main/resources/application.properties
   # Copy environment variables template
   cp ../.env.example ../.env
   ```

3. **Configure Environment Variables**

   Edit `.env` file with your actual values:
   ```env
   # Twilio Configuration (for SMS notifications)
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   TWILIO_ENABLED=true
   ```

4. **Start Backend**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

5. **Start Frontend Applications**
   ```bash
   # Vehicle Owner Frontend (Port 3000)
   cd frontend-vehicle
   bun install
   bun dev

   # Station Owner Frontend (Port 3001)
   cd frontend-station
   bun install
   bun dev

   # Admin Frontend (Port 3002)
   cd frontend-admin
   bun install
   bun dev
   ```

6. **Start Mobile App**
   ```bash
   cd mobile-app/quota.app
   bun install
   bun start
   ```

## 🔐 Security Configuration

### Environment Variables

The application uses environment variables for sensitive configuration:

- **Twilio Credentials**: Used for SMS notifications in the mobile app
- **Database Credentials**: PostgreSQL connection details
- **JWT Secrets**: For authentication token generation

### Files to Configure

1. **`.env`** - Environment variables (ignored by git)
2. **`backend/src/main/resources/application.properties`** - Main configuration
3. **`backend/src/main/resources/application-example.properties`** - Template with safe defaults

### Important Security Notes

- Never commit actual credentials to git
- Use environment variables for all sensitive data
- The `.env` file is automatically ignored by git
- Use the provided example files as templates

## 📱 Applications

### Vehicle Owner App (Port 3000)
- Vehicle registration and management
- QR code generation for fuel purchases
- Quota tracking and consumption history
- Profile management

### Station Owner App (Port 3001)
- Fuel inventory management
- Transaction processing via QR code scanning
- Sales analytics and reporting
- Station profile management

### Admin App (Port 3002)
- User management (vehicle owners, station owners, admins)
- System-wide analytics and reporting
- Fuel consumption statistics
- Station and vehicle oversight

### Mobile App (Expo)
- QR code scanning for fuel transactions
- Real-time quota validation
- SMS notifications via Twilio
- Offline transaction support

## 🗄️ Database Schema

The system uses PostgreSQL with two main databases:
- **quota.app**: Main application data
- **DMT**: Department of Motor Traffic integration

## 🛠️ Development

### Tech Stack

- **Backend**: Spring Boot, Spring Security, Spring Session, JPA/Hibernate
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn UI
- **Mobile**: Expo, React Native, React Navigation
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Notifications**: Twilio SMS

### Code Style

- TypeScript for type safety
- Shadcn UI components for consistent design
- Responsive design patterns
- Sonner toast notifications
- Multi-step forms with validation

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue on GitHub.