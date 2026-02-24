import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/prisma';
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email?: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
    role: UserRole;
  };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    if (decoded.type !== 'access') {
      res.status(401).json({ success: false, message: 'Invalid token type' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId, deletedAt: null },
      select: { id: true, email: true, phone: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'User not found or inactive' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expired' });
      return;
    }
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.accessToken;

  if (!token) {
    next();
    return;
  }

  jwt.verify(
    token,
    config.jwt.accessSecret,
    async (err: Error | null, decoded: unknown) => {
      if (err || !decoded) {
        next();
        return;
      }
      const payload = decoded as JwtPayload;
      if (payload.type !== 'access') {
        next();
        return;
      }
      const user = await prisma.user.findFirst({
        where: { id: payload.userId, deletedAt: null },
        select: { id: true, email: true, phone: true, role: true, isActive: true },
      });
      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
        };
      }
      next();
    }
  );
}
