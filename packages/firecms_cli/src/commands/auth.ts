import open from "open";

import fs from "fs";
import http from "http";
import path from "path";
import axios from "axios";
import { DEFAULT_SERVER } from "../common";
import * as os from "os";

const https = require("https");
const url = require("url");

export async function getCurrentUser(): Promise<object | null> {
    const userCredential = await getTokens();
    if (!userCredential) {
        return null;
    }
    return parseJwt(userCredential["id_token"]);
}

export async function login() {

    const currentUser = await getCurrentUser();
    if (currentUser) {
        console.log("You are already logged in as", currentUser["email"]);
        console.log("Run 'firecms logout' to sign out");
        return;
    }

    const server = http.createServer(async function (req, res) {

        res.setHeader("Cache-Control", "no-store, max-age=0");

        // Example on redirecting user to Google's OAuth 2.0 server.
        if (req.url == "/") {
            const authURL = await getAuthURL();
            res.writeHead(301, { "Location": authURL });
            res.end();
        }

        // Receive the callback from Google's OAuth 2.0 server.
        if (req.url.startsWith("/oauth2callback")) {
            // Handle the OAuth 2.0 server response
            let q = url.parse(req.url, true).query;

            if (q.error) { // An error response e.g. error=access_denied
                console.log("Error:" + q.error);
            } else {
                const tokens = await exchangeCodeForToken(q.code);
                saveTokens(tokens);
                console.log("You have successfully logged in.")
            }

            fs.readFile(path.join(__dirname, "/../../html/done.html"),
                function (err, data) {
                    if (err) {
                        res.writeHead(404);
                        res.end(JSON.stringify(err));
                        return;
                    }
                    res.writeHead(200);
                    res.end(data);
                    server.close();
                });

        }

        // if (req.url == "/revoke") {
        //     console.log("Revoking token");
        //     const userCredential = await getTokens();
        //     if (userCredential) {
        //         revokeToken(userCredential["access_token"]);
        //     }
        //     res.end();
        // }

    }).listen(3000);

    open("http://localhost:3000");
}

// save this token to a file in .firecms or program data
function saveTokens(tokens: object) {
    const dirPath = path.join(os.homedir(), ".firecms");

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    const filePath = path.join(dirPath, "tokens.json");

    const data = JSON.stringify(tokens);

    fs.writeFile(filePath, data, (error) => {
        if (error) throw error;
        console.log("File is written successfully.");
    });

}

export async function logout() {

    const userCredential = await getTokens();
    if (!userCredential) {
        console.log("You are not logged in");
        console.log("Run 'firecms login' to log in");
        return;
    }

    revokeToken(userCredential["access_token"]);

    const dirPath = path.join(os.homedir(), ".firecms");
    const filePath = path.join(dirPath, "tokens.json");
    fs.unlinkSync(filePath);
    console.log("You have successfully logged out.")
}

export async function getTokens(): Promise<object | null> {
    const dirPath = path.join(os.homedir(), ".firecms");
    const filePath = path.join(dirPath, "tokens.json");

    if (!fs.existsSync(filePath)) {
        return null;
    }

    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(JSON.parse(data));
        });
    });
}

function revokeToken(accessToken: string) {
    // Build the string for the POST request
    let postData = "token=" + accessToken;

    // Options for POST request to Google's OAuth 2.0 server to revoke a token
    let postOptions = {
        host: "oauth2.googleapis.com",
        port: "443",
        path: "/revoke",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(postData)
        }
    };

    // Set up the request
    const postReq = https.request(postOptions, function (res) {
        res.setEncoding("utf8");
        res.on("data", d => {
            console.log("Response: " + d);
        });
    });

    postReq.on("error", error => {
        console.log(error)
    });

    // Post the request with data
    postReq.write(postData);
    postReq.end();
}

export function parseJwt(token: string): object {
    if (!token) {
        throw new Error("No JWT token");
    }
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const buffer = Buffer.from(base64, "base64");
    const jsonPayload = decodeURIComponent(buffer.toString().split("").map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));

    return JSON.parse(jsonPayload);
}

async function getAuthURL() {
    const response = await axios.get(DEFAULT_SERVER + "/cli/generate_auth_url", {
        params: {
            redirect_uri: "http://localhost:3000/oauth2callback/"
        }
    });

    return response.data.data;
}

export async function refreshCredentials(credentials?: object) {
    if (credentials) {
        const expiryDate = new Date(credentials["expiry_date"]);
        const now = new Date();
        if (expiryDate.getTime() > now.getTime()) {
            return credentials;
        }
    }
    const response = await axios.post(DEFAULT_SERVER + "/cli/refresh_access_token", credentials);
    const newCredentials = response.data.data;
    saveTokens({ ...credentials, ...newCredentials });
    return newCredentials;
}

async function exchangeCodeForToken(code: string) {
    const response = await axios.get(DEFAULT_SERVER + "/cli/exchange_code_for_token", {
        params: {
            code
        }
    });

    return response.data.data;
}


