const nodemailer = require('nodemailer');

const sendEmail = async options => {
    //1) Create a transporter
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    });

    //2) Define the email options
    const mailOptions = {
        from:'Pavan Mudavath <hello@pavan.io>',
        to:options.email,
        subject:options.subject,
        text:options.message
    }

    //3) Actually send the email
    await transporter.sendMail(mailOptions);
    
};



// NODE_ENV=development
// PORT=3000
// MONGODB_URI=mongodb+srv://mudavathpavankumar822:e-commerce@cluster0.1sok3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

// JWT_SECRET=some-secret-message-for-the-secured-key
// JWT_EXPIRES_IN=90d
// JWT_COOKIE_EXPIRES_IN=90


// EMAIL_USERNAME=f7a0d8e264bd1a  
// EMAIL_PASSWORD=f88240b1885ff6
// EMAIL_HOST = sandbox.smtp.mailtrap.io
// EMAIL_PORT = 25


// LEMON_SQUEEZY_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJmZDkzMDUxYmM5MDI5YTFkZTMzMmFjMGQ5MWE0YjE3NjU1MGQ1NjZkZjcyOWJiMTJmMmFmOGRmZTk5NGQxOWQzOWUzNjc1Njc4ZTY3MTcwZSIsImlhdCI6MTczOTk4MzcwMy4yOTU2NTgsIm5iZiI6MTczOTk4MzcwMy4yOTU2NiwiZXhwIjoyMDU1NTE2NTAzLjI1MTIsInN1YiI6IjI5NTY0MzUiLCJzY29wZXMiOltdfQ.OEhTJmIpub4hO6vXyvDrrHpiuMoY5OshEt9HVGHnK7sQLBb2yiJxRXBrK5Ru7aHdCgf0i4Td6x4tLy0221bLGoCxb9pvsoSGD_eUYUtzMeJqtfhiGBdRw6E5wChEWqtAzp4m_3CzIMF5wcKFCgSdEC7UCsaVpEDJvWSROClnLoyrvu0_qudVw_ecFmtFN8Q8rmrCsRkGZ9cmEzhGsNdpKqOHEB9oiLLCJXpl2BefD5UZ02BwfEIP88FEKmaHKwoGWaK6grgJsxCstsq56APkNkAKZQ2CxbjoA8WhR9Cwuw5kJqipWxYYsmhwY5rTQhuGDaYbteMW32JCsy0H2f65NVhOeRCea_sHXqOPaG_Mpgn8K4zE7J78TGZaq83zjrRRzXszvrfOtD9jywafIPdXW6CdPAvBpyC20dgmy4Z3xC9y6b3HNWJXXOU5ZOQsrt19xLVZApbw4QrebGiizLzWwXzLMyMRK4JKVxe-cQ_sdaA0S-HLY7TobpxirXYP1MP6
// LEMON_SQUEEZY_STORE_ID=149592
// MONTHLY_PLAN_VARIANT_ID=699892
// YEARLY_PLAN_VARIANT_ID=699894
// LEMON_SQUEEZY_WEBHOOK_SECRET=webhooksecretfortwitter
// NODE_ENV=development




// # NODE_ENV=development
// # PORT=3000
// # DATABASE=mongodb+srv://mudavathpavankumar822:<PASSWORD>@cluster0.m2qfe.mongodb.net/natours?retryWrites=true
// # DATABASE_LOCAL=mongodb://localhost:27017/natours
// # DATABASE_PASSWORD=natours

// # JWT_SECRET=some-secret-message-for-the-secured-key
// # JWT_EXPIRES_IN=90d
// # JWT_COOKIE_EXPIRES_IN=90

// # EMAIL_USERNAME=f7a0d8e264bd1a  
// # EMAIL_PASSWORD=f88240b1885ff6
// # EMAIL_HOST = sandbox.smtp.mailtrap.io
// # EMAIL_PORT = 25


module.exports =  sendEmail;