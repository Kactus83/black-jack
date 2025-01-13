import express from 'express';
import cors from 'cors';

/**
 * Classe pour configurer Express.
 * Étape 1 : On expose un simple endpoint /api/health,
 * et on laisse le reste géré par Socket.IO.
 */
export class ExpressApp {
  private app: express.Express;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Endpoint minimaliste pour vérifier la santé du serveur
    this.app.get('/api/health', (req, res) => {
      res.json({ success: true, message: 'Server is up.' });
    });
  }

  public getExpressInstance(): express.Express {
    return this.app;
  }
}