import type { Request, Response, NextFunction } from "express";

export default function notFound(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    message: "Resource not found",
    path: req.originalUrl,
  });
}