import AuthShell from 'sections/auth/AuthShell';
import AuthLogin from 'sections/auth/AuthLogin';

export default function Login() {
  return (
    <AuthShell
      title="Access your SecLab workspace"
      description="Sign in to continue managing users, learning records, topics, and saved resources."
    >
      <AuthLogin />
    </AuthShell>
  );
}
