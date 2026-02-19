#!/bin/bash
echo "==========================================="
echo "Fitness Buddy App - Full Setup Script"
echo "==========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install Backend Dependencies
echo "📦 Installing Backend Dependencies..."
cd BackEnd
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..
echo ""

# Install Frontend Dependencies
echo "📦 Installing Frontend Dependencies..."
cd FrontEnd
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..
echo ""

echo "==========================================="
echo "✅ Setup Complete!"
echo "==========================================="
echo ""
echo "Next Steps:"
echo "1. Make sure you have Supabase credentials in .env files"
echo "2. Run the database schema in Supabase SQL Editor"
echo "3. Start Backend: cd BackEnd && npm run dev"
echo "4. Start Frontend: cd FrontEnd && npm run dev"
echo ""
