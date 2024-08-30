import bcrypt from "bcryptjs";
import IHashPassword from "../../interfaces/utils/IhashPassword";

class HashPassword implements IHashPassword {

  async hash(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async compare(password: string, hashedPassword: string) {
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    return passwordMatch
  }
}

export default HashPassword;