# 🗄️ LOCAL ENVIRONMENT VARIABLES
# Copy ini ke .env.local untuk testing lokal

# Database PostgreSQL Lokal
DATABASE_URL="postgresql://ppdb_user:ppdb_password123@localhost:5432/ppdb_alimam_test"

# Non-aktifkan Supabase (comment out)
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=

# NextAuth Configuration (untuk local testing)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-secret-key-change-in-production"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="PPDB Al Imam (LOCAL)"

# WhatsApp Configuration (tetap aktif)
NEXT_PUBLIC_WABLAS_API_KEY="your_wablas_api_key"
NEXT_PUBLIC_WABLAS_PHONE_NUMBER="628123456789"

# Midtrans Configuration (tetap aktif)
MIDTRANS_CLIENT_KEY="your_midtrans_client_key"
MIDTRANS_SERVER_KEY="your_midtrans_server_key"

# File Storage Configuration (local - sementara non-aktif)
# NEXT_PUBLIC_UPLOAD_DIR="./uploads"
# NEXT_PUBLIC_MAX_FILE_SIZE="10485760"

# Email Configuration (jika perlu)
# EMAIL_HOST="smtp.gmail.com"
# EMAIL_PORT="587"
# EMAIL_USER="your_email@gmail.com"
# EMAIL_PASS="your_app_password"

# Development Flags
NODE_ENV="development"
LOG_LEVEL="debug"
