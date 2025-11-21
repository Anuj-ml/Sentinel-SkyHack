const nodemailer = require('nodemailer');

const subscribers = new Map();

let transporter = null;
if (process.env.SMTP_EMAIL && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS
        }
    });
}

function registerSubscriber(email, metadata = {}) {
    if (!email) {
        throw new Error('Email is required to subscribe for alerts');
    }
    subscribers.set(email, {
        email,
        mission: metadata.mission || 'GENERAL',
        createdAt: new Date().toISOString()
    });
    return subscribers.get(email);
}

async function sendEmail(subject, html) {
    if (!transporter) {
        console.warn('[Alerts] SMTP credentials missing; skipping email send.');
        return { queued: false };
    }
    await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: Array.from(subscribers.keys()),
        subject,
        html
    });
    return { queued: true };
}

async function sendCriticalAlert(event) {
    if (!subscribers.size) {
        console.warn('[Alerts] No subscribers registered; skipping alert dispatch.');
        return { delivered: 0 };
    }

    const subject = `⚠️ Sentinel Critical Conjunction: ${event.satelliteId} vs ${event.debrisId}`;
    const html = `
        <h2>Critical Collision Risk</h2>
        <p><strong>Satellite:</strong> ${event.satelliteId}</p>
        <p><strong>Intruder:</strong> ${event.debrisId}</p>
        <p><strong>Probability:</strong> ${(event.probability * 100).toFixed(2)}%</p>
        <p><strong>Time to CA:</strong> ${event.timeToCA} sec</p>
        <p><strong>Relative Velocity:</strong> ${event.relativeVelocity} km/s</p>
        <p>Generated at ${new Date().toUTCString()}</p>
    `;

    await sendEmail(subject, html);
    return { delivered: subscribers.size };
}

function getSubscribers() {
    return Array.from(subscribers.values());
}

module.exports = {
    registerSubscriber,
    sendCriticalAlert,
    getSubscribers
};

