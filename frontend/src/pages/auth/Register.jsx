import AuthShell from 'sections/auth/AuthShell';
import AuthRegister from 'sections/auth/AuthRegister';

export default function Register() {
  return (
    <AuthShell
      title="Create your SecLab account"
      description="Start a workspace account for topics, learning logs, and saved resources."
    >
      <AuthRegister />
    </AuthShell>
  );
}
