import fetch from 'node-fetch';

describe('Feature: Email Confirmation - Failure', () => {
  test('Clicking on an Invalid Confirmation Email link returns "invalid"', async (done) => {
    const badUrl = `${(<string>process.env.HOST)}/confirm/12345abcde`;
    const response = await fetch(badUrl);
    const text = await response.text();
    expect(text).toEqual('invalid');
    done();
  });
});
