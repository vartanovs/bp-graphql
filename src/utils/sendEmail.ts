import * as dotenv from 'dotenv';

dotenv.config();

import * as SparkPost from 'sparkpost';

const client = new SparkPost(process.env.SPARKPOST_API_KEY);

export const sendEmail = async (recipient: string, url: string) => {
  console.log('Recipient: ', recipient);
  console.log('URL: ', url);

  await client.transmissions.send({
    options: {
      sandbox: true,
    },
    content: {
      from: 'testing@sparkpostbox.com',
      subject: 'Confirm Email',
      html:
        `<html>
          <body>
            <p>Please <a href='${url}'>click here</a> to confirm your e-mail address.</p>
          </body>
        </html>`,
    },
    recipients: [{ address: recipient }],
  });
}