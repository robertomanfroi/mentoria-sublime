FROM node:20-alpine

WORKDIR /app

# Instala dependências do servidor
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copia código do servidor
COPY server/ ./server/

# Copia build do frontend (gerado localmente antes do deploy)
COPY client/dist/ ./server/src/public/

# Cria pasta para uploads e banco de dados
RUN mkdir -p /app/data /app/uploads

# Define variáveis padrão
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/app/data/db.sqlite

EXPOSE 3001

CMD ["node", "server/src/index.js"]
