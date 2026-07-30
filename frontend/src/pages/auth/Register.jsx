import AuthShell from 'sections/auth/AuthShell';
import AuthRegister from 'sections/auth/AuthRegister';

export default function Register() {
  return (
    <AuthShell
      title="SecLab hesabınızı oluşturun"
      description="Konular, öğrenme kayıtları ve kayıtlı kaynaklar için bir çalışma alanı hesabı oluşturun."
    >
      <AuthRegister />
    </AuthShell>
  );
}
