# Resume Enhancer - Dashboard Integration Guide

This guide will help you integrate the Resume Enhancer into your existing dashboard's admin section.

## Overview

The Resume Enhancer is a complete AI-powered resume enhancement tool that includes:
- Resume upload (PDF/DOCX)
- AI enhancement with multiple providers (OpenAI, Anthropic, Google Gemini)
- Supabase integration for database and file storage
- User API key management
- Resume history and management

## Prerequisites

- Existing Next.js dashboard application
- Supabase project: `vpvvcwvebjtibafsceqx`
- Node.js 18+ and npm installed

## Integration Steps

### 1. Install Dependencies

Add these packages to your existing dashboard's `package.json`:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@prisma/client": "6.7.0",
    "pdf-parse": "1.1.1",
    "mammoth": "^1.11.0",
    "pdf-lib": "^1.17.1",
    "marked": "^16.4.0",
    "react-pdf": "^10.2.0",
    "pdfjs-dist": "^5.4.296",
    "bcryptjs": "2.4.3",
    "next-auth": "4.24.11",
    "@next-auth/prisma-adapter": "1.0.7"
  },
  "devDependencies": {
    "prisma": "6.7.0"
  }
}
```

Then run:
```bash
npm install
```

### 2. Copy Files to Your Dashboard

#### Copy Core Utilities (`/lib`)
Copy these files from this project to your dashboard's `/lib` directory:

```bash
# Core utilities
lib/supabase.ts                 # Supabase client
lib/supabase-storage.ts         # Supabase storage utilities
lib/db.ts                       # Prisma client
lib/auth.ts                     # NextAuth configuration (merge with yours)
lib/crypto.ts                   # API key encryption
lib/logger.ts                   # Logging utility
lib/llm-models.ts              # AI model configurations
lib/api-key-storage.ts         # Local storage utility
```

**Note:** If you already have authentication, merge `lib/auth.ts` with your existing auth configuration.

#### Copy API Routes (`/api`)
Copy these API routes to your dashboard's `/app/api` directory:

```bash
# Resume operations
api/resumes/upload/route.ts              # Upload resumes
api/resume-file/[id]/route.ts           # Get resume file
api/proxy-pdf/[id]/route.ts             # PDF proxy

# Enhancement
api/enhance-resume/[id]/route.ts        # AI enhancement

