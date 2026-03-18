import { redirect } from 'next/navigation';

export default function InscriptionPage() {
    redirect('/login?mode=signup');
}
