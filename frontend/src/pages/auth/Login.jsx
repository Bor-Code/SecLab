import AuthShell from 'sections/auth/AuthShell';
import AuthLogin from 'sections/auth/AuthLogin';

export default function Login() {
  return (
    <AuthShell
      formSide="left"
      formEyebrow="Güvenli Hesap Erişimi"
      formTitle="Hesabınıza Giriş Yapın"
      formDescription="Çalışma alanınıza kaldığınız yerden devam etmek için bilgilerinizi girin."
      eyebrow="SecLab Öğrenci Takip Sistemi"
      title="Tekrar Hoş Geldiniz"
      description="Çalışma planlarınıza, öğrenme kayıtlarınıza ve ilerleme görünümünüze güvenli biçimde erişin."
      highlights={['Çalışma Planlarınıza Devam Edin', 'İlerlemenizi Görüntüleyin', 'Kayıtlarınızı Düzenli Tutun']}
    >
      <AuthLogin />
    </AuthShell>
  );
}