# API key management
api/api-keys/route.ts                    # List/create API keys
api/api-keys/[id]/route.ts              # Delete API keys
```

#### Copy Admin Pages
Copy the admin section to your dashboard:

```bash
# Copy to your dashboard's admin section
admin/resumes/page.tsx          # Main admin page
admin/resumes/layout.tsx        # Layout
```

**For your existing dashboard structure**, you might rename `admin/resumes` to match your routing:
- If your admin is at `/dashboard/admin`, put it in `/app/dashboard/admin/resumes`
- If your admin is at `/admin`, put it in `/app/admin/resumes`

#### Copy Components
Copy the resume-specific components:

```bash
dashboard/_components/upload-section.tsx
dashboard/_components/recent-resumes.tsx
enhance/[id]/_components/enhance-interface.tsx
enhance/[id]/page.tsx
history/_components/history-list.tsx
history/page.tsx
```

#### Copy UI Components (if not already present)
If your dashboard doesn't have shadcn/ui components, copy:

```bash
components/ui/*                 # All UI components
```

#### Copy Database Schema
Copy and merge the Prisma schema:

```bash
schema.prisma                   # Database schema
```

**Merge instructions**: If you have an existing Prisma schema, add these models to it:
- `Resume`
- `ResumeEnhancement`
- `UserApiKey`
- `SystemLog`

#### Copy Type Definitions
```bash
types/next-auth.d.ts           # NextAuth type extensions
```

### 3. Configure Environment Variables

Add these to your dashboard's `.env` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://vpvvcwvebjtibafsceqx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:your-password@db.vpvvcwvebjtibafsceqx.supabase.co:5432/postgres"

# Encryption (for API keys - exactly 32 characters)
ENCRYPTION_KEY="your-32-character-encryption-key"

# Optional: System AI API Keys
OPENAI_API_KEY="sk-your-openai-key"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"
GOOGLE_API_KEY="your-google-key"
```

See `SUPABASE_SETUP.md` for detailed setup instructions.

### 4. Set Up Supabase

Follow the complete setup guide in `SUPABASE_SETUP.md`:

1. Create the `resumes` storage bucket
2. Set up storage policies
3. Run Prisma migrations
4. (Optional) Enable Row Level Security

Quick setup:
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Add Navigation to Your Admin Dashboard

Add a link to the Resume Enhancer in your admin navigation:

**Example for sidebar navigation:**
```tsx
import { FileText } from "lucide-react";

<NavItem href="/admin/resumes" icon={<FileText />}>
  Resume Enhancer
</NavItem>
```

**Example for top navigation:**
```tsx
<Link href="/admin/resumes">
  Resume Enhancer
</Link>
```

### 6. Update Your Layout (if needed)

If your dashboard has a different layout structure, wrap the resume pages with your admin layout:

```tsx
// In your admin layout file
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-container">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

### 7. Authentication Integration

#### If using NextAuth (already configured):
The resume enhancer uses NextAuth. Merge the configuration from `lib/auth.ts` with your existing setup.

#### If using a different auth system:
1. Update all `getServerSession(authOptions)` calls to use your auth method
2. Ensure you return a user object with: `id`, `email`, `name`, `firstName`, `lastName`
3. Update the session type in `types/next-auth.d.ts`

### 8. Test the Integration

1. Start your dashboard:
   ```bash
   npm run dev
   ```

2. Navigate to your admin section where you added the Resume Enhancer

3. Test the following:
   - Upload a PDF resume
   - Upload a DOCX resume
   - Configure API keys in settings
   - Enhance a resume with AI
   - View enhancement history

## File Structure After Integration

```
your-dashboard/
├── app/
│   ├── admin/                          # Your existing admin
│   │   └── resumes/                    # ← NEW: Resume Enhancer
│   │       ├── page.tsx
│   │       └── layout.tsx
│   ├── api/
│   │   ├── resumes/                    # ← NEW
│   │   ├── resume-file/                # ← NEW
│   │   ├── proxy-pdf/                  # ← NEW
│   │   ├── enhance-resume/             # ← NEW
│   │   └── api-keys/                   # ← NEW
│   ├── enhance/                        # ← NEW
│   └── history/                        # ← NEW
├── components/
│   └── ui/                             # ← NEW (if not exists)
├── lib/
│   ├── supabase.ts                     # ← NEW
│   ├── supabase-storage.ts             # ← NEW
│   ├── db.ts                           # ← NEW
│   ├── crypto.ts                       # ← NEW
│   ├── logger.ts                       # ← NEW
│   └── llm-models.ts                   # ← NEW
├── types/
│   └── next-auth.d.ts                  # ← NEW
├── schema.prisma                       # ← MERGE with existing
└── .env                                # ← ADD new variables
```

## Customization Options

### Styling
The Resume Enhancer uses Tailwind CSS and follows a neutral design. You can:
- Update colors in `tailwind.config.ts`
- Modify component styles in the UI components
- Wrap pages in your dashboard's layout

### Branding
Replace branding in:
- `admin/resumes/page.tsx` - Update titles and descriptions
- `components/header.tsx` - Update logo and app name (if using standalone)

### Features
Enable/disable features by:
- Removing enhancement types from `lib/llm-models.ts`
- Hiding API key management routes
- Customizing upload restrictions in `api/resumes/upload/route.ts`

### Access Control
Add role-based access control:

```tsx
// Example: Only allow admins
export default async function AdminResumesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect("/unauthorized");
  }

  // ... rest of page
}
```

## Troubleshooting

### Build Errors

**"Cannot find module '@/lib/...'"**
- Verify you copied all files from `/lib`
- Check your `tsconfig.json` has the correct path alias for `@`

**"Prisma client not generated"**
```bash
npx prisma generate
```

**"Module not found: Can't resolve '@supabase/supabase-js'"**
```bash
npm install @supabase/supabase-js
```

### Runtime Errors

**"Failed to upload file"**
- Check Supabase storage bucket exists
- Verify storage policies are set
- Check `SUPABASE_SERVICE_ROLE_KEY` is in `.env`

**"Unauthorized" errors**
- Ensure authentication is working
- Check session includes `user.id`
- Verify API routes use correct auth method

**"Database connection failed"**
- Verify `DATABASE_URL` is correct
- Run `npx prisma db push`
- Check Supabase database is accessible

### Storage Issues

**"Bucket not found"**
- Create `resumes` bucket in Supabase Storage
- See `SUPABASE_SETUP.md` for bucket setup

**"Access denied" on file upload**
- Check storage policies
- Verify RLS policies allow uploads
- Ensure user is authenticated

## Support

For issues specific to:
- **Supabase**: See `SUPABASE_SETUP.md`
- **Database**: Check Prisma schema and migrations
- **Authentication**: Verify NextAuth configuration
- **File uploads**: Check Supabase storage policies

## Production Deployment

Before deploying to production:

1. **Environment Variables**: Set all required env vars in your hosting platform
2. **Database Migration**: Run `npx prisma migrate deploy`
3. **Supabase**: Ensure production Supabase project is configured
4. **Security**:
   - Rotate all secrets
   - Enable RLS on all tables
   - Review storage policies
   - Set up proper CORS
5. **Performance**:
   - Enable database connection pooling
   - Configure CDN for static assets
   - Set up monitoring and logging

## Next Steps

After integration:
1. Test all features thoroughly
2. Customize UI to match your dashboard
3. Set up monitoring and error tracking
4. Configure backup and disaster recovery
5. Train admin users on the Resume Enhancer features

---

**Questions?** Review the code comments and refer to `SUPABASE_SETUP.md` for detailed configuration.
