import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const cacheSize = 10;
let numberCache = [];
let accessToken = null;
let tokenExpiryTime = 0;

const endpoints = {
    prime: "http://20.244.56.144/test/primes",
    fibonacci: "http://20.244.56.144/test/fibo",
    even: "http://20.244.56.144/test/even",
    random: "http://20.244.56.144/test/rand"
};

const authDetails = {
    companyName: "gogoMart",
    clientID: "9598f4df-ce64-418e-9806-598720d9170f",
    clientSecret: "PITOmmnPYcJBRxws",
    ownerName: "Shivam Joshi",
    ownerEmail: "shivam.2201044cs@iiitbh.ac.in",
    rollNo: "2201044cs"
};

async function fetchNewToken() {
    try {
        const response = await axios.post("http://20.244.56.144/test/auth", authDetails);
        accessToken = response.data.access_token;
        tokenExpiryTime = Date.now() + response.data.expires_in * 1000;
        return accessToken;
    } catch {
        throw new Error("Token retrieval failed");
    }
}

async function getToken() {
    if (!accessToken || Date.now() >= tokenExpiryTime) {
        return await fetchNewToken();
    }
    return accessToken;
}

async function fetchNumbers(type) {
    try {
        const token = await getToken();
        const response = await axios.get(endpoints[type], {
            timeout: 500,
            headers: { Authorization: Bearer ${token} }
        });
        return response.data.numbers || [];
    } catch {
        return [];
    }
}

app.get("/numbers/:type", async (req, res) => {
    const type = req.params.type;
    if (!["prime", "fibonacci", "random", "even"].includes(type)) {
        return res.status(400).json({ error: "Invalid type" });
    }

    const prevState = [...numberCache];
    const newNumbers = await fetchNumbers(type);

    newNumbers.forEach(num => {
        if (!numberCache.includes(num)) {
            numberCache.push(num);
        }
    });

    while (numberCache.length > cacheSize) {
        numberCache.shift();
    }

    const avg = numberCache.length ? (numberCache.reduce((x, y) => x + y, 0) / numberCache.length).toFixed(2) : 0;

    res.json({
        previousNumbers: prevState,
        currentNumbers: numberCache,
        fetchedNumbers: newNumbers,
        average: parseFloat(avg)
    });
});

app.listen(port, () => console.log(Server running at http://localhost:${port}));