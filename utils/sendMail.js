import nodemailer from "nodemailer";

const sendMail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTPHOSTNAME,
      service: process.env.SMTPSERVICE,
      port: process.env.SMTPPORT,
      secure: false,
      auth: {
        user: process.env.SMTPSENDEREMAIL,
        pass: process.env.SMTPAUTHPASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTPSENDEREMAIL,
      to: email,
      subject: subject,
      // text: text,
      html: `<html>
      <head>
          <style>
              body {
                  font-family: Arial, sans-serif;
              }
              .email-container {
                  width: 100%;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  text-align: center;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #007bff;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 5px;
              }
              .button:hover {
                  background-color: #0056b3;
              }
              .button a {
                color: white;
                text-decoration: none;
            }
          </style>
      </head>
      <body>
          <div class="email-container">
              <h1>Aventura Account Verification</h1>
              <p>Hello,</p>
              <p>We're happy you signed up for AVENTURA.<br> To start exploring the site please confirm your email address.:</p>
              <a href="${text}"  class="button">Verify</a>
              
              <p>If you have any questions or need assistance, please contact our support team.</p>
          </div>
      </body>
      </html>
      `,
    });
    console.log("email sent successfully");
  } catch (error) {
    console.log("Email not sent");
    console.log(error);
  }
};
export default sendMail;

export const sendRejectionMail = async (email, subject, reason) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTPHOSTNAME,
      service: process.env.SMTPSERVICE,
      port: process.env.SMTPPORT,
      secure: false,
      auth: {
        user: process.env.SMTPSENDEREMAIL,
        pass: process.env.SMTPAUTHPASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTPSENDEREMAIL,
      to: email,
      subject: subject,
      html: `<html>
            <body>
                <h1>Virtual Care Account verification</h1>                
                    <img src="https://youroata.com/wp-content/uploads/2019/07/158467_582x327.png" alt="Verification Image" width="300" height="200"><br>
                    <div>
                    <p>Your Account Verification is rejected due To Below Reasons,
                     Please check and Resubmit your Documents In Your Profile</p>
                   <h3>${reason}</h3>
                </div>
        
                <p>If you have any questions or need assistance, please contact our support team.</p>
            </body>
        </html>`,
    });
    console.log("email sent successfully");
  } catch (error) {
    console.log("Email not sent");
    console.log(error);
  }
};
