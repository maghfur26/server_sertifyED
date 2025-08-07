// services/authService.ts
import bcrypt from "bcrypt";
import Mitra from "../models/Organization";
import { generateToken, verifyToken } from "../utils/jwtUtils";
import { TokenPayload } from "../types/tokenPayload";
import type {
  RegisterUserData,
  LoginUserData,
  LoginResult,
} from "../types/authType";

class AuthService {
  async registerUser(userData: RegisterUserData): Promise<void> {
    const { institutionName, email, password, address } = userData;

    const existingUser = await Mitra.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Mitra({
      institutionName,
      email,
      address,
      password: hashedPassword,
    });

    await newUser.save();
  }

  async loginUser(loginData: LoginUserData): Promise<LoginResult> {
    const { email, password } = loginData;

    const user = await Mitra.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const payload: TokenPayload = {
      id: user._id.toString(),
      email: user.email,
      institutionName: user.institutionName,
    };

    const accessToken = generateToken(payload, "access");
    const refreshToken = generateToken(payload, "refresh");

    await Mitra.updateOne({ _id: user._id }, { refreshToken });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        institutionName: user.institutionName,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new Error("No refresh token provided");
    }

    const payload = verifyToken(refreshToken, "refresh");
    const accessToken = generateToken(payload, "access");

    return accessToken;
  }

  async getUserByEmail(email: string) {
    return await Mitra.findOne({ email });
  }

  async getUserById(id: string) {
    return await Mitra.findById(id);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    await Mitra.updateOne({ _id: userId }, { refreshToken });
  }

  async logout(userId: string): Promise<void> {
    await Mitra.updateOne({ _id: userId }, { $unset: { refreshToken: 1 } });
  }
}

export default new AuthService();
