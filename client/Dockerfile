FROM node:18-alpine

WORKDIR /usr/src/app

# Copier package.json et installer les dépendances
COPY package.json package-lock.json ./
RUN npm install

# Copier les fichiers source
COPY ./src ./src
COPY ./public ./public

# Build du projet React
RUN npm run build

# Exposer le port et servir le build statique
EXPOSE 3000
RUN npm install -g serve
CMD ["serve", "-s", "build"]
