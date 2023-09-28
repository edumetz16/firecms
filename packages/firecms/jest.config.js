/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        // "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
        //     "<rootDir>/__mocks__/fileMock.js",
        "\\.(css|less)$": "<rootDir>/test/__mocks__/styleMock.js",
    }
};
