import AuthShell from 'sections/auth/AuthShell';
import AuthRegister from 'sections/auth/AuthRegister';

export default function Register() {
  return (
    <AuthShell
      formSide="right"
      formEyebrow="Yeni Öğrenci Hesabı"
      formTitle="Hesabınızı Oluşturun"
      formDescription="Kişisel çalışma alanınızı oluşturmak için bilgilerinizi eksiksiz girin."
      eyebrow="SecLab'a Hoş Geldiniz"
      title="Öğrenme Yolculuğunuzu Bugün Başlatın"
      description="Hedeflerinizi belirleyin, çalışma planınızı oluşturun ve gelişiminizi tek merkezden düzenli biçimde takip edin."
      highlights={['Kişisel Çalışma Alanınızı Kurun', 'Hedef ve Planlarınızı Takip Edin', 'Gelişiminizi Düzenli Kaydedin']}
    >
      <AuthRegister />
    </AuthShell>
  );
}
