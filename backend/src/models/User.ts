import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { UserRole } from "../types";

/**
 * User.ts — Mongoose User model (Phase 2).
 *
 * Fields:
 *  - name, email, password, role
 *  - refreshToken: stores the current refresh token (hashed)
 *  - createdAt, updatedAt: auto-managed by Mongoose timestamps
 *
 * Security:
 *  - password is hashed via bcrypt pre-save hook (never stored plain)
 *  - refreshToken is stored hashed
 *  - password & refreshToken are excluded from toJSON by default
 */

// ── Document interface ────────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;

  /** Compare a plain-text password against the stored hash */
  comparePassword(candidate: string): Promise<boolean>;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name must be at most 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned by default queries
    },
    role: {
      type: String,
      enum: ["user", "admin"] satisfies UserRole[],
      default: "user",
    },
    refreshToken: {
      type: String,
      select: false, // never returned by default queries
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
    versionKey: false,
  }
);

// ── Pre-save: hash password ───────────────────────────────────────────────────

userSchema.pre("save", async function () {
  // Only hash if the password field was modified
  if (!this.isModified("password")) return;

  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

// ── Instance method: compare password ────────────────────────────────────────

userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password as string);
};

// ── Safe JSON output (strip sensitive fields) ─────────────────────────────────

userSchema.set("toJSON", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(_doc: any, ret: any): any {
    ret.password = undefined;
    ret.refreshToken = undefined;
    return ret;
  },
});

// ── Model ─────────────────────────────────────────────────────────────────────

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
