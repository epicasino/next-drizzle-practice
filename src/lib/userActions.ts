'use server';
import 'dotenv/config';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import db from '@/db/drizzle';
import { user } from '@/db/schema';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

const secretKey = process.env.SECRET_KEY;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);
}

// could delete the Promise<any>
export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function register(formData: FormData) {
  const saltRounds = process.env.SALT_ROUNDS || 4;

  try {
    const userData = {
      username: formData.get('username')?.toString(),
      password: formData.get('password')?.toString(),
    };

    if (userData.username && userData.password) {
      const registerUser = await db
        .insert(user)
        .values({
          username: userData.username,
          password: bcrypt.hashSync(userData.password, saltRounds),
        })
        .returning({ id: user.id, username: user.username });
      console.log(registerUser);
      const expires = new Date(Date.now() + 3600 * 1000);
      const session = await encrypt({
        id: registerUser[0].id,
        username: registerUser[0].username,
        expires,
      });

      cookies().set('session', session, { expires, httpOnly: true });
      return registerUser[0];
    }
  } catch (err) {
    console.error(err);
  }
}

export async function login(formData: FormData) {
  try {
    const userData = {
      username: formData.get('username')?.toString(),
      password: formData.get('password')?.toString(),
    };

    if (userData.username && userData.password) {
      const loginUser = await db
        .select()
        .from(user)
        .where(eq(user.username, userData.username));
      // console.log(loginUser);
      if (
        loginUser[0] &&
        bcrypt.compareSync(userData.password, loginUser[0].password)
      ) {
        const expires = new Date(Date.now() + 3600 * 1000);
        const session = await encrypt({
          id: loginUser[0].id,
          username: loginUser[0].username,
          expires,
        });
        cookies().set('session', session, { expires, httpOnly: true });
        return loginUser[0];
      }
    }
  } catch (err) {
    console.error(err);
  }
}

export async function logout() {
  // Destroy the session
  cookies().set('session', '', { expires: new Date(0) });
}

export async function getSession() {
  const session = cookies().get('session')?.value;
  if (!session) return;
  return await decrypt(session);
}

// export async function updateSession(req: NextRequest) {
//   const session = req.cookies.get('session')?.value;
//   if (!session) return;

//   const parsed = await decrypt(session);
//   parsed.expires = new Date(Date.now() + 3600 * 1000);
//   const res = NextResponse.next();
//   res.cookies.set({
//     name: 'session',
//     value: await encrypt(parsed),
//     httpOnly: true,
//     expires: parsed.expires,
//   });
//   return res;
// }
