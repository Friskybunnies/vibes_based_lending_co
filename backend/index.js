require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const pseudoDb = [];

function getAuthorizationHeader() {
    const { WORKFLOW_TOKEN, WORKFLOW_SECRET } = process.env;

    const encodedCredentials = Buffer.from(`${WORKFLOW_TOKEN}:${WORKFLOW_SECRET}`).toString("base64");
    return `Basic ${encodedCredentials}`;
}

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/api/evaluations", async (req, res) => {
    try {
        const formContents = req.body;
        const authorizationHeader = getAuthorizationHeader();

        if (!formContents) {
            return res.status(400).json({ error: "Form contents are required" });
        }

        const evalResponse = await fetch(
            "https://sandbox.alloy.co/v1/evaluations",
            {
                method: "POST",
                headers: {
                    "Authorization": authorizationHeader,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formContents),
            }
        );

        if (!evalResponse.ok) {
            const errorText = await evalResponse.text();
            return res.status(502).json({
                error: "Request failed",
                details: errorText
            });
        }

        const evalData = await evalResponse.json();

        const outcome = evalData?.summary?.outcome || "Unknown";

        const submission = {
            id: Date.now().toString(),
            formContents,
            outcome,
            createdAt: new Date().toISOString()
        };

        pseudoDb.push(submission);

        res.json(submission);

    } catch (err) {
        console.error("Server error:", err);

        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
});

app.get("/api/evaluations", (req, res) => {
    res.json(pseudoDb);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});