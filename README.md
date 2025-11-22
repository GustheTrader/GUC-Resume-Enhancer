# GUC Resume Enhancer

An AI-powered resume enhancement platform that helps job seekers optimize their resumes using multiple AI providers (OpenAI, Anthropic, Google Gemini). Built with Next.js, TypeScript, and Prisma.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.7-2D3748)

## Features

### Core Functionality
- **AI-Powered Enhancements**: Leverage OpenAI, Anthropic Claude, and Google Gemini to enhance resumes
- **Multiple Enhancement Types**:
  - Skills & Certifications optimization
  - Project Experience enhancement
  - Client Success & Quality highlighting
  - ATS (Applicant Tracking System) optimization
  - Power words and action verbs
  - Professional formatting
  - Industry keyword integration
  - Grammar and spelling corrections

### User Experience
- **Dual Mode Support**:
  - **Full Mode**: Complete user authentication with resume history and API key management
  - **Light Mode**: Quick enhancement without account creation
- **File Support**: Upload PDF and DOCX resume files
- **Side-by-Side Comparison**: View original and enhanced resumes simultaneously
- **PDF Export**: Download enhanced resumes as professional PDFs
- **Resume History**: Track all your enhancement sessions

### Security & Authentication
- NextAuth integration for secure authentication
- Encrypted API key storage
- User-managed API keys for AI providers
- Session-based security

## Tech Stack

### Frontend
- **Framework**: Next.js 14.2 with App Router
- **Language**: TypeScript 5.2
- **Styling**: Tailwind CSS 3.3
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand + Jotai
- **Data Fetching**: TanStack Query (React Query) + SWR

### Backend
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth 4.24
- **File Storage**: AWS S3
- **PDF Processing**: pdf-lib, pdf-parse, react-pdf
- **Document Processing**: mammoth (DOCX), tesseract.js (OCR)

### AI Providers
- OpenAI GPT models
- Anthropic Claude
- Google Gemini

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- PostgreSQL database
- AWS S3 bucket (for file storage)
- API keys for at least one AI provider (OpenAI, Anthropic, or Google Gemini)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GustheTrader/GUC-Resume-Enhancer.git
   cd GUC-Resume-Enhancer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/resume_enhancer"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # AWS S3
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   AWS_S3_BUCKET_NAME="your-bucket-name"

   # Encryption (for API keys)
   ENCRYPTION_KEY="your-32-character-encryption-key"

   # AI Providers (Optional - users can provide their own)
   OPENAI_API_KEY="your-openai-key"
   ANTHROPIC_API_KEY="your-anthropic-key"
   GOOGLE_API_KEY="your-google-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed  # Optional: seed with sample data
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### For Users with Accounts

1. **Sign up** at `/auth/signup` or **sign in** at `/auth/signin`
2. **Configure API Keys** in Settings to use your own AI provider keys
3. **Upload a resume** from the dashboard (PDF or DOCX)
4. **Select enhancement type** and AI provider
5. **Review enhancements** in side-by-side view
6. **Download** the enhanced resume as PDF

### For Quick Use (Light Mode)

1. Navigate to `/api-keys-light`
2. Enter your AI provider API key
3. Upload and enhance your resume immediately
4. No account required!

## Project Structure

```
GUC-Resume-Enhancer/
├── api/                    # API routes
│   └── api-keys/          # API key management endpoints
├── auth/                   # Authentication pages
│   ├── signin/
│   └── signup/
├── dashboard/              # Main dashboard
├── enhance/                # Resume enhancement interface
├── history/                # Enhancement history
├── settings/               # User settings
├── ui/                     # Reusable UI components
├── components.json         # Component configuration
├── schema.prisma           # Prisma database schema
├── package.json
└── tsconfig.json
```

## Database Schema

The application uses the following main models:

- **User**: User accounts and profiles
- **Resume**: Uploaded resume files and metadata
- **ResumeEnhancement**: AI-enhanced versions with different types
- **UserApiKey**: Encrypted user API keys for AI providers
- **SystemLog**: Application logging and diagnostics

## API Endpoints

### Resume Management
- `POST /api/resumes/upload` - Upload a new resume
- `GET /api/resumes/:id` - Get resume details
- `DELETE /api/resumes/:id` - Delete a resume

### Enhancement
- `POST /api/enhance` - Create a new enhancement
- `GET /api/enhance/:id` - Get enhancement status/result

### API Keys
- `GET /api/api-keys` - List user's API keys
- `POST /api/api-keys` - Add new API key
- `PUT /api/api-keys/:id` - Update API key
- `DELETE /api/api-keys/:id` - Delete API key

## Configuration

### Supported AI Models

**OpenAI**
- gpt-4o
- gpt-4o-mini
- gpt-4-turbo

**Anthropic**
- claude-3-5-sonnet
- claude-3-opus
- claude-3-sonnet

**Google Gemini**
- gemini-1.5-pro
- gemini-1.5-flash

### Enhancement Types

Configure enhancement types in the enhancement interface component. Current types include:
- Skills & Certifications
- Project Experience
- Client Success & Quality

## Development

### Running Tests
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm run start
```

### Database Migrations
```bash
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- AI providers: OpenAI, Anthropic, Google

## Roadmap

- [ ] Add more enhancement types
- [ ] Support for LinkedIn profile optimization
- [ ] Cover letter generation
- [ ] Resume templates library
- [ ] Multi-language support
- [ ] Resume analytics and scoring
- [ ] Job description matching

---

Made with ❤️ by Ground Up Careers
