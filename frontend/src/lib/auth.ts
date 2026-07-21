import { prisma } from "./prisma";
import { hashPassword, comparePassword } from "./password";

export { prisma, hashPassword, comparePassword };