import { Metadata } from 'next';
import RegistrationForm from './signin'; // Импорт клиентского компонента

export const metadata: Metadata = {
    title: 'Login | MESH',
    description: 'Create your account and join the digital grid',
    robots: 'noindex, nofollow',
};

export default function RegistrationPage() {
    return <RegistrationForm />;
}