import { redirect } from 'next/navigation';

// Demo deployment — no auth, no login. Anyone hitting /login goes straight in.
export default function LoginPage() {
  redirect('/dashboard');
}
