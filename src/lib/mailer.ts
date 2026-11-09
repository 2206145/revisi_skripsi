import nodemailer from "nodemailer";

/**
 * Membuat transporter Nodemailer.
 * - Jika SMTP_USER sudah diisi dan bukan placeholder → pakai Gmail SMTP
 * - Jika belum diisi → buat akun Ethereal sementara untuk testing
 */
async function createTransporter() {
  const smtpUser = process.env.SMTP_USER?.trim() || "";
  const rawPass = process.env.SMTP_PASS || "";
  const smtpPass = rawPass.replace(/\s+/g, ""); // Hapus spasi jika user paste App Password 16 karakter (misal: "abcd efgh ijkl mnop")
  const isRealConfig =
    smtpUser.length > 0 &&
    !smtpUser.includes("email-anda") &&
    !smtpUser.includes("emailanda") &&
    smtpPass.length > 0 &&
    !smtpPass.includes("xxxx");

  if (isRealConfig) {
    // Pakai konfigurasi SMTP dari .env
    const port = Number(process.env.SMTP_PORT) || 587;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: port,
      secure: port === 465, // true untuk port 465, false untuk port 587
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  // Fallback: buat akun Ethereal sementara untuk development/testing
  console.warn(
    "⚠️  SMTP belum dikonfigurasi. Menggunakan Ethereal (akun test sementara).\n" +
    "   Buka link preview di log setelah email 'dikirim' untuk melihat isinya."
  );
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
  const transporter = await createTransporter();

  const info = await transporter.sendMail({
    from: `"BKK SMK Bina Bhakti" <${process.env.SMTP_USER || "noreply@simtracer.dev"}>`,
    to,
    subject: "Reset Password – SIMTRACER BKK",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: #15803d; padding: 32px 40px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 2px;">SIMTRACER</h1>
            <p style="color: #bbf7d0; margin: 6px 0 0; font-size: 13px;">BKK SMK Bina Bhakti Mekarmukti</p>
          </div>
          <div style="padding: 36px 40px;">
            <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 12px;">Reset Password Anda</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
              Kami menerima permintaan reset password untuk akun yang terhubung dengan alamat email ini.
              Klik tombol di bawah untuk membuat password baru. Link ini hanya berlaku selama <strong>1 jam</strong>.
            </p>
            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${resetUrl}" style="display: inline-block; background: #15803d; color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">Atau salin link berikut ke browser:</p>
            <p style="color: #2563eb; font-size: 12px; word-break: break-all; margin: 0;">${resetUrl}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
              Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tidak akan berubah.<br/>
              Link ini akan kadaluarsa otomatis dalam 1 jam.
            </p>
          </div>
          <div style="background: #f3f4f6; padding: 16px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} SMK Bina Bhakti Mekarmukti</p>
          </div>
        </div>
        `,
  });

  // Jika memakai Ethereal, cetak URL preview ke terminal
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("📧 Email Preview (Ethereal) → " + previewUrl);
    console.log("   Buka link di atas untuk melihat isi email yang 'dikirim'");
  }

  return info;
}

export async function sendTracerStudyReminderEmail(to: string, namaLulusan: string) {
  const transporter = await createTransporter();
  const tracerUrl = `${process.env.NEXTAUTH_URL}/lulusan/tracer-study`;

  const info = await transporter.sendMail({
    from: `"BKK SMK Bina Bhakti" <${process.env.SMTP_USER || "noreply@simtracer.dev"}>`,
    to,
    subject: "Pengingat Pengisian Tracer Study – BKK SMK Bina Bhakti",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        <!-- Header -->
        <div style="background: #15803d; padding: 32px 40px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 2px;">SIMTRACER</h1>
          <p style="color: #bbf7d0; margin: 6px 0 0; font-size: 13px;">BKK SMK Bina Bhakti Mekarmukti</p>
        </div>
        <!-- Body -->
        <div style="padding: 36px 40px;">
          <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 12px;">Assalamu'alaikum, ${namaLulusan}</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0 0 16px;">
            Kami dari <strong>BKK SMK Bina Bhakti Mekarmukti</strong> menginformasikan bahwa Anda
            <strong>belum mengisi data Tracer Study</strong>.
          </p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0 0 28px;">
            Data Tracer Study sangat penting untuk memantau perkembangan lulusan dan meningkatkan
            kualitas pendidikan di SMK Bina Bhakti. Mohon segera melengkapi data Anda melalui
            tombol di bawah ini.
          </p>
          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${tracerUrl}"
              style="display: inline-block; background: #15803d; color: #fff; padding: 14px 36px;
                     border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
              Isi Tracer Study Sekarang
            </a>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px;">Atau salin link berikut ke browser:</p>
          <p style="color: #2563eb; font-size: 12px; word-break: break-all; margin: 0;">${tracerUrl}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
            Terima kasih atas perhatian dan kerjasamanya.<br/>
            Email ini dikirim secara otomatis oleh sistem. Jika Anda sudah mengisi Tracer Study, abaikan email ini.
          </p>
        </div>
        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 16px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} SMK Bina Bhakti Mekarmukti &nbsp;|&nbsp; BKK</p>
        </div>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("📧 Email Tracer Study Preview (Ethereal) → " + previewUrl);
  }

  return info;
}
