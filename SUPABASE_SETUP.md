# Supabase Setup Guide for Resume Enhancer

This guide will help you set up Supabase for the Resume Enhancer application.

## Prerequisites

- Supabase Project ID: `vpvvcwvebjtibafsceqx`
- Supabase URL: `https://vpvvcwvebjtibafsceqx.supabase.co`

## Step 1: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard/project/vpvvcwvebjtibafsceqx
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL**: `https://vpvvcwvebjtibafsceqx.supabase.co`
   - **anon/public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

4. Navigate to **Settings** → **Database**
5. Copy the **Connection string** (URI format)
   - It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.vpvvcwvebjtibafsceqx.supabase.co:5432/postgres`
   - This is your `DATABASE_URL`

## Step 2: Set Up Supabase Storage

### Create the Resumes Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Configure the bucket:
   ```
   Name: resumes
   Public: No (keep private for security)
   ```
4. Click **Create bucket**

### Set Storage Policies

Add RLS (Row Level Security) policies for the resumes bucket:

1. Go to **Storage** → **Policies** → **resumes** bucket
2. Create the following policies:

**Policy 1: Allow authenticated users to upload their own files**
```sql
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: Allow users to read their own files**
```sql
CREATE POLICY "Users can read their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: Allow users to delete their own files**
```sql
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 3: Set Up Database Schema

Run the Prisma migrations to create the database schema:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase database
npx prisma db push

# (Optional) Seed the database with test data
npx prisma db seed
```

## Step 4: Configure Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://vpvvcwvebjtibafsceqx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:your-password@db.vpvvcwvebjtibafsceqx.supabase.co:5432/postgres"

# NextAuth Configuration
NEXTAUTH_SECRET="your-random-secret-key-min-32-characters-here"
NEXTAUTH_URL="http://localhost:3000"

# Encryption Key (for API key storage - must be exactly 32 characters)
ENCRYPTION_KEY="your-32-character-encryption-key"

# Optional: System-wide AI Provider API Keys
OPENAI_API_KEY="sk-your-openai-api-key"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key"
GOOGLE_API_KEY="your-google-gemini-api-key"

# Node Environment
NODE_ENV="development"
```

## Step 5: Enable Row Level Security (Optional but Recommended)

If you want additional database-level security, enable RLS on your tables:

1. Go to **Database** → **Tables** in Supabase
2. For the `Resume` table, click **RLS Enabled**
3. Add policies:

**Allow users to read their own resumes:**
```sql
CREATE POLICY "Users can view their own resumes"
ON "Resume" FOR SELECT
TO authenticated
USING (auth.uid()::text = "userId");
```

**Allow users to insert their own resumes:**
```sql
CREATE POLICY "Users can insert their own resumes"
ON "Resume" FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = "userId");
```

## Step 6: Test the Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Try uploading a resume at http://localhost:3000/dashboard

## File Storage Structure

Files in Supabase Storage will be organized as:
```
resumes/
  ├── {userId}/
  │   ├── {timestamp}-resume1.pdf
  │   ├── {timestamp}-resume2.docx
  │   └── ...
```

## Troubleshooting

### "Failed to upload file" error
- Check that the `resumes` bucket exists
- Verify storage policies are set correctly
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set in your environment

### "Failed to connect to database" error
- Verify your `DATABASE_URL` is correct
- Check your Supabase database password
- Ensure your IP is allowlisted (Supabase allows all by default)

### "Prisma client not found" error
- Run `npx prisma generate`

## Security Best Practices

1. **Never commit** `.env` file to version control
2. Keep your `SUPABASE_SERVICE_ROLE_KEY` secret
3. Use RLS policies to restrict data access
4. Keep the resumes bucket private (not public)
5. Rotate your `NEXTAUTH_SECRET` and `ENCRYPTION_KEY` regularly

## Integration with Existing Dashboard

To integrate with your existing dashboard:

1. Copy the `/admin/resumes` directory to your dashboard's admin section
2. Add a menu item in your admin navigation:
   ```tsx
   <Link href="/admin/resumes">Resume Enhancer</Link>
   ```
3. Copy all `/api` routes to your dashboard's API folder
4. Copy the `/lib` utilities to your dashboard
5. Install required dependencies from `package.json`

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Prisma with Supabase](https://supabase.com/docs/guides/integrations/prisma)
