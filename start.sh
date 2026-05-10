#!/bin/bash

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

clear
echo ""
echo -e "${CYAN}${BOLD}  MediCore HMS - Starting...${NC}"
echo ""

[ ! -d "backend/node_modules" ] && echo -e "${RED}  Run setup.sh first!${NC}" && exit 1
[ ! -f "backend/.env" ]        && echo -e "${RED}  Run setup.sh first!${NC}" && exit 1

# Start backend
echo -e "  Starting backend  → ${CYAN}http://localhost:5000${NC}"
cd backend && npm run dev &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend
echo -e "  Starting frontend → ${CYAN}http://localhost:3000${NC}"
cd frontend && npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}  Both servers running! Press Ctrl+C to stop all.${NC}"
echo ""

# On exit, kill both
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
