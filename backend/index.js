require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ ok: true });
});

app.post("/api/evaluations", async (req, res) => {
    try {
        const body = req.body;
        if (!body) return res.status(400).json({ error: "Missing body" });
        if (body.country !== "US") {
            return res.status(400).json({ error: "Country must be US" });
        }

        const t = process.env.WORKFLOW_TOKEN;
        const s = process.env.WORKFLOW_SECRET;
        const auth = "Basic " + Buffer.from(t + ":" + s).toString("base64");

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

        const evaluation = await fetch("https://sandbox.alloy.co/v1/evaluations", {
            method: "POST",
            headers: { Authorization: auth, "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!evaluation.ok) {
            return res.status(500).json({ error: "Evaluation error", details: await evaluation.text() });
        }

        const data = await evaluation.json();
        const contents =
            data.summary?.outcome ?? data.summary?.result ?? data.outcome ?? "Unknown";
        const outcome = typeof contents === "string" ? raw.trim() : String(contents);
        res.json({
            id: String(Date.now()),
            formContents: body,
            outcome,
            createdAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

/* 
This section exists pecifically for Docker and Railway, 
given that a Vite process for serving the React front end only exists in dev, 
and the onus in production falls back to the server to serve the front end 
*/

const dist = path.join(__dirname, "../frontend/dist");
const indexHtml = path.join(dist, "index.html");
app.use(express.static(dist, { index: "index.html" }));
app.use((req, res) => {
    // if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
    // if (req.method !== "GET" && req.method !== "HEAD") return res.status(404).end();
    res.sendFile(indexHtml);
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log("on", port));
