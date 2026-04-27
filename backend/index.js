require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const pseudoDb = [];
let hasLoggedEvalShape = false;

function getAuthorizationHeader() {
    const encodedCredentials = Buffer.from(`${process.env.WORKFLOW_TOKEN}:${process.env.WORKFLOW_SECRET}`).toString("base64");
    return `Basic ${encodedCredentials}`;
}

function formData(formContents) {
    return {
        name_first: formContents.firstName,
        name_last: formContents.lastName,
        address_line_1: formContents.addressLine1,
        address_line_2: formContents.addressLine2,
        address_city: formContents.city,
        address_state: formContents.state,
        address_postal_code: formContents.zip,
        address_country_code: formContents.country,
        document_ssn: formContents.ssn,
        email_address: formContents.email,
        birth_date: formContents.dob
    };
}

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/api/evaluations", async (req, res) => {
    try {
        const formContents = req.body;
        if (!formContents) {
            return res.status(400).json({ error: "Form contents are required" });
        }
        const authorizationHeader = getAuthorizationHeader();
        const payload = formData(formContents);

        const evalResponse = await fetch(
            "https://sandbox.alloy.co/v1/evaluations",
            {
                method: "POST",
                headers: {
                    "Authorization": authorizationHeader,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
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
        if (!hasLoggedEvalShape) {
            // Temporary diagnostic logging to confirm Alloy response shape.
            console.log("Evaluation response shape:", JSON.stringify(evalData, null, 2));
            hasLoggedEvalShape = true;
        }

        const outcome =
            evalData?.summary?.outcome ||
            evalData?.summary?.result ||
            evalData?.outcome ||
            "Unknown";

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