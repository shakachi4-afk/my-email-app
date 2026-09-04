const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const { to, subject, htmlBody, delaySeconds, fileBase64, fileName } = data;

    // Optional short timer delay
    if (delaySeconds && delaySeconds > 0) {
      const waitTime = Math.min(delaySeconds, 8) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Connect to AOL SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.aol.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.AOL_EMAIL,
        pass: process.env.AOL_APP_PASSWORD,
      },
    });

    // Configure Email
    const mailOptions = {
      from: process.env.AOL_EMAIL,
      to: to,
      subject: subject,
      html: htmlBody,
      attachments: [],
    };

    // Attach File if provided
    if (fileBase64 && fileName) {
      mailOptions.attachments.push({
        filename: fileName,
        content: fileBase64.split(",")[1] || fileBase64,
        encoding: "base64",
      });
    }

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Sent successfully!" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
