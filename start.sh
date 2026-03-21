#!/bin/bash
# Mentoria Sublime — Iniciar backend + frontend

echo "🚀 Iniciando Mentoria Sublime..."
echo ""

# Backend
echo "📦 Backend (porta 3001)..."
cd "$(dirname "$0")/server"
node src/index.js &
BACKEND_PID=$!

sleep 2

# Frontend
echo "🎨 Frontend (porta 5173)..."
cd "$(dirname "$0")/client"
npx vite &
FRONTEND_PID=$!

echo ""
echo "✅ Plataforma rodando!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   Admin:    admin@plataforma.com / admin123"
echo ""
echo "Pressione Ctrl+C para encerrar."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Encerrado.'" INT
wait
