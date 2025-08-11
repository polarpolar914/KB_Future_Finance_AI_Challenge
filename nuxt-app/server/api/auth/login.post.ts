import { readBody, createError } from 'h3';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const schema = z.object({
  username: z.string(),
  password: z.string(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = schema.parse(body);
  const user = process.env.ADMIN_USER || 'admin';
  const pass = process.env.ADMIN_PASSWORD || 'password';
  if (username !== user || password !== pass) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
  }
  const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });
  return { token };
});
