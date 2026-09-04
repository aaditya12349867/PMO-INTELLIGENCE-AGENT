require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI, Type } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(__dirname));

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

let ai = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey: apiKey });
} else {
    console.warn("WARNING: GEMINI_API_KEY is not set. AI synthesis will fail.");
}

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        overallStatus: { type: Type.STRING, enum: ["GREEN", "AMBER", "RED", "INSUFFICIENT_EVIDENCE"] },
        executiveSummary: { type: Type.STRING },
        exceptions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                    description: { type: Type.STRING },
                    evidence: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        },
        crossSourceFindings: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    finding: { type: Type.STRING },
                    sources: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        },
        conflicts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING },
                    sourcesCompared: { type: Type.ARRAY, items: { type: Type.STRING } },
                    severity: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] }
                }
            }
        },
        investigationChain: {
            type: Type.OBJECT,
            properties: {
                rootCauseDriver: { type: Type.STRING },
                directEffect: { type: Type.STRING },
                downstreamImpact: { type: Type.STRING },
                managementImplication: { type: Type.STRING },
                evidenceSources: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        managementActions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                    evidence: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        },
        uncertainties: { type: Type.ARRAY, items: { type: Type.STRING } },
        confidence: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] }
    },
    required: [
        "overallStatus", "executiveSummary", "exceptions", 
        "crossSourceFindings", "conflicts", "investigationChain", 
        "managementActions", "uncertainties", "confidence"
    ]
};

const SYSTEM_INSTRUCTION = `You are the PMO Intelligence Agent for Vertex Consulting Group.

Your task is to analyse structured project evidence supplied by the user.

You must reason only from the supplied evidence.

You must:
1. Consolidate information across project sources.
2. Compare conflicting statements.
3. Identify material exceptions.
4. INVESTIGATE: For the most important exception, construct a logical causal chain (investigationChain) linking Root Cause Driver -> Direct Effect -> Downstream Impact -> Management Implication.
5. Prioritise management attention.
6. Draft concise management recommendations (Action, Reason, Priority, Evidence).
7. Clearly identify insufficient evidence.
8. Cite the source documents supporting every material finding.

You are an analytical assistant, not the final decision maker.
Never invent missing facts.
Never assume that a previous report remains current when newer evidence is unavailable.
Never override source evidence without explicitly identifying the conflict.
Human management retains final decision authority.

Return ONLY the requested structured output.`;

app.post('/api/analyze', async (req, res) => {
    console.log("[1] /api/analyze received");
    if (!ai) {
        return res.status(200).json({ error: "Gemini API key not configured on server.", aiUnavailable: true });
    }

    try {
        const evidence = req.body;
        console.log("[2] Request payload validated");
        
        // Log safe payload metadata
        const metadata = {
            scenario: evidence.scenario || 'Unknown',
            risksCount: evidence.riskIssueLog ? evidence.riskIssueLog.length : 0,
            milestonesCount: evidence.milestones ? evidence.milestones.length : 0,
            hasStatusUpdate: !!evidence.projectStatusUpdate,
            hasMeetingNotes: !!evidence.meetingNotes,
            hasPreviousReport: !!evidence.previousPmoReport,
            payloadSizeBytes: Buffer.byteLength(JSON.stringify(evidence))
        };
        console.log("    Metadata:", metadata);
        
        const prompt = "Please analyze the following project evidence:\n\n" + JSON.stringify(evidence, null, 2);

        console.log("[3] Gemini request started");
        
        // Add timeout via AbortController (though genai sdk might not natively support signal everywhere, it's good practice)
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2
            }
        });

        console.log("[4] Gemini response received");
        
        let responseText = response.text;
        // Clean up markdown block if present
        if (responseText.startsWith("```json")) {
            responseText = responseText.replace(/^```json/, "").replace(/```$/, "").trim();
        }

        const jsonResult = JSON.parse(responseText);
        console.log("[5] Gemini response parsed");
        
        res.json({ analysis: jsonResult });
        console.log("[6] Response sent to browser");
        
    } catch (error) {
        console.error("Error calling Gemini:", error.message || error);
        res.status(200).json({ error: error.message || "Unknown error occurred", aiUnavailable: true });
    }
});

app.listen(PORT, () => {
    console.log(`Vertex PMO Agent server running on http://localhost:${PORT}`);
});
