# Utiliser une image node officielle pour builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de config pour installer les dépendances
COPY package.json package-lock.json ./
RUN npm install

# Copier le code source et builder
COPY . .
RUN npm run build

# -- Phase finale (serveur web léger) --
FROM node:18-alpine AS runner

WORKDIR /app

# On installe un petit serveur http statique (ex: 'serve')
RUN npm install -g serve

# Copier les builds générés
COPY --from=builder /app/build ./build

# Exposer le port 3000
EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
