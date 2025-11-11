# 🔧 GoHealth - Setup Guide

Complete step-by-step guide for setting up the GoHealth e-commerce platform on your local machine or production environment.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Supabase Configuration](#supabase-configuration)
4. [Mailtrap Configuration](#mailtrap-configuration)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Running the Application](#running-the-application)
8. [Creating Admin User](#creating-admin-user)
9. [Troubleshooting](#troubleshooting)
10. [Production Deployment](#production-deployment)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

-   **Node.js** version 18.x or higher
    -   Download from [nodejs.org](https://nodejs.org/)
    -   Verify installation: `node --version`
-   **npm** (comes with Node.js) or **yarn**
    -   Verify npm: `npm --version`
-   **Git** (optional, for cloning)
    -   Download from [git-scm.com](https://git-scm.com/)

### Required Accounts

-   **Supabase Account** (free tier available)
    -   Sign up at [supabase.com](https://supabase.com)
-   **Mailtrap Account** (free tier available)
    -   Sign up at [mailtrap.io](https://mailtrap.io)

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/gohealth.git
cd gohealth
```

Or download the ZIP file and extract it.

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:

-   Next.js 15.3.5
-   React 19
-   Redux Toolkit
-   Supabase client
-   Prisma
-   jsPDF
-   Nodemailer
-   And other dependencies...

**Expected time:** 2-5 minutes depending on your internet connection.

---

## Supabase Configuration

### Step 1: Create a New Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the details:
    - **Name:** GoHealth (or your preferred name)
    - **Database Password:** Create a strong password (save this!)
    - **Region:** Choose closest to your location
    - **Pricing Plan:** Free
4. Click **"Create new project"**
5. Wait for the project to be provisioned (~2 minutes)

### Step 2: Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values (you'll need these later):
    - **Project URL** (format: `https://xxxxx.supabase.co`)
    - **anon public** key (safe to use in client-side code)
    - **service_role** key ⚠️ **CRITICAL: Keep this secret! Never expose in client code!**

> **Security Note:** The service_role key bypasses Row Level Security. Only use it in server-side API routes.

### Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the following SQL to create all necessary tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user',
  address TEXT,
  province VARCHAR(100),
  regency VARCHAR(100),
  district VARCHAR(100),
  village VARCHAR(100),
  postal_code VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product images table
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table (pembelian)
CREATE TABLE pembelian (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  total_price DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'ORDER_RECEIVED',
  shipping_address TEXT,
  province VARCHAR(100),
  regency VARCHAR(100),
  district VARCHAR(100),
  village VARCHAR(100),
  postal_code VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table (pembelian_items)
CREATE TABLE pembelian_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pembelian_id UUID REFERENCES pembelian(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_pembelian_user_id ON pembelian(user_id);
CREATE INDEX idx_pembelian_status ON pembelian(status);
CREATE INDEX idx_pembelian_items_pembelian_id ON pembelian_items(pembelian_id);
CREATE INDEX idx_ratings_product_id ON ratings(product_id);
```

4. Click **"Run"**
5. Verify all tables are created by going to **Table Editor**

### Step 4: Setup Storage for Product Images

1. In Supabase dashboard, go to **Storage**
2. Click **"Create a new bucket"**
3. Name it: `product-images`
4. Make it **Public** (so images can be accessed via URL)
5. Click **"Create bucket"**

### Step 5: Configure Storage Policies

1. Go to **Storage** → **Policies** → `product-images` bucket
2. Add the following policies:

**Policy 1: Public Read Access**

```sql
-- Policy Name: Public can view product images
-- Allowed operation: SELECT
-- Policy definition:
true
```

**Policy 2: Admin Upload Access**

```sql
-- Policy Name: Admins can upload
-- Allowed operation: INSERT
-- Policy definition:
auth.role() = 'authenticated'
```

---

## Mailtrap Configuration

### Step 1: Create Mailtrap Account

1. Go to [mailtrap.io](https://mailtrap.io)
2. Sign up for a free account
3. Verify your email

### Step 2: Get SMTP Credentials

1. After logging in, go to **Email Testing** → **Inboxes**
2. Select your default inbox (or create a new one)
3. Click on **SMTP Settings**
4. Select **Nodemailer** from the integrations dropdown
5. Copy the credentials shown (you'll need these for environment variables)

### Alternative: Production Email Setup

For production, replace test email service with a real SMTP service:

-   **Gmail SMTP** - Free for low volume
-   **SendGrid** - 100 emails/day free tier
-   **AWS SES** - Pay as you go
-   **Mailgun** - 5,000 emails/month free
-   **Postmark** - 100 emails/month free

Example Gmail configuration:

```env
MAILTRAP_HOST=smtp.gmail.com
MAILTRAP_PORT=587
MAILTRAP_USER=your-email@gmail.com
MAILTRAP_PASS=your-16-character-app-password
```

⚠️ **Note:** Gmail requires App Passwords when 2FA is enabled.

---

## Environment Variables

### Step 1: Create Environment File

In the root directory of the project, create a file named `.env.local`:

```bash
touch .env.local
```

### Step 2: Add Configuration

Copy and paste the following into `.env.local`, replacing the placeholder values:

```env
# ===================================
# SUPABASE CONFIGURATION
# ===================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ===================================
# EMAIL CONFIGURATION
# ===================================
# For development, use Mailtrap or similar test service
# For production, use SendGrid, AWS SES, or other SMTP service
MAILTRAP_HOST=smtp.example.com
MAILTRAP_PORT=2525
MAILTRAP_USER=your_email_username
MAILTRAP_PASS=your_email_password
ADMIN_EMAIL=admin@example.com

# ===================================
# APPLICATION CONFIGURATION
# ===================================
NEXT_PUBLIC_CURRENCY_SYMBOL=$
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3: Verify Environment Variables

Make sure `.env.local` is in your `.gitignore` file (it should be by default):

```bash
cat .gitignore | grep .env.local
```

⚠️ **SECURITY WARNING:**

-   NEVER commit `.env.local` to version control
-   NEVER share your service role key publicly
-   Rotate credentials if accidentally exposed
-   Use environment-specific variables for production

---

## Database Setup

### Step 1: Initialize Prisma

```bash
npx prisma generate
```

This generates the Prisma Client based on your `schema.prisma` file.

### Step 2: Push Schema to Database

```bash
npx prisma db push
```

This syncs your Prisma schema with the Supabase PostgreSQL database.

### Step 3: Verify Database Connection

```bash
npx prisma studio
```

This opens Prisma Studio (a database GUI) at `http://localhost:5555`. You should see all your tables.

---

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

---

## Creating Admin User

By default, all registered users have the `user` role. To create an admin:

### Method 1: Using Supabase Dashboard

1. Go to Supabase **Table Editor** → **users** table
2. Click on the user you want to make admin
3. Edit the **role** field from `user` to `admin`
4. Click **Save**

### Method 2: Using Prisma Studio

1. Run `npx prisma studio`
2. Navigate to **users** table
3. Click on a user record
4. Change **role** to `admin`
5. Save changes

### Method 3: Using SQL

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

After changing the role, the user needs to **log out and log back in** for changes to take effect.

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**

1. Check your Supabase project is running
2. Verify `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
3. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
4. Run `npm run dev` again

### Issue: "Email not sending"

**Solution:**

1. Check Mailtrap credentials in `.env.local`
2. Verify `MAILTRAP_USER` and `MAILTRAP_PASS` are correct
3. Check Mailtrap inbox logs for errors
4. Ensure port `2525` is not blocked by firewall

### Issue: "Module not found"

**Solution:**

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Hydration error" in console

**Solution:**

-   This is normal and handled in the code
-   Check `components/Navbar.jsx` for mounted state handling
-   Clear browser cache and reload

### Issue: "Cannot upload product images"

**Solution:**

1. Verify Supabase Storage bucket `product-images` exists
2. Check storage policies allow public read
3. Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### Issue: "Unauthorized access" when accessing admin

**Solution:**

1. Make sure your user has `role = 'admin'` in database
2. Log out and log back in
3. Check browser cookies are enabled
4. Clear cookies and login again

---

## Production Deployment

### Deploying to Vercel

1. **Push to GitHub**

    ```bash
    git add .
    git commit -m "Initial commit"
    git push origin main
    ```

2. **Connect to Vercel**

    - Go to [vercel.com](https://vercel.com)
    - Click **"Import Project"**
    - Select your GitHub repository
    - Click **"Import"**

3. **Configure Environment Variables**

    - In Vercel project settings, go to **Environment Variables**
    - Add all variables from your `.env.local` file:
        - `NEXT_PUBLIC_SUPABASE_URL`
        - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        - `SUPABASE_SERVICE_ROLE_KEY`
        - `MAILTRAP_HOST`
        - `MAILTRAP_PORT`
        - `MAILTRAP_USER`
        - `MAILTRAP_PASS`
        - `ADMIN_EMAIL`
        - `NEXT_PUBLIC_CURRENCY_SYMBOL`

4. **Deploy**

    - Click **"Deploy"**
    - Wait for deployment to complete
    - Visit your live site!

5. **Update Production URL**
    - After deployment, update `NEXT_PUBLIC_SITE_URL` environment variable
    - Example: `https://gohealth.vercel.app`
    - Redeploy if needed

### Deploying to Other Platforms

#### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

#### AWS / DigitalOcean

1. Build the application: `npm run build`
2. Upload `.next` folder and `node_modules`
3. Run `npm start` on server
4. Setup reverse proxy (nginx/Apache)

---

## Post-Deployment Checklist

-   [ ] All environment variables configured
-   [ ] Database tables created and synced
-   [ ] Admin user created and tested
-   [ ] Product images uploading correctly
-   [ ] Email sending working (test with order)
-   [ ] Admin dashboard accessible
-   [ ] User can register, login, and place orders
-   [ ] Invoice PDF generation working
-   [ ] Auto-logout after inactivity working
-   [ ] Mobile responsiveness tested
-   [ ] SSL certificate installed (HTTPS)

---

## Additional Configuration

### Customizing Auto-Logout Time

Edit `/components/ActivityTracker.jsx`:

```javascript
const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes
// Change to 15 minutes:
const INACTIVITY_LIMIT = 15 * 60 * 1000;
```

### Changing Currency

Update `.env.local`:

```env
NEXT_PUBLIC_CURRENCY_SYMBOL=Rp  # Indonesian Rupiah
# Or
NEXT_PUBLIC_CURRENCY_SYMBOL=$   # US Dollar
# Or
NEXT_PUBLIC_CURRENCY_SYMBOL=€   # Euro
```

### Adding More Admin Users

See [Creating Admin User](#creating-admin-user) section above.

---

## Need Help?

-   📧 Email: your-email@example.com
-   🐛 Issues: [GitHub Issues](https://github.com/yourusername/gohealth/issues)
-   📖 Documentation: [README.md](./README.md)
-   💬 Discussions: [GitHub Discussions](https://github.com/yourusername/gohealth/discussions)

---

**Happy Coding! 🚀**
