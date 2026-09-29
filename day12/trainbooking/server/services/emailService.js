const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: `"RailBook" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your RailBook verification code",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
        background: #f8fafc;
      ">

        <div style="
          background: white;
          border-radius: 16px;
          padding: 35px;
          border: 1px solid #e2e8f0;
        ">

          <h1 style="
            color: #991b1b;
            margin: 0 0 10px;
          ">
            RailBook
          </h1>

          <p style="
            color: #475569;
            font-size: 16px;
            line-height: 1.6;
          ">
            Use the verification code below to verify your
            email address.
          </p>

          <div style="
            text-align: center;
            margin: 30px 0;
          ">

            <div style="
              display: inline-block;
              padding: 18px 30px;
              background: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 12px;
              color: #991b1b;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
            ">
              ${otp}
            </div>

          </div>

          <p style="
            color: #475569;
            font-size: 14px;
          ">
            This verification code will expire in
            <strong>5 minutes</strong>.
          </p>

          <p style="
            color: #64748b;
            font-size: 13px;
            margin-top: 25px;
          ">
            If you did not request this code, you can safely
            ignore this email.
          </p>

          <p style="
            color: #94a3b8;
            font-size: 12px;
            margin-top: 25px;
          ">
            RailBook — Train Ticket Booking System
          </p>

        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendOtpEmail,
};
