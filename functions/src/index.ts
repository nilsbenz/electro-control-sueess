import * as functions from 'firebase-functions';

import * as Mail from 'nodemailer/lib/mailer';
import * as nodemailer from 'nodemailer';

interface Message {
  service: string;
  area: string | undefined;
  company: string | undefined;
  form: string;
  firstname: string;
  lastname: string;
  address: string;
  domicile: string;
  phone: string;
  mail: string;
}

export const sendMail = functions.https.onRequest(async (request, response) => {
  const message = request.body as Message;
  const res = await sendEmail(message);
  response.send(res);
});

const sendEmail = async (message: Message): Promise<any> => {
  try {
    const mailFrom: string = functions.config().mail.from;
    const mailPwd: string = functions.config().mail.pwd;
    const mailTo: string = functions.config().mail.to;
    const mailHost: string = functions.config().mail.host;

    const html = htmlTemplate
      .replace(
        '[--SERVICE--]',
        message.area
          ? `${message.service}</p><p>Bereich:</p><p>${message.area}`
          : message.service
      )
      .replace(
        '[--FROM--]',
        message.company
          ? `${message.company}</p><p>${message.form} ${message.firstname} ${message.lastname}`
          : `${message.form} ${message.firstname} ${message.lastname}`
      )
      .replace('[--ADDRESS--]', message.address)
      .replace('[--DOMICILE--]', message.domicile)
      .replace('[--PHONE--]', message.phone)
      .replace(/\[--MAIL--\]/g, message.mail);

    const mailOptions = {
      from: mailFrom,
      to: message.mail || mailTo, // TODO: ändern!
      subject: `Kontaktanfrage von ${message.firstname} ${message.lastname}`,
      html,
    };

    const transporter: Mail = nodemailer.createTransport({
      host: mailHost,
      port: 587,
      secure: false,
      auth: {
        type: 'LOGIN',
        user: mailFrom,
        pass: mailPwd,
      },
    });

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

const htmlTemplate = `<link
href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik&display=swap"
rel="stylesheet"
/>

<style>
body {
  padding: 16px 8px;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
}

h1,
h2 {
  font-family: 'Rubik', sans-serif;
}

p {
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-auto-rows: auto;
  grid-gap: 16px;
}

@media screen and (min-width: 600px) {
  body {
    padding: 16px calc(50vw - 292px);
  }
}
</style>

<body>
<header>
  <h1>electro control süess gmbh</h1>
  <h2>kontakt&shy;anfrage via online&shy;kalkulator</h2>
</header>
<main>
  <div class="grid">
    <p>Dienstleistung:</p>
    <p>[--SERVICE--]</p>
    <p class="area" hidden>Bereich</p>
    <p class="area" hidden>[--AREA--]</p>
    <p>Von:</p>
    <div>
      <p>[--FROM--]</p>
      <p>[--ADDRESS--]</p>
      <p>[--DOMICILE--]</p>
      <br />
      <p>[--PHONE--]</p>
      <a href="mailto:[--MAIL--]">
        <p>[--MAIL--]</p>
      </a>
    </div>
  </div>
</main>
</body>`;
