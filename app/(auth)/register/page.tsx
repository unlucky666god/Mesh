import { Metadata } from 'next';
import RegistrationForm from './signup'; // Импорт клиентского компонента

export const metadata: Metadata = {
    title: 'Registration | MESH',
    description: 'Create your account and join the digital grid',
    robots: 'noindex, nofollow',
};

export default function RegistrationPage() {
    return <RegistrationForm />;
}