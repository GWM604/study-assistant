# 📚 Study Assistant

An AI-powered study assistant for all grades and subjects. Scan homework, get solutions, and access personalized tutoring.

## Features

### 🆓 Free Tier
- 5 photo scans per month
- Basic problem solving (answers only)
- No detailed explanations
- No tutoring access
- Text-based question input

### 💎 Premium Tier ($9.99/month)
- Unlimited photo scans
- Detailed step-by-step explanations
- AI-powered tutor with follow-up questions
- Unlimited follow-up questions
- Priority support
- All free tier features

## 📚 Supported Subjects
- Mathematics
- Language Arts
- Science
- Health
- Coding
- History
- Foreign Languages
- Computer Science

## 🛠 Tech Stack
- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js/Express
- **AI**: OpenAI GPT-4 API
- **Database**: MongoDB
- **Payment**: Stripe
- **Image Processing**: Tesseract.js & OCR
- **Authentication**: JWT

## 📦 Installation

### Prerequisites
- Node.js 16+
- MongoDB
- OpenAI API Key
- Stripe Account

### Setup

```bash
# Clone the repository
git clone https://github.com/GWM604/study-assistant.git
cd study-assistant

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your API keys to .env
# MONGODB_URI=your_mongodb_uri
# OPENAI_API_KEY=your_openai_key
# STRIPE_SECRET_KEY=your_stripe_key
# JWT_SECRET=your_jwt_secret

# Start the development server
npm run dev
```

## 📁 Project Structure

```
study-assistant/
├── backend/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth middleware
│   └── server.js         # Express server
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # React components
│   │   ├── styles/       # CSS files
│   │   └── App.js        # Main app
│   └── package.json
├── .env.example
├── package.json
└── README.md
```

## 🚀 Usage

1. **Sign Up**: Create an account with email and password
2. **Select Subject**: Choose which subject you need help with
3. **Input Method**: Either upload a photo of your homework or type your question
4. **Get Solution**: Receive instant solutions with explanations (Premium)
5. **Ask Tutor**: Follow up with questions to understand better (Premium)

## 💳 Pricing

- **Free**: $0 - 5 photos/month, basic solutions
- **Premium**: $9.99/month - Unlimited photos, detailed explanations, AI tutor

## 🔐 Security

- Password encryption with bcryptjs
- JWT token-based authentication
- Secure Stripe payment processing
- Environment variables for sensitive data

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to account

### Solutions
- `POST /api/solutions/solve-photo` - Solve from photo
- `POST /api/solutions/solve-text` - Solve from text
- `GET /api/solutions/history` - Get user's solutions

### Tutor
- `POST /api/tutor/:solutionId/ask` - Ask follow-up question
- `GET /api/tutor/:solutionId/history` - Get tutor interactions

### Premium
- `POST /api/premium/checkout` - Create Stripe checkout
- `GET /api/premium/status` - Get subscription status
- `POST /api/premium/cancel` - Cancel subscription

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Support

For issues or questions, please open a GitHub issue.
