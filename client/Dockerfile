# Étape 1 : Build
FROM node:18-alpine AS builder

WORKDIR /app

# Installer
COPY package.json package-lock.json ./
RUN npm install

# Copier le code
COPY . ./

# Injection de la variable et build
ARG REACT_APP_SERVER_URL_LIST
ENV REACT_APP_SERVER_URL_LIST=${REACT_APP_SERVER_URL_LIST}

# Écrire la variable dans un fichier .env
RUN echo "REACT_APP_SERVER_URL_LIST=$REACT_APP_SERVER_URL_LIST" > .env

RUN npm run build

# Étape 2 : Runner
FROM node:18-alpine AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
