import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase.js";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Missing or invalid Authorization header format",
      });
      return;
    }

    const token = authHeader?.split(" ")[1];

    if (!token) {
      res
        .status(401)
        .json({ error: "Unauthorized", message: "Access token is missing" });
      return;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired access token",
      });
      return;
    }

    req.user = user;

    next();
  } catch (err) {
    console.error("Unexpected error in requiredAuth middleware:", err);
    res
      .status(500)
      .json({
        error: "Internal Server Error",
        message: "An unexpected error occurred during authentication",
      });
  }
};
