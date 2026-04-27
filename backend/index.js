import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map(s => s.trim()) : true }));
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
        const basic = "Basic " + Buffer.from(t + ":" + s).toString("base64");

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

        const r = await fetch("https://sandbox.alloy.co/v1/evaluations", {
            method: "POST",
            headers: { Authorization: basic, "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!r.ok) {
            return res.status(502).json({ error: "Alloy error", details: await r.text() });
        }

        const data = await r.json();
        const raw =
            data.summary?.outcome ?? data.summary?.result ?? data.outcome ?? "Unknown";
        const outcome = typeof raw === "string" ? raw.trim() : String(raw);
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

const dist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(path.join(dist, "index.html"))) {
    app.use(express.static(dist, { index: "index.html" }));
    app.use((req, res) => {
        if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
        if (req.method !== "GET" && req.method !== "HEAD") return res.status(404).end();
        res.sendFile(path.join(dist, "index.html"));
    });
}

const port = process.env.PORT || 3001;
app.listen(port, () => console.log("on", port));
