import * as rp from 'request-promise';
import request = require('request');

export class TestClient {
  // Constructor Types
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

  // Echo Post Request - Returns id and email corresponding with active session
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

  // Register / LogIn Post Request (specify 'register' or 'login' with first argument)
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

  // Logout Post Request - Ends all sessions corresponding with active session
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

  // Send Forgotten Password Post Request - Locks account associated with email
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

  // Forgot Password Change Post Request - Unlocks Account with valid Key and New Password
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
};
