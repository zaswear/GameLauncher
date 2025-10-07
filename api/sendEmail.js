// Contenido para /api/sendEmail.js
import nodemailer from 'nodemailer';

export default async function handler(request, response) {
    if (request.method !== 'POST') { return response.status(405).json({ message: 'Method Not Allowed' }); }
    const { subject, message } = request.body;
    if (!subject || !message) { return response.status(400).json({ message: 'Faltan el asunto o el mensaje.' }); }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
    try {
        await transporter.sendMail({
            from: `"What To Play Contact" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            subject: `[What To Play Contacto] ${subject}`,
            text: message,
        });
        response.status(200).json({ success: true, message: 'Correo enviado correctamente.' });
    } catch (error) {
        response.status(500).json({ success: false, message: 'No se pudo enviar el correo.' });
    }
}