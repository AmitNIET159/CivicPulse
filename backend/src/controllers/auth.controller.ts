import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';

// Generate tokens
const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: 900 } // 15 minutes in seconds
  );
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: 604800 } // 7 days in seconds
  );
};

// POST /api/auth/register — Citizen registration
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered.' });
      return;
    }

    const user = new User({
      name,
      email,
      password,
      role: 'citizen',
      isVerified: true,
    });

    await user.save();

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Store hashed refresh token
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: hashedRefresh },
    });

    res.status(201).json({
      message: 'Registration successful.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// POST /api/auth/register-official — Official registration (needs admin approval)
export const registerOfficial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, ward, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered.' });
      return;
    }

    const user = new User({
      name,
      email,
      password,
      role: 'official',
      ward,
      department,
      isVerified: false, // Requires admin approval
    });

    await user.save();

    res.status(201).json({
      message: 'Official registration submitted. Pending admin verification.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ward: user.ward,
        department: user.department,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Store hashed refresh token
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: hashedRefresh },
    });

    res.json({
      message: 'Login successful.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ward: user.ward,
        department: user.department,
        isVerified: user.isVerified,
        avatar: user.avatar,
        reportCount: user.reportCount,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// POST /api/auth/refresh — Refresh access token
export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token required.' });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { userId: string };

    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user) {
      res.status(401).json({ message: 'Invalid refresh token.' });
      return;
    }

    // Check if refresh token exists in stored tokens
    let tokenFound = false;
    let tokenIndex = -1;
    for (let i = 0; i < user.refreshTokens.length; i++) {
      const isValid = await bcrypt.compare(refreshToken, user.refreshTokens[i]);
      if (isValid) {
        tokenFound = true;
        tokenIndex = i;
        break;
      }
    }

    if (!tokenFound) {
      res.status(401).json({ message: 'Invalid refresh token.' });
      return;
    }

    // Rotate: remove old, issue new
    user.refreshTokens.splice(tokenIndex, 1);
    const newAccessToken = generateAccessToken(user._id.toString(), user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString());
    const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);
    user.refreshTokens.push(hashedRefresh);
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Refresh token expired. Please login again.' });
      return;
    }
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// POST /api/auth/logout — Invalidate refresh token
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken || !req.user) {
      res.status(400).json({ message: 'Refresh token required.' });
      return;
    }

    const user = await User.findById(req.user._id).select('+refreshTokens');
    if (!user) {
      res.status(401).json({ message: 'User not found.' });
      return;
    }

    // Remove the matching refresh token
    const newTokens: string[] = [];
    for (const storedToken of user.refreshTokens) {
      const isMatch = await bcrypt.compare(refreshToken, storedToken);
      if (!isMatch) {
        newTokens.push(storedToken);
      }
    }

    user.refreshTokens = newTokens;
    await user.save();

    res.json({ message: 'Logged out successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// GET /api/auth/me — Get current user profile
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        ward: req.user.ward,
        department: req.user.department,
        isVerified: req.user.isVerified,
        avatar: req.user.avatar,
        reportCount: req.user.reportCount,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
