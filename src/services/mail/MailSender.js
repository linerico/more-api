const nodemailer = require('nodemailer');

class MailSender {
    constructor() {
        this._transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_ADDRESS,
                pass: process.env.MAIL_PASSWORD,
            },
        });
    }

    sendEmailVerifikasi(targetEmail, kodeVerifikasi) {
        const message = {
            from: 'Monitoring and Report - MoRe',
            to: targetEmail,
            subject: 'Kode Verfikasi',
            text: `kode verfikasi anda : ${kodeVerifikasi}`,
        };
        console.log(message);

        return this._transporter.sendMail(message);
    }
}

module.exports = MailSender;
