import bcrypt from 'bcryptjs';
import * as userRepo from '@/lib/repositories/user.repository';
import { toUserProfileDto, toUserSummaryDto } from '@/lib/dto/user.dto';
import { NotFoundError, UnauthorizedError, ConflictError } from '@/lib/errors';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type { UserProfile, UserSummary, CreateUserInput, UpdateUserInput } from '@/lib/types/user';
import type { PaginatedResponse } from '@/lib/types/api';

const SALT_ROUNDS = 12;

/** Register a new user account. */
export async function createUser(input: CreateUserInput): Promise<UserProfile> {
  const existing = await userRepo.findUserByEmail(input.email);
  if (existing) throw new ConflictError('Email already registered');

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await userRepo.createUser({
    email: input.email,
    passwordHash,
    name: input.name,
    phone: input.phone,
  });
  return toUserProfileDto(user);
}

/** Authenticate a user with email and password. Returns profile or throws. */
export async function authenticateWithCredentials(
  email: string,
  password: string,
): Promise<UserProfile> {
  const user = await userRepo.findUserByEmail(email);
  if (!user || !user.passwordHash) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new UnauthorizedError('Invalid email or password');

  return toUserProfileDto(user);
}

/** Get a user profile by ID. */
export async function getUserById(id: string): Promise<UserProfile> {
  const user = await userRepo.findUserById(id);
  if (!user) throw new NotFoundError('User not found');
  return toUserProfileDto(user);
}

/** Update a user's profile fields. */
export async function updateUser(id: string, input: UpdateUserInput): Promise<UserProfile> {
  const user = await userRepo.updateUser(id, input);
  return toUserProfileDto(user);
}

/** Change a user's password. */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await userRepo.findUserById(userId);
  if (!user || !user.passwordHash) throw new NotFoundError('User not found');

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) throw new UnauthorizedError('Current password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepo.updateUser(userId, { passwordHash });
}

/** Delete a user account. */
export async function deleteUser(id: string): Promise<void> {
  await userRepo.deleteUser(id);
}

/** Admin: get paginated user list with summaries. */
export async function getAllUsers(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<PaginatedResponse<UserSummary>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const { data, total } = await userRepo.findAllUsers({ page, pageSize, search: params.search });

  const summaries = await Promise.all(
    data.map(async (user) => {
      const stats = await userRepo.getUserStats(user.id);
      return toUserSummaryDto(user, stats);
    }),
  );

  return { data: summaries, total, page, pageSize };
}

/** Find or create a user from OAuth profile data. */
export async function findOrCreateFromOAuth(profile: {
  email: string;
  name: string;
  image?: string;
}): Promise<UserProfile> {
  const user = await userRepo.findOrCreateFromOAuth(profile);
  return toUserProfileDto(user);
}
