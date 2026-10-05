require('dotenv').config();
const nodemailer = require('nodemailer');

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

console.log('SMTP_HOST:', SMTP_HOST || '(EMPTY)');
console.log('SMTP_PORT:', SMTP_PORT || '(EMPTY)');
console.log('SMTP_USER:', SMTP_USER || '(EMPTY)');
console.log('SMTP_PASS:', SMTP_PASS ? 'set' : '(EMPTY)');
console.log('MAIL_FROM:', MAIL_FROM || '(EMPTY)');

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS }
});

(async () => {
    try {
        await transporter.verify();
        console.log('\n✅ Login to Brevo works.');

        const to = process.argv[2] || SMTP_USER;
        await transporter.sendMail({
            from: MAIL_FROM,
            to,
            subject: 'DevVault test email',
            text: 'If you can read this, SMTP is working.'
        });
        console.log(`✅ Test email sent to ${to}. Check inbox and spam.`);
    } catch (err) {
        console.error('\n❌ FAILED:', err.message);
    }
})();