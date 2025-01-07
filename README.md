🃏 BlackJack Multiplayer - Projet Dockerisé

Bienvenue dans le projet BlackJack Multiplayer, une application web multi-joueurs permettant de jouer au BlackJack en ligne avec vos amis. Le projet est entièrement conteneurisé avec Docker Compose pour une installation et un déploiement simplifiés.

📦 Table des matières
📋 Prérequis
🚀 Démarrage Rapide
⚙️ Configuration
🛠️ Commandes Utiles
💻 Technologies Utilisées
📄 Licence
📋 Prérequis

Assurez-vous d'avoir les outils suivants installés sur votre machine :

Docker desktop 

OU

Docker ≥ 20.x.x → Télécharger Docker (inclus avec Docker Desktop)
Docker Compose ≥ 1.29.x → (inclus avec Docker Desktop)

ET

Node.js ≥ 18.x.x → Télécharger Node.js
Bash (Linux/Mac) ou PowerShell (Windows)

🚀 Démarrage Rapide

1️⃣ Clonez le dépôt :


a faire

2️⃣ Démarrez le projet avec le script adapté :

Sur Windows :

start.bat

Sur Linux / macOS :

./start.sh


⚙️ Configuration

🌐 Environnement Backend :

Le serveur backend est exposé sur le port 3001.

🌍 Environnement Frontend :

L'interface React est accessible via le port 3000.

🔄 Détection Automatique de l'IP :

Les scripts de démarrage détectent automatiquement l'IP locale du serveur et la transmettent au client.

🛠️ Commandes Utiles

🛑 Arrêter les services Docker :

docker-compose down

🔄 Rebuilder les conteneurs :

docker-compose build

🐳 Vérifier les logs des conteneurs :

docker-compose logs -f


💻 Technologies Utilisées

Frontend : React + TypeScript
Backend : Node.js + Express + Socket.IO
Conteneurisation : Docker & Docker Compose


📂 Structure du Projet


📁 blackjack-multiplayer/
├── 📁 client/          # Frontend React
│   ├── src/
│   ├── Dockerfile
│   └── start.sh / start.bat
│
├── 📁 server/          # Backend Node.js + Express
│   ├── src/
│   ├── Dockerfile
│
├── docker-compose.yml  # Configuration Docker Compose
├── start.sh            # Script de démarrage Linux/macOS
├── start.bat           # Script de démarrage Windows
└── README.md           # Documentation


📄 Licence
Ce projet est sous licence MIT. Consultez le fichier LICENSE pour plus de détails.

🙌 Contributions
Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

🚀 À Vous de Jouer !
Que la chance soit avec vous, et amusez-vous bien en jouant au BlackJack Multiplayer ! 🃏✨






