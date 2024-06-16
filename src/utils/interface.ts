import { Request } from 'express';
import { Role } from './enum';

export interface CustomRequest extends Request {
  user?: { id: string; username: string; user: string; role: Role };
}
