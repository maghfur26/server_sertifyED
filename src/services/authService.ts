// services/authService.ts
import bcrypt from "bcrypt";
import Organization from "../models/Organization";
import { generateToken, verifyToken } from "../utils/jwtUtils";
import { TokenPayload } from "../types/tokenPayload";
import type { RegisterUserData, LoginUserData, LoginResult, RegisterInstitutionData } from "../types/authType";
import User from "../models/User";

class AuthService {
  // register user as recipient
  async registerUser(userData: RegisterUserData): Promise<void> {
    const { fullname, email, password, address } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }
    const newUser = new User({
      name: fullname,
      email,
      password,
      role: "student",
      walletAddress: address,
    });
    await newUser.save();
  }

  // register user as institution(issuer)
  async registerInstitution(userData: RegisterInstitutionData): Promise<void> {
    const { institutionName, email, password, address } = userData;

    const existingUser = await Organization.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Organization({
      institutionName,
      email,
      password: hashedPassword,
      address,
    });

    await newUser.save();
  }

  async loginUser(loginData: LoginUserData): Promise<LoginResult> {
    const { email, password } = loginData;

    try {
      let payload: TokenPayload;
      let accessToken: string, refreshToken: string;

      // Check if the uer is a student or an issuer
      const issuer = await Organization.findOne({ email });

      if (!issuer) {
        const m = await User.findOne({ email });

        if (!m) {
          throw new Error("User not found");
        }
        const isPasswordValid = await bcrypt.compare(password, m?.password as string);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }
        // If the user is a student, create a payload with user details
        payload = {
          id: m?._id.toString() as string,
          email: m?.email as string,
          owner: m?.name,
          walletAddress: m?.walletAddress,
          role: "student",
        };

        // Generate tokens for the user
        accessToken = generateToken(payload, "access");
        refreshToken = generateToken(payload, "refresh");

        // Update the user's refresh token in the database
        await User.updateOne({ _id: payload.id }, { refreshToken });
      } else {
        // If the user is an issuer, create a payload with issuer details
        const isPasswordValid = await bcrypt.compare(password, issuer.password as string);
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }
        // Generate tokens for the issuer
        payload = {
          email: issuer.email,
          id: issuer._id.toString(),
          owner: issuer.institutionName,
          walletAddress: issuer.address,
          role: "issuer",
        };
        // Generate access and refresh tokens
        accessToken = generateToken(payload, "access");
        refreshToken = generateToken(payload, "refresh");

        // Update the issuer's refresh token in the database
        await Organization.updateOne({ _id: payload.id }, { refreshToken });
      }

      return {
        accessToken,
        refreshToken,
      };
    } catch (error: Error | any) {
      throw new Error(error.message);
    }
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
    return await Organization.findOne({ email });
  }

  async getUserById(id: string) {
    return await Organization.findById(id);
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await Organization.updateOne({ _id: userId }, { refreshToken });
  }

  async logout(userId: string): Promise<void> {
    await Organization.updateOne({ _id: userId }, { $unset: { refreshToken: 1 } });
  }
}

export default new AuthService();
