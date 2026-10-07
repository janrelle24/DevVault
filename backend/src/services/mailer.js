const nodemailer = require('nodemailer');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
/*
async function sendOtpEmail(to, code, ttlMinutes){
    if(!process.env.SMTP_HOST && !IS_PRODUCTION){
        console.log(`[mailer] SMTP not configured. OTP for${to}: ${code}`);
        return;
    }
    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: `${code} is your DevVault verification code`,
        text:  `Your DevVault verification code is ${code}. It expires in ${ttlMinutes} minutes. \n\nIf you didn't create an account, you can ignore this email.`,
        html: `<p>Your DevVault verification code is:</p>
<p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
<p>It expires in ${ttlMinutes} minutes. If you didn't create an account, you can ignore this email.</p>`
    });
}*/
async function sendCodeEmail({ to, code, ttlMinutes, subject, intro, ignoreNote }){
    if (!process.env.SMTP_HOST && !IS_PRODUCTION) {
        console.log(`[mailer] SMTP not configured. Code for ${to}: ${code}`);
        return;
    }
    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        text: `${intro} ${code}. It expires in ${ttlMinutes} minutes.\n\n${ignoreNote}`,
        html: `<p>${intro}:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
        <p>It expires in ${ttlMinutes} minutes. ${ignoreNote}</p>`
    })
}

function sendOtpEmail(to, code, ttlMinutes){
    return sendCodeEmail({
        to,
        code, 
        ttlMinutes,
        subject: `${code} is your DevVault verification code`,
        intro: 'Your DevVault verification code is',
        ignoreNote: "If you didn't create an account, you can ignore this email."
    });
}

function sendPasswordResetEmail(to, code, ttlMinutes){
    return sendCodeEmail({
        to,
        code,
        ttlMinutes,
        subject: `${code} is your DevVault password reset code`,
        intro: 'Your DevVault password reset code is',
        ignoreNote: "If you didn't request this, you can ignore this email. Your password won't change."
    });
}

module.exports = { sendOtpEmail, sendPasswordResetEmail };