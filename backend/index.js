require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
            : true
    })
);
app.use(express.json());

const store = [];

function authHeader() {
    const t = process.env.WORKFLOW_TOKEN;
    const s = process.env.WORKFLOW_SECRET;
    const b64 = Buffer.from(`${t}:${s}`).toString("base64");
    return `Basic ${b64}`;
}

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/api/evaluations", async (req, res) => {
    try {
        const body = req.body;
        if (!body) {
            return res.status(400).json({ error: "Form contents are required" });
        }

        const payload = {
            name_first: body.firstName,
            name_last: body.lastName,
            address_line_1: body.addressLine1,
            address_line_2: body.addressLine2,
            address_city: body.city,
            address_state: body.state,
            address_postal_code: body.zip,
            address_country_code: body.country,
            document_ssn: body.ssn,
            email_address: body.email,
            birth_date: body.dob
        };

        const alloyRes = await fetch("https://sandbox.alloy.co/v1/evaluations", {
            method: "POST",
            headers: {
                Authorization: authHeader(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!alloyRes.ok) {
            const text = await alloyRes.text();
            return res.status(502).json({ error: "Request failed", details: text });
        }

        const data = await alloyRes.json();
        const outcome =
            data.summary?.outcome || data.summary?.result || data.outcome || "Unknown";

        const row = {
            id: String(Date.now()),
            formContents: body,
            outcome,
            createdAt: new Date().toISOString()
        };
        store.push(row);
        res.json(row);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

app.get("/api/evaluations", (req, res) => {
    res.json(store);
});

const distPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, "index.html"))) {
    app.use(express.static(distPath, { index: "index.html" }));
    app.use((req, res) => {
        if (req.path.startsWith("/api")) {
            return res.status(404).json({ error: "Not found" });
        }
        if (req.method !== "GET" && req.method !== "HEAD") {
            return res.status(404).end();
        }
        res.sendFile(path.join(distPath, "index.html"));
    });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});