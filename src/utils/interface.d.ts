import { Request } from 'express';
import { Role } from './enum';

interface CustomRequest extends Request {
  user?: { id: string; username: string; user: string; role: Role };
}
