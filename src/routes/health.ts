import { Hono } from 'hono';
import { HealthController } from '../controllers/HealthController';

const health = new Hono();

// Health checks
health.get('/', HealthController.basicHealthCheck);
health.get('/detailed', HealthController.detailedHealthCheck);

// Para containerización (Kubernetes/Docker)
health.get('/ready', HealthController.readinessCheck);
health.get('/live', HealthController.livenessCheck);

export default health; 