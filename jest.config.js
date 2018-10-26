module.exports = {
  globalSetup: "./src/testSetup/callSetup.js",
  globalTeardown: "./src/testSetup/callTeardown.js",
  transform: {
      "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
