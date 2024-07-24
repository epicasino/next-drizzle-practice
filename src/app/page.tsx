import { getUserTodos } from '../lib/todoActions';
import Todos from './components/Todos';
import { redirect } from 'next/navigation';
import { getSession, login, logout, register } from '@/lib/userActions';

export default async function Home() {
  const session:
    | {
        id: string;
        username: string;
        expires: string;
        iat: number;
        exp: number;
      }
    | undefined = await getSession();
  // console.log(session);

  if (session) {
    const data = await getUserTodos(session.id);
    return (
      <>
        <form
          action={async () => {
            'use server';
            await logout();
            redirect('/');
          }}
        >
          <button type="submit">Logout</button>
        </form>
        <Todos todos={data} session={session} />
      </>
    );
  }

  return (
    <main>
      <p className="text-lg">Register</p>
      <form
        action={async (formData) => {
          'use server';
          const res = await register(formData);
          // console.log(res);
          redirect('/');
        }}
      >
        <input type="text" name="username" placeholder="username" />
        <br />
        <input type="password" name="password" placeholder="password" />
        <br />
        <button type="submit">Submit</button>
      </form>
      <p className="text-lg">Login</p>
      <form
        action={async (formData) => {
          'use server';
          const res = await login(formData);
          // console.log(res);
          redirect('/');
        }}
      >
        <input type="text" name="username" placeholder="username" />
        <br />
        <input type="password" name="password" placeholder="password" />
        <br />
        <button type="submit">Submit</button>
      </form>
    </main>
  );
}

// {
//     id: 'c8c7da63-9188-4a49-a740-808112fc0fa6',
//     username: 'asd',
//     expires: '2024-07-24T01:42:33.506Z',
//     iat: 1721781753,
//     exp: 1721785353
//   }
