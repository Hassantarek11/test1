import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), ".env.example"), override: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to send verification emails via Nodemailer
  app.post("/api/send-email", async (req, res) => {
    try {
      const { to, subject, html, text } = req.body;
      
      if (!to || !subject) {
        return res.status(400).json({ error: "Missing required fields: to or subject" });
      }

      const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").replace(/^["']|["']$/g, "").trim();
      const smtpPort = parseInt((process.env.SMTP_PORT || "465").replace(/^["']|["']$/g, "").trim(), 10);
      const smtpUser = (process.env.SMTP_USER || "").replace(/^["']|["']$/g, "").trim();
      const smtpPass = (process.env.SMTP_PASS || "").replace(/^["']|["']$/g, "").trim();

      if (!smtpUser || !smtpPass) {
        return res.status(400).json({ 
          error: "SMTP credentials are not configured", 
          code: "SMTP_NOT_CONFIGURED",
          messageAr: "يرجى تهيئة متغيرات البريد الإلكتروني (SMTP_USER و SMTP_PASS) في إعدادات البيئة لإرسال رسائل حقيقية."
        });
      }

      console.log(`[SMTP Debug] Host: ${smtpHost}, Port: ${smtpPort}, User: ${smtpUser}, Pass Length: ${smtpPass.length}, Starts With: ${smtpPass.substring(0, 3)}...`);

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"سيستم المتابعة التعليمي" <${smtpUser}>`,
        to,
        subject,
        text,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent: %s", info.messageId);

      return res.json({ success: true, messageId: info.messageId });
    } catch (err: any) {
      console.error("Failed to send email:", err);
      
      let messageAr = "فشل إرسال البريد الإلكتروني. يرجى مراجعة إعدادات خادم البريد (SMTP).";
      let code = "SMTP_FAILED";
      
      const errStr = String(err.message || err);
      if (errStr.includes("535") || errStr.toLowerCase().includes("auth") || errStr.toLowerCase().includes("login")) {
        code = "SMTP_AUTH_FAILED";
        messageAr = "خطأ في تسجيل الدخول لخادم البريد (535 Invalid Login). إذا كنت تستخدم Gmail، يجب عليك إنشاء واستخدام 'كلمة مرور التطبيق' (App Password) بدلاً من كلمة المرور العادية لحساب Google الخاص بك. يرجى التأكد أيضاً من صحة البريد الإلكتروني المدخل في SMTP_USER.";
      } else if (errStr.toLowerCase().includes("timeout") || errStr.toLowerCase().includes("connect")) {
        code = "SMTP_CONNECTION_FAILED";
        messageAr = "فشل الاتصال بخادم البريد (Connection/Timeout). يرجى التأكد من أن منفذ الخادم (SMTP_PORT) وعنوان الخادم (SMTP_HOST) صحيحين ولا يتم حظرهما.";
      }

      return res.status(500).json({ 
        error: err.message || "Internal server error", 
        code,
        messageAr
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
