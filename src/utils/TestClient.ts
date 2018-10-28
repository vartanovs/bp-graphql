import * as rp from 'request-promise';
import request = require('request');

export class TestClient {
  goodPass: string;
  url: string;
  options: {
    jar: request.CookieJar,
    json: boolean,
    withCredentials: boolean,
  };

  constructor(url: string) {
    this.goodPass = 's3cretp@ssw0rd',
    this.url = url,
    this.options = {
      jar: rp.jar(),
      json: true,
      withCredentials: true,
    }
  };

  async echo() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query:`
        {
          echo {
            id
            email
          }
        }
        `,
      },
    })
  };

  async mutation (type: string, email: string, password: string = this.goodPass) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `mutation { 
          ${type}(email: "${email}", password: "${password}") {
            path
            message
          }
        }`
      },
    });
  };

  async logout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          logout
        }
      `,
      },
    })
  };

  async sendForgotPasswordEmail(email: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            sendForgotPasswordEmail(email: "${email}") {
              path
              message
            }
          }
        `
      }
    });
  };

  async forgotPasswordChange(newPassword: string, key: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            forgotPasswordChange(newPassword: "${newPassword}", key: "${key}") {
              path
              message
            }
          }
        `
      }
    });
  };

}