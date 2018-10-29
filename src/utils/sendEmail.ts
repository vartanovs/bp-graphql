import * as dotenv from 'dotenv';

dotenv.config();

import * as SparkPost from 'sparkpost';

// Connect to SparkPost using API key to generate client
const sparkPostClient = new SparkPost(process.env.SPARKPOST_API_KEY);

export const sendEmail = async (recipient: string, url: string) => {
  // Send e-mail to recipient with a link to passed in URL
  await sparkPostClient.transmissions.send({
    recipients: [{ address: recipient }],
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
    options: {
      sandbox: true,
    },
  });
};
