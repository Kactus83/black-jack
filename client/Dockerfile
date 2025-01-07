# Étape 1 : Build de l'application React
FROM node:18-alpine AS builder

WORKDIR /app

# Installer les dépendances
COPY package.json package-lock.json ./
RUN npm install

# Copier le code source et construire l'application
COPY . ./
RUN npm run build

# Étape 2 : Serveur statique
FROM node:18-alpine AS runner

WORKDIR /app

# Installer un serveur HTTP statique
RUN npm install -g serve

# Copier le build
COPY --from=builder /app/build ./build

# Exposer le port
EXPOSE 3000

# Démarrer le serveur React
CMD ["serve", "-s", "build", "-l", "3000"]
