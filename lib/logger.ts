import { prisma } from "@/lib/db";

type LogLevel = 'error' | 'warning' | 'info' | 'debug';

interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private async log(
    level: LogLevel,
    category: string,
    message: string,
    metadata?: LogMetadata,
    userId?: string
  ) {
    try {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        const logMethod = level === 'error' ? console.error :
                         level === 'warning' ? console.warn :
                         console.log;
        logMethod(`[${level.toUpperCase()}] [${category}]`, message, metadata || '');
      }

      // Log to database
      await prisma.systemLog.create({
        data: {
          level,
          category,
          message,
          metadata: metadata ? JSON.stringify(metadata) : null,
          userId: userId || null,
        },
      });
    } catch (error) {
      // Fallback to console if database logging fails
      console.error('Failed to write log to database:', error);
      console.error(`[${level.toUpperCase()}] [${category}]`, message, metadata);
    }
  }

  async error(category: string, message: string, metadata?: LogMetadata, userId?: string) {
    return this.log('error', category, message, metadata, userId);
  }

  async warning(category: string, message: string, metadata?: LogMetadata, userId?: string) {
    return this.log('warning', category, message, metadata, userId);
  }

  async info(category: string, message: string, metadata?: LogMetadata, userId?: string) {
    return this.log('info', category, message, metadata, userId);
  }

  async debug(category: string, message: string, metadata?: LogMetadata, userId?: string) {
    if (process.env.NODE_ENV === 'development') {
      return this.log('debug', category, message, metadata, userId);
    }
  }
}

export const logger = new Logger();
