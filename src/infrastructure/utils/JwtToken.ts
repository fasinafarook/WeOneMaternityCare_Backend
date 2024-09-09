import jwt, { JwtPayload } from "jsonwebtoken";
import IJwtToken from "../../interfaces/utils/IJwtToken";

class JwtToken implements IJwtToken {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  createJwtToken(id: string, role: string): string {
    const payload: JwtPayload = { id, role };
    const token = jwt.sign(payload, this.secret, { expiresIn: "1d" });
    return token;
  }

  verifyJwtToken(token: string): JwtPayload | null {
    try {
      const decodedToken = jwt.verify(token, this.secret) as JwtPayload;
      return decodedToken;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  otpToken(info: JwtPayload, otp: string): string {
    try {
      const payload: JwtPayload = { info, otp };
      const token = jwt.sign(payload, this.secret, { expiresIn: "5m" });
      return token;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default JwtToken;
