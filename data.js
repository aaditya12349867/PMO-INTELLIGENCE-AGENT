/* ═══════════════════════════════════════════════════════════
   VERTEX PMO INTELLIGENCE AGENT — Scenario Data Engine
   Contains multiple project scenarios for dynamic analysis
   ═══════════════════════════════════════════════════════════ */

var PROJECT_META = {
    name: "Digital Transformation Programme",
    id: "VCG-DT-2026",
    reportingPeriod: "September 2026",
    projectManager: "Sarah Mitchell",
    programmeSponsor: "Chief Transformation Officer"
};

var SCENARIOS = {
    // ══════════════════════════════════════════════════════════
    // SCENARIO 1: Integration Recovery Risk
    // ══════════════════════════════════════════════════════════
    integration_recovery: {
        id: "integration_recovery",
        name: "Integration Recovery Risk",
        statusUpdate: {
            reportedOverallStatus: "AMBER",
            reportedScheduleStatus: "GREEN",
            reportedBudgetStatus: "GREEN",
            reportedRiskStatus: "AMBER",
            overallProgress: 62,
            plannedProgress: 75,
            currentPhase: "Implementation",
            reportingPeriod: "September 2026",
            keyUpdate: "The project team reports that implementation is progressing well, although integration dependencies remain under review.",
            workstreamStatus: [
                { name: "Technology & Platform", status: "GREEN" },
                { name: "System Integration", status: "AMBER", notes: "Integration dependencies remain under review. Vendor API access unresolved." },
                { name: "Data Migration", status: "AMBER", notes: "Data quality checks in progress. Potential rework before UAT." },
                { name: "User Acceptance Testing", status: "GREEN", notes: "UAT preparation activities on track." },
                { name: "Change Management", status: "GREEN" }
            ],
            keyAchievements: ["Core platform configuration completed on schedule.", "Solution design approved by all stakeholders."],
            keyConcerns: ["Core system integration dependency on vendor API access.", "Data migration quality requires additional validation before UAT."],
            projectManagerComment: "The programme is progressing, and the team is focused on resolving the outstanding integration dependencies. We are confident that with appropriate management support, the current delays can be recovered."
        },
        riskLog: [
            { id: "R-01", type: "Risk", name: "Core system integration delay", description: "Core system integration delay due to vendor API dependency", severity: "High", probability: "High", impact: "Potential 3-week delay to the integration milestone", owner: "Technology Lead", status: "Open", mitigation: "Escalation to vendor account manager initiated" },
            { id: "R-02", type: "Risk", name: "Data migration quality", description: "Data migration quality issues may require rework", severity: "Medium", probability: "Medium", impact: "Potential rework required before UAT", owner: "Data Lead", status: "Open", mitigation: "Additional data validation checks added to migration process" },
            { id: "I-01", type: "Issue", name: "Vendor dependency unresolved", description: "Vendor API access has not been confirmed", severity: "High", probability: "Confirmed", impact: "Integration testing cannot begin until vendor API access is confirmed", owner: "Programme Manager", status: "Open", mitigation: "Formal escalation to vendor senior management" }
        ],
        milestones: [
            { id: "M-01", milestone: "Requirements Complete", plannedDate: "15 Jun 2026", forecastDate: "15 Jun 2026", actualDate: "15 Jun 2026", status: "Complete", varianceDays: 0, dependency: "None", critical: false },
            { id: "M-02", milestone: "Solution Design", plannedDate: "15 Jul 2026", forecastDate: "15 Jul 2026", actualDate: "15 Jul 2026", status: "Complete", varianceDays: 0, dependency: "M-01", critical: false },
            { id: "M-03", milestone: "System Integration", plannedDate: "15 Sep 2026", forecastDate: "06 Oct 2026", actualDate: null, status: "At Risk", varianceDays: 21, dependency: "Vendor API access", critical: true },
            { id: "M-04", milestone: "User Acceptance Testing", plannedDate: "15 Oct 2026", forecastDate: "TBD", actualDate: null, status: "At Risk", varianceDays: null, dependency: "M-03 (System Integration)", critical: true }
        ],
        steeringNotes: {
            meetingDate: "5 September 2026",
            keyDiscussion: [
                "Leadership expressed concern about the integration timeline and its downstream impact on UAT and Go-Live.",
                "The Technology Lead confirmed that vendor API access remains unresolved despite repeated follow-up.",
                "The Programme Director requested a formal recovery plan addressing the integration delay.",
                "Budget remains within approved limits with no material variance expected this period."
            ],
            decisions: ["Programme Manager to prepare a formal recovery plan by 10 September 2026.", "Vendor dependency to be escalated to vendor senior management immediately."]
        },
        previousReport: {
            reportingPeriod: "August 2026", overallStatus: "GREEN", scheduleStatus: "GREEN", budgetStatus: "GREEN", riskStatus: "GREEN",
            keyMessage: "Implementation was progressing broadly to plan. All workstreams reported GREEN status.",
            recommendation: "Monitor vendor dependency closely and confirm API access before the integration phase begins."
        }
    },

    // ══════════════════════════════════════════════════════════
    // SCENARIO 2: Project Recovery
    // ══════════════════════════════════════════════════════════
    project_recovery: {
        id: "project_recovery",
        name: "Project Recovery",
        statusUpdate: {
            reportedOverallStatus: "GREEN",
            reportedScheduleStatus: "GREEN",
            reportedBudgetStatus: "GREEN",
            reportedRiskStatus: "GREEN",
            overallProgress: 73,
            plannedProgress: 75,
            currentPhase: "Implementation",
            reportingPeriod: "September 2026",
            keyUpdate: "The project team reports strong progress following successful vendor API integration. The schedule is back on track.",
            workstreamStatus: [
                { name: "Technology & Platform", status: "GREEN" },
                { name: "System Integration", status: "GREEN", notes: "Vendor API access resolved. Integration testing commenced." },
                { name: "Data Migration", status: "GREEN", notes: "Data quality checks passed." },
                { name: "User Acceptance Testing", status: "GREEN", notes: "UAT preparation activities on track." },
                { name: "Change Management", status: "GREEN" }
            ],
            keyAchievements: ["Vendor API access confirmed and integration testing initiated.", "Data migration quality verified."],
            keyConcerns: ["Resource contention for UAT testers in October."],
            projectManagerComment: "Following the successful escalation, the vendor dependency is resolved. The team has recovered the schedule delay and we are proceeding to UAT as planned."
        },
        riskLog: [
            { id: "R-01", type: "Risk", name: "Core system integration delay", description: "Core system integration delay due to vendor API dependency", severity: "High", probability: "Low", impact: "Resolved", owner: "Technology Lead", status: "Closed", mitigation: "Escalation to vendor account manager successful" },
            { id: "R-04", type: "Risk", name: "UAT Resource Availability", description: "Business users may have limited capacity for UAT", severity: "Medium", probability: "Medium", impact: "Potential delay in UAT sign-off", owner: "Business Lead", status: "Open", mitigation: "Engaging business stakeholders early to secure capacity" }
        ],
        milestones: [
            { id: "M-01", milestone: "Requirements Complete", plannedDate: "15 Jun 2026", forecastDate: "15 Jun 2026", actualDate: "15 Jun 2026", status: "Complete", varianceDays: 0, dependency: "None", critical: false },
            { id: "M-02", milestone: "Solution Design", plannedDate: "15 Jul 2026", forecastDate: "15 Jul 2026", actualDate: "15 Jul 2026", status: "Complete", varianceDays: 0, dependency: "M-01", critical: false },
            { id: "M-03", milestone: "System Integration", plannedDate: "15 Sep 2026", forecastDate: "18 Sep 2026", actualDate: null, status: "On Track", varianceDays: 3, dependency: "Vendor API access", critical: true },
            { id: "M-04", milestone: "User Acceptance Testing", plannedDate: "15 Oct 2026", forecastDate: "15 Oct 2026", actualDate: null, status: "On Track", varianceDays: 0, dependency: "M-03 (System Integration)", critical: true }
        ],
        steeringNotes: {
            meetingDate: "5 September 2026",
            keyDiscussion: [
                "The Steering Committee commended the team for resolving the vendor API dependency.",
                "Integration testing is now underway with no major defects reported so far.",
                "Budget remains GREEN.",
                "Focus should now shift to ensuring business readiness for UAT."
            ],
            decisions: ["Approved the revised UAT schedule.", "Business Lead to confirm UAT resource allocation by 20 September."]
        },
        previousReport: {
            reportingPeriod: "August 2026", overallStatus: "AMBER", scheduleStatus: "AMBER", budgetStatus: "GREEN", riskStatus: "AMBER",
            keyMessage: "Integration delays were reported due to unresolved vendor dependencies.",
            recommendation: "Execute escalation plan for vendor API access."
        }
    },

    // ══════════════════════════════════════════════════════════
    // SCENARIO 3: Critical Project Escalation
    // ══════════════════════════════════════════════════════════
    critical_escalation: {
        id: "critical_escalation",
        name: "Critical Project Escalation",
        statusUpdate: {
            reportedOverallStatus: "AMBER",
            reportedScheduleStatus: "AMBER",
            reportedBudgetStatus: "AMBER",
            reportedRiskStatus: "RED",
            overallProgress: 45,
            plannedProgress: 75,
            currentPhase: "Implementation",
            reportingPeriod: "September 2026",
            keyUpdate: "The project team reports significant challenges across multiple workstreams. Integration is blocked, and budget forecast indicates overspend.",
            workstreamStatus: [
                { name: "Technology & Platform", status: "AMBER" },
                { name: "System Integration", status: "RED", notes: "Integration completely blocked. Vendor unable to provide required API capabilities." },
                { name: "Data Migration", status: "RED", notes: "Critical data quality failures. Significant rework required." },
                { name: "User Acceptance Testing", status: "AMBER", notes: "Delayed indefinitely." },
                { name: "Change Management", status: "AMBER" }
            ],
            keyAchievements: ["None this period."],
            keyConcerns: ["Vendor API lacks required functionality, blocking integration.", "Data migration scripts failed validation.", "Forecast budget overspend of 15% due to required rework."],
            projectManagerComment: "The programme is facing critical blockers. The vendor cannot meet our API requirements, requiring a substantial architectural redesign. We need immediate executive intervention."
        },
        riskLog: [
            { id: "I-01", type: "Issue", name: "Vendor API failure", description: "Vendor API does not support required data payloads", severity: "High", probability: "Confirmed", impact: "Integration impossible without custom development", owner: "Technology Lead", status: "Open", mitigation: "Assessing alternative architectural patterns" },
            { id: "I-02", type: "Issue", name: "Data migration failure", description: "Legacy data quality is preventing successful migration", severity: "High", probability: "Confirmed", impact: "Requires 4 weeks of manual data cleansing", owner: "Data Lead", status: "Open", mitigation: "Requesting additional data entry resources" },
            { id: "I-03", type: "Issue", name: "Budget overspend forecast", description: "Additional contractor costs and rework pushing forecast over budget", severity: "High", probability: "Confirmed", impact: "15% budget variance", owner: "Programme Manager", status: "Open", mitigation: "Preparing variance request for Steering Committee" }
        ],
        milestones: [
            { id: "M-01", milestone: "Requirements Complete", plannedDate: "15 Jun 2026", forecastDate: "15 Jun 2026", actualDate: "15 Jun 2026", status: "Complete", varianceDays: 0, dependency: "None", critical: false },
            { id: "M-02", milestone: "Solution Design", plannedDate: "15 Jul 2026", forecastDate: "15 Aug 2026", actualDate: "15 Aug 2026", status: "Complete", varianceDays: 31, dependency: "M-01", critical: false },
            { id: "M-03", milestone: "System Integration", plannedDate: "15 Sep 2026", forecastDate: "15 Nov 2026", actualDate: null, status: "Delayed", varianceDays: 61, dependency: "Vendor API redesign", critical: true },
            { id: "M-04", milestone: "User Acceptance Testing", plannedDate: "15 Oct 2026", forecastDate: "TBD", actualDate: null, status: "Delayed", varianceDays: null, dependency: "M-03 (System Integration)", critical: true }
        ],
        steeringNotes: {
            meetingDate: "5 September 2026",
            keyDiscussion: [
                "Extreme concern from the Sponsor regarding the total breakdown of the integration plan.",
                "The Technology Lead admitted the vendor assessment during procurement was flawed.",
                "Budget forecast is now showing a material overspend which requires Board approval.",
                "The Steering Committee demands an immediate halt to all non-critical spend until a viable recovery path is established."
            ],
            decisions: ["Halt all non-essential project spend immediately.", "Programme Manager to present a 'Red Status' turnaround plan to the Executive Board within 48 hours."]
        },
        previousReport: {
            reportingPeriod: "August 2026", overallStatus: "AMBER", scheduleStatus: "RED", budgetStatus: "AMBER", riskStatus: "RED",
            keyMessage: "Significant risks were escalating regarding vendor capability and data quality.",
            recommendation: "Conduct immediate technical review of vendor API documentation."
        }
    }
};
