#!/bin/bash

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

clear
echo ""
echo -e "${CYAN}${BOLD}  =========================================="
echo "   MediCore Hospital Management System"
echo "   Mac / Linux Setup Script"
echo -e "  ==========================================${NC}"
echo ""

# STEP 1 - Node.js
echo -e "${BOLD}[1/5] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}  ✗ Node.js NOT installed!${NC}"
    echo "  Mac:    brew install node  OR  https://nodejs.org"
    echo "  Ubuntu: sudo apt install nodejs npm"
    exit 1
fi
echo -e "${GREEN}  ✓ Node.js $(node --version) found${NC}"; echo ""

# STEP 2 - MongoDB
echo -e "${BOLD}[2/5] Checking MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}  ⚠ MongoDB not found in PATH${NC}"
    echo "  Mac:    brew tap mongodb/brew && brew install mongodb-community"
    echo "  Ubuntu: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/"
    echo "  Cloud:  https://www.mongodb.com/cloud/atlas (free tier)"
    echo ""
    read -p "  Continue anyway? (y/n): " c; [[ "$c" != "y" && "$c" != "Y" ]] && exit 1
else
    echo -e "${GREEN}  ✓ $(mongod --version | head -1)${NC}"
fi; echo ""

# STEP 3 - .env file
echo -e "${BOLD}[3/5] Environment file...${NC}"
if [ -f "backend/.env" ]; then
    echo "  INFO: backend/.env already exists, skipping."
else
    cat > backend/.env << 'EOF'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital_ms
JWT_SECRET=medicore_super_secret_jwt_key_2024_change_me
NODE_ENV=development
EOF
    echo -e "${GREEN}  ✓ backend/.env created${NC}"
    echo -e "${YELLOW}  → For Atlas, edit MONGODB_URI in backend/.env${NC}"
fi; echo ""

# STEP 4 - Install packages
echo -e "${BOLD}[4/5] Installing packages...${NC}"
echo "  Backend..."
(cd backend && npm install) || { echo -e "${RED}  ✗ Backend install failed${NC}"; exit 1; }
echo -e "${GREEN}  ✓ Backend done${NC}"
echo "  Frontend..."
(cd frontend && npm install) || { echo -e "${RED}  ✗ Frontend install failed${NC}"; exit 1; }
echo -e "${GREEN}  ✓ Frontend done${NC}"; echo ""

# STEP 5 - Seed
echo -e "${BOLD}[5/5] Sample data...${NC}"
read -p "  Add sample doctors & patients? (y/n): " s
if [[ "$s" == "y" || "$s" == "Y" ]]; then
    (cd backend && node seed.js) && echo -e "${GREEN}  ✓ Sample data added!${NC}" || echo -e "${YELLOW}  ⚠ Seeding failed - is MongoDB running?${NC}"
fi; echo ""

echo -e "${CYAN}${BOLD}  SETUP COMPLETE! Run:  bash start.sh${NC}"
echo "  Then open: http://localhost:3000"
echo "  Login: admin@medicore.com / admin123"
echo ""
