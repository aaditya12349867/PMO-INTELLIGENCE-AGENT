/* ═══════════════════════════════════════════════════════════
   VERTEX PMO INTELLIGENCE AGENT — Application Logic
   Deterministic consolidation, analysis, and UI rendering
   ═══════════════════════════════════════════════════════════ */

(function () {
    "use strict";

    // ══════════════════════════════════════════════════════════
    // APPLICATION STATE & INTERNAL TEST SCENARIOS
    // ══════════════════════════════════════════════════════════
    function getInitialScenarioId() {
        try {
            var params = new URLSearchParams(window.location.search);
            var demo = params.get('demo') || params.get('scenario');
            if (demo) {
                demo = demo.toLowerCase();
                if (demo.indexOf('recover') !== -1 || demo === 'recovery') return 'project_recovery';
                if (demo.indexOf('crit') !== -1 || demo === 'critical') return 'critical_escalation';
                if (demo.indexOf('integ') !== -1 || demo === 'integration') return 'integration_recovery';
            }
        } catch (e) {}
        return "integration_recovery";
    }

    var appState = {
        currentScenarioId: getInitialScenarioId(),
        dataLoaded: false,
        isRunning: false,
        analysisComplete: false,
        inputs: {
            projectStatusUpdate:    null,
            riskIssueLog:           null,
            milestoneTracker:       null,
            steeringCommitteeNotes: null,
            previousPMOReport:      null
        },
        analysis: null,
        decision: null
    };

    window.appState = appState;
    window.__currentScenarioId = appState.currentScenarioId;

    // ══════════════════════════════════════════════════════════
    // DOM REFERENCES
    // ══════════════════════════════════════════════════════════
    var runBtn       = document.getElementById("runAnalysisBtn");
    var cards        = document.querySelectorAll(".input-card");
    var statusEls    = document.querySelectorAll(".input-card-status");

    var overallBadge = document.getElementById("overallStatusBadge");
    var scheduleVal  = document.getElementById("scheduleValue");
    var budgetVal    = document.getElementById("budgetValue");
    var riskVal      = document.getElementById("riskValue");
    var metricsRow   = document.getElementById("metricsRow");

    var exceptionsContainer = document.getElementById("topExceptionsList");
    var recoContainer       = document.getElementById("recommendationContent");

    var btnApprove = document.getElementById("btnApprove");
    var btnEdit    = document.getElementById("btnEdit");
    var btnReject  = document.getElementById("btnReject");

    // ══════════════════════════════════════════════════════════
    // ANALYSIS ENGINE — Deterministic Rules
    // ══════════════════════════════════════════════════════════

    function runAnalysis() {
        var data = appState.inputs;
        var result = {
            scheduleStatus: "GREEN",
            budgetStatus:   data.projectStatusUpdate.reportedBudgetStatus || "GREEN",
            riskStatus:     "GREEN",
            overallStatus:  "GREEN",
            exceptions:     [],
            recommendation: { 
                actions: [], 
                structuredActions: [], 
                why: "", 
                rationale: "", 
                confidence: "HIGH", 
                evidenceUsed: [] 
            },
            evidenceTrail:  []
        };

        // ── 1. Validate Evidence ───────────────────────────────
        if (!data.projectStatusUpdate.reportedBudgetStatus) {
            result.validationError = "Current budget status cannot be independently validated.";
        }

        // ── 2. Schedule & Progress Analysis ──────────────────
        var maxVariance = 0;
        var delayedMilestone = null;
        var criticalMilestonesDelayed = 0;

        data.milestoneTracker.forEach(function (m) {
            if (m.varianceDays !== null && m.varianceDays > maxVariance) {
                maxVariance = m.varianceDays;
                delayedMilestone = m;
            }
            if (m.critical && m.varianceDays >= 5 && m.status !== "Complete") {
                criticalMilestonesDelayed++;
            }
        });

        if (maxVariance > 30) {
            result.scheduleStatus = "RED";
        } else if (maxVariance >= 14) {
            result.scheduleStatus = "AMBER";
        } else {
            result.scheduleStatus = "GREEN";
        }

        var progressVariance = data.projectStatusUpdate.plannedProgress - data.projectStatusUpdate.overallProgress;
        result.reportedProgress = data.projectStatusUpdate.overallProgress;
        result.plannedProgress = data.projectStatusUpdate.plannedProgress;
        result.progressVariance = progressVariance;
        result.criticalMilestoneVariance = maxVariance;

        // ── 3. Risk & Dependency Analysis ────────────────────
        var highSeverityOpen = 0;
        var mediumSeverityOpen = 0;
        var hasUnresolvedDependency = false;
        var hasBudgetRisk = false;

        data.riskIssueLog.forEach(function (r) {
            if (r.status === "Open" || r.status === "In Progress") {
                if (r.severity === "High") highSeverityOpen++;
                if (r.severity === "Medium") mediumSeverityOpen++;
                
                var n = (r.name || "").toLowerCase();
                var d = (r.description || "").toLowerCase();
                if ((n.indexOf("vendor") !== -1 || n.indexOf("dependency") !== -1 || d.indexOf("vendor") !== -1) && r.severity === "High") {
                    hasUnresolvedDependency = true;
                }
                if (n.indexOf("budget") !== -1 || d.indexOf("budget") !== -1 || d.indexOf("overspend") !== -1) {
                    hasBudgetRisk = true;
                    if (r.severity === "High") result.budgetStatus = "RED";
                }
            }
        });

        if (highSeverityOpen >= 3) {
            result.riskStatus = "RED";
        } else if (highSeverityOpen >= 1 || mediumSeverityOpen >= 2) {
            result.riskStatus = "AMBER";
        } else {
            result.riskStatus = "GREEN";
        }

        if (result.budgetStatus === "RED" || hasBudgetRisk && result.budgetStatus === "GREEN") {
            result.budgetStatus = "AMBER";
        }

        // ── 4. Top Findings / Exception Detection ────────────
        var e = result.exceptions;

        // Finding 1: Milestone Delay
        if (maxVariance >= 14) {
            e.push({ 
                type: "Schedule Variance", 
                severity: "HIGH", 
                detail: (delayedMilestone ? delayedMilestone.milestone : "System Integration") + " is forecast " + maxVariance + " days behind plan.", 
                evidence: "Milestone Tracker" 
            });
        }

        // Finding 2: Unresolved Dependency
        if (hasUnresolvedDependency) {
            e.push({ 
                type: "Dependency Risk", 
                severity: "HIGH", 
                detail: "Vendor API dependency remains unresolved.", 
                evidence: "Risk & Issue Log" 
            });
        }

        // Finding 3: Inconsistent Reporting
        if (data.projectStatusUpdate.reportedScheduleStatus === "GREEN" && maxVariance >= 5) {
            e.push({ 
                type: "Reporting Inconsistency", 
                severity: "MEDIUM", 
                detail: "Reported GREEN schedule status conflicts with milestone evidence.", 
                evidence: "Project Status Update" 
            });
        }

        // Additional Findings
        if (progressVariance >= 10) {
            e.push({ 
                type: "Progress Concern", 
                severity: "HIGH", 
                detail: "Reported progress is " + progressVariance + " percentage points below plan.", 
                evidence: "Project Status Update" 
            });
        }

        if (result.budgetStatus === "RED" || hasBudgetRisk) {
            e.push({ 
                type: "Budget Risk", 
                severity: "HIGH", 
                detail: "Forecast indicates material overspend or budget pressure.", 
                evidence: "Risk & Issue Log + Steering Committee Notes" 
            });
        }
        
        var decisionReq = false;
        if (data.steeringCommitteeNotes && data.steeringCommitteeNotes.keyDiscussion) {
            data.steeringCommitteeNotes.keyDiscussion.forEach(function(d) {
                if (d.toLowerCase().indexOf("decision is required") !== -1 || d.toLowerCase().indexOf("intervention") !== -1) {
                    decisionReq = true;
                }
            });
        }
        if (decisionReq) {
            e.push({ 
                type: "Management Decision Required", 
                severity: "MEDIUM", 
                detail: "Steering committee has requested management intervention.", 
                evidence: "Steering Committee Notes" 
            });
        }

        // ── 5. Overall Status ────────────────────────────────
        if (highSeverityOpen >= 3 || result.budgetStatus === "RED" || (maxVariance > 30 && hasUnresolvedDependency)) {
            result.overallStatus = "RED";
        } else if (highSeverityOpen >= 1 || mediumSeverityOpen >= 2 || e.length >= 2) {
            result.overallStatus = "AMBER";
        } else {
            result.overallStatus = "GREEN";
        }

        // ── 6. Dynamic Recommendation ────────────────────────
        if (result.overallStatus === "GREEN") {
            result.recommendation.structuredActions = [
                { priority: "MEDIUM", action: "Continue recovery monitoring." },
                { priority: "MEDIUM", action: "Maintain current delivery controls." },
                { priority: "LOW", action: "Confirm milestone delivery." }
            ];
            result.recommendation.actions = [
                "Continue recovery monitoring.",
                "Maintain current delivery controls.",
                "Confirm milestone delivery."
            ];
            result.recommendation.why = "Project indicators are positive following recovery. Exceptions are limited and risks are well managed. No immediate escalation is required.";
            result.recommendation.rationale = result.recommendation.why;
            result.recommendation.confidence = "HIGH";
        } else if (result.overallStatus === "RED") {
            result.recommendation.structuredActions = [
                { priority: "HIGH", action: "Immediate executive escalation." },
                { priority: "HIGH", action: "Approve comprehensive delivery re-baseline." },
                { priority: "HIGH", action: "Establish weekly executive governance." }
            ];
            result.recommendation.actions = [
                "Immediate executive escalation.",
                "Approve comprehensive delivery re-baseline.",
                "Establish weekly executive governance."
            ];
            result.recommendation.why = "Multiple critical constraints detected across schedule, budget, or dependencies. Urgent executive intervention is required to establish a viable recovery path.";
            result.recommendation.rationale = result.recommendation.why;
            result.recommendation.confidence = "HIGH";
        } else {
            // AMBER (Active PoC / Integration Recovery Risk)
            if (maxVariance < 14) {
                result.recommendation.structuredActions = [
                    { priority: "HIGH", action: "Resolve outstanding vendor dependency." },
                    { priority: "MEDIUM", action: "Monitor recovered milestone progress." },
                    { priority: "MEDIUM", action: "Assess additional technical support." }
                ];
                result.recommendation.actions = [
                    "Resolve outstanding vendor dependency.",
                    "Monitor recovered milestone progress.",
                    "Assess additional technical support."
                ];
                result.recommendation.why = "The recommendation is driven by the unresolved vendor API dependency, while schedule variance is recovered within control (" + maxVariance + " days).";
                result.recommendation.rationale = result.recommendation.why;
                result.recommendation.confidence = "HIGH";
            } else {
                result.recommendation.structuredActions = [
                    { priority: "HIGH", action: "Escalate vendor dependency." },
                    { priority: "HIGH", action: "Approve recovery plan for integration delay." },
                    { priority: "MEDIUM", action: "Assess additional technical support." }
                ];
                result.recommendation.actions = [
                    "Escalate vendor dependency.",
                    "Approve recovery plan for integration delay.",
                    "Assess additional technical support."
                ];
                result.recommendation.why = "The recommendation is driven by the unresolved dependency, the 21-day milestone delay and the downstream UAT impact.";
                result.recommendation.rationale = result.recommendation.why;
                result.recommendation.confidence = "HIGH";
            }
        }

        result.recommendation.evidenceUsed = [
            "Project Status Update", 
            "Risk & Issue Log", 
            "Milestone Tracker", 
            "Steering Committee Notes", 
            "Previous PMO Report"
        ];
        
        return result;
    }

    // ══════════════════════════════════════════════════════════
    // UI RENDERING
    // ══════════════════════════════════════════════════════════

    function statusClass(status) {
        switch (status) {
            case "RED":   return "status-badge--red";
            case "AMBER": return "status-badge--amber";
            case "GREEN": return "status-badge--green";
            default:      return "status-badge--neutral";
        }
    }

    function renderDashboard(analysis) {
        // Overall badge and explanation
        overallBadge.textContent = analysis.overallStatus;
        overallBadge.className = "status-badge " + statusClass(analysis.overallStatus);
        
        var exOverall = document.getElementById("overallExplanation");
        if (exOverall) {
            if (analysis.overallStatus === "RED") exOverall.textContent = "Critical issue requiring urgent management intervention.";
            else if (analysis.overallStatus === "AMBER") exOverall.textContent = "Needs management attention, but is not yet critical.";
            else if (analysis.overallStatus === "GREEN") exOverall.textContent = "On track and within current controls.";
            else exOverall.textContent = "";
        }

        // KPI cards
        scheduleVal.textContent = analysis.scheduleStatus;
        scheduleVal.className = "kpi-value kpi-value--" + analysis.scheduleStatus.toLowerCase();
        var exSchedule = document.getElementById("scheduleExplanation");
        if (exSchedule) {
            if (analysis.scheduleStatus === "RED") exSchedule.textContent = "Critical delay threatens project delivery.";
            else if (analysis.scheduleStatus === "AMBER") exSchedule.textContent = "Key milestone is delayed.";
            else exSchedule.textContent = "Schedule is performing to baseline.";
        }

        var isBudgetGreen = analysis.budgetStatus === "GREEN";
        budgetVal.textContent = isBudgetGreen ? "REPORTED GREEN" : analysis.budgetStatus;
        budgetVal.className = "kpi-value kpi-value--" + analysis.budgetStatus.toLowerCase();
        var exBudget = document.getElementById("budgetExplanation");
        if (exBudget) {
            if (analysis.budgetStatus === "RED") exBudget.textContent = "Severe budget overrun detected.";
            else if (analysis.budgetStatus === "AMBER") exBudget.textContent = "Budget variance requires monitoring.";
            else exBudget.textContent = "Reported as within control; finance system not connected.";
        }

        riskVal.textContent = analysis.riskStatus;
        riskVal.className = "kpi-value kpi-value--" + analysis.riskStatus.toLowerCase();
        var exRisk = document.getElementById("riskExplanation");
        if (exRisk) {
            if (analysis.riskStatus === "RED") exRisk.textContent = "Critical risks threaten project viability.";
            else if (analysis.riskStatus === "AMBER") exRisk.textContent = "Open issues require management attention.";
            else exRisk.textContent = "No severe uncontrolled risks detected.";
        }

        // Progress metrics (Plain English, no raw abbreviations)
        var progVals = document.getElementById("progressValues");
        if (progVals) progVals.textContent = analysis.reportedProgress + "% actual | " + analysis.plannedProgress + "% planned";
        
        var progGap = document.getElementById("progressGapValue");
        if (progGap) progGap.textContent = analysis.progressVariance + " percentage points";
        
        var progGapEx = document.getElementById("progressGapExplanation");
        if (progGapEx) {
            if (analysis.progressVariance > 0) {
                progGapEx.textContent = "Actual project progress is below planned progress.";
            } else {
                progGapEx.textContent = "Project progress is on or ahead of plan.";
            }
        }
    }

    function renderExceptions(exceptions) {
        var el = document.getElementById("topExceptionsList");
        if (!el) return;

        if (!exceptions || exceptions.length === 0) {
            el.innerHTML = '<div class="placeholder-text" style="font-size: 0.76rem;">No critical findings detected.</div>';
            return;
        }

        var html = '';
        exceptions.slice(0, 3).forEach(function (ex) {
            var prioClass = ex.severity === "HIGH" ? "finding-priority--high" : "finding-priority--medium";
            var rowClass = ex.severity === "HIGH" ? "finding-row--high" : "finding-row--medium";
            html +=
                '<div class="finding-row ' + rowClass + '">' +
                    '<span class="finding-priority ' + prioClass + '">' + ex.severity + '</span>' +
                    '<span class="finding-detail">' + ex.detail + '</span>' +
                    '<span class="finding-source-tag">Source: ' + (ex.evidence || "Project Evidence") + '</span>' +
                '</div>';
        });
        el.innerHTML = html;
    }

    function buildAnalysisSummary(analysis) {
        var ai = analysis.ai || {};
        var aiFailed = analysis.aiError || !analysis.ai;

        // 1. Seven logical stages of Agent Workflow (Horizontal Strip)
        var stages = [
            { num: "01", name: "OBSERVE", desc: "Sources", status: "Done" },
            { num: "02", name: "VALIDATE", desc: "Evidence", status: analysis.validationError ? "Exception" : "Done" },
            { num: "03", name: "COMPARE", desc: "Cross-check", status: "Done" },
            { num: "04", name: "INVESTIGATE", desc: "Root cause", status: "Done" },
            { num: "05", name: "ASSESS", desc: "Risk", status: "Done" },
            { num: "06", name: "RECOMMEND", desc: "Actions", status: "Done" },
            { num: "07", name: "HUMAN REVIEW", desc: "Decision", status: "Pending" }
        ];

        var html = '<div class="wf-strip">';
        stages.forEach(function(s, idx) {
            var isDone = s.status === "Done";
            var chipClass = isDone ? "wf-chip--done" : (s.status === "Pending" ? "wf-chip--pending" : "wf-chip--error");
            html += '<div class="wf-chip ' + chipClass + '">' +
                '<div class="wf-chip-num">' + s.num + '</div>' +
                '<div class="wf-chip-name">' + s.name + '</div>' +
                '<div class="wf-chip-desc">' + s.desc + '</div>' +
                '<div class="wf-chip-status">' + s.status + '</div>' +
            '</div>';
            if (idx < stages.length - 1) {
                html += '<span class="wf-chip-arrow">&rarr;</span>';
            }
        });
        html += '</div>';
        
        var wfEl = document.getElementById("agentWorkflowCompact");
        if (wfEl) wfEl.innerHTML = html;

        // 2. Horizontal Evidence Chain with 4 compact nodes
        var chainEl = document.getElementById("evidenceChainCompact");
        if (chainEl) {
            var nodes = [];
            if (appState.currentScenarioId === "integration_recovery" || !aiFailed && ai.investigationChain) {
                var delayDays = analysis.criticalMilestoneVariance !== undefined ? analysis.criticalMilestoneVariance : 21;
                var isRecovered = delayDays <= 5;
                nodes = [
                    { 
                        phase: "ROOT CAUSE", 
                        title: "Vendor/API dependency", 
                        desc: "Dependency remains unresolved", 
                        source: "Risk & Issue Log" 
                    },
                    { 
                        phase: "DIRECT EFFECT", 
                        title: isRecovered ? "System Integration on track" : "System Integration delayed", 
                        desc: "Forecast " + delayDays + " days behind plan" + (isRecovered ? " (within control)" : ""), 
                        source: "Milestone Tracker" 
                    },
                    { 
                        phase: "DOWNSTREAM IMPACT", 
                        title: isRecovered ? "UAT schedule protected" : "UAT at risk", 
                        desc: isRecovered ? "Testing window preserved" : "Testing window compressed", 
                        source: "Milestone Tracker" 
                    },
                    { 
                        phase: "MANAGEMENT IMPLICATION", 
                        title: isRecovered ? "Standard governance" : "Intervention required", 
                        desc: isRecovered ? "Ongoing progress monitoring" : "Recovery actions required", 
                        source: "Steering Committee Notes" 
                    }
                ];
            } else if (appState.currentScenarioId === "critical_escalation") {
                nodes = [
                    { phase: "ROOT CAUSE", title: "Material budget overrun", desc: "Variance exceeds 15%", source: "Risk & Issue Log" },
                    { phase: "DIRECT EFFECT", title: "Architecture delayed", desc: "45 days behind plan", source: "Milestone Tracker" },
                    { phase: "DOWNSTREAM IMPACT", title: "Go-live delivery at risk", desc: "Release date compromised", source: "Steering Committee Notes" },
                    { phase: "MANAGEMENT IMPLICATION", title: "Executive escalation", desc: "Immediate sponsor review", source: "Steering Committee Notes" }
                ];
            } else {
                nodes = [
                    { phase: "ROOT CAUSE", title: "Vendor API confirmed", desc: "Access confirmed", source: "Risk & Issue Log" },
                    { phase: "DIRECT EFFECT", title: "Integration on track", desc: "Testing commenced", source: "Milestone Tracker" },
                    { phase: "DOWNSTREAM IMPACT", title: "Schedule recovered", desc: "UAT window preserved", source: "Project Status Update" },
                    { phase: "MANAGEMENT IMPLICATION", title: "Standard delivery", desc: "Regular monitoring", source: "Steering Committee Notes" }
                ];
            }

            var cHtml = '<div class="chain-horizontal-row">';
            nodes.forEach(function(n, idx) {
                cHtml += '<div class="chain-node-box">' +
                    '<div class="chain-phase-label">' + n.phase + '</div>' +
                    '<div class="chain-node-title">' + n.title + '</div>' +
                    '<div class="chain-node-desc">' + n.desc + '</div>' +
                    '<div class="chain-node-source">Source: ' + n.source + '</div>' +
                '</div>';
                if (idx < nodes.length - 1) {
                    cHtml += '<div class="chain-arrow-horiz">&rarr;</div>';
                }
            });
            cHtml += '</div>';
            chainEl.innerHTML = cHtml;
        }
    }

    function renderRecommendation(analysis) {
        var ai = analysis.ai || {};
        var aiFailed = analysis.aiError || !analysis.ai;

        // 1. Render workflow and evidence chain
        buildAnalysisSummary(analysis);

        // 2. Render actions to #recommendationContent
        var actions = (analysis.recommendation && analysis.recommendation.structuredActions) || [
            { priority: "HIGH", action: "Escalate vendor dependency." },
            { priority: "HIGH", action: "Approve recovery plan." },
            { priority: "MEDIUM", action: "Assess additional technical support." }
        ];

        var actionsHtml = '';
        if (aiFailed) {
            actionsHtml += '<div class="ai-fallback-badge" style="display:inline-flex; align-items:center; gap:6px; font-size:0.72rem; font-weight:700; color:#B45309; background:#FEF3C7; padding:4px 8px; border-radius:4px; margin-bottom:8px; border:1px solid #FCD34D;">' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
                'AI SYNTHESIS UNAVAILABLE &bull; Deterministic Fallback Active' +
            '</div>';
        }
        actionsHtml += '<div style="display: flex; flex-direction: column; gap: 5px;">';
        actions.forEach(function(a) {
            var prioClass = a.priority === "HIGH" ? "reco-action-priority--high" : "reco-action-priority--medium";
            actionsHtml += '<div class="reco-action-item">' +
                '<span class="reco-action-priority ' + prioClass + '">' + a.priority + '</span>' +
                '<strong class="reco-action-text">' + a.action + '</strong>' +
            '</div>';
        });
        actionsHtml += '</div>';

        // Add WHY box under the actions
        var whyText = (analysis.recommendation && (analysis.recommendation.why || analysis.recommendation.rationale)) || 
            "The recommendation is driven by the unresolved dependency, the 21-day milestone delay and the downstream UAT impact.";
        actionsHtml += '<div class="reco-why-box">' +
            '<div class="reco-why-title">WHY</div>' +
            '<div class="reco-why-text">"' + whyText + '"</div>' +
        '</div>';

        recoContainer.innerHTML = actionsHtml;

        // 3. Render confidence and evidence count
        var confEl = document.getElementById("confidenceValue");
        var evEl = document.getElementById("evidenceCount");
        if (confEl) confEl.textContent = (analysis.recommendation && analysis.recommendation.confidence) || "HIGH";
        if (evEl) evEl.textContent = (analysis.recommendation && analysis.recommendation.evidenceUsed ? analysis.recommendation.evidenceUsed.length : "5");

        // 4. Update the View Analysis Details modal content
        var detailsSources = document.getElementById("detailsSources");
        var detailsChain = document.getElementById("detailsChain");
        var detailsReco = document.getElementById("detailsRecommendation");
        
        if (detailsSources) {
            detailsSources.innerHTML = '<ul style="padding-left: 16px; margin: 0; line-height: 1.6; color: var(--color-text-sec);">' +
                '<li>Project Status Update (Loaded)</li>' +
                '<li>Risk & Issue Log (Loaded)</li>' +
                '<li>Milestone Tracker (Loaded)</li>' +
                '<li>Steering Committee Notes (Loaded)</li>' +
                '<li>Previous PMO Report (Loaded)</li>' +
            '</ul>';
        }
        
        if (detailsChain) {
            var cHtml = '<h5 style="margin: 0 0 8px 0; font-size: 0.8rem; font-weight: 700; color: var(--color-text);">Cross-Source Findings</h5><ul style="padding-left: 16px; margin-bottom: 16px; line-height: 1.6; color: var(--color-text-sec);">';
            if (ai.crossSourceFindings && ai.crossSourceFindings.length > 0) {
                ai.crossSourceFindings.forEach(function(f) { cHtml += '<li><span style="color:var(--color-text);">' + f.finding + '</span> <br/><span style="font-size: 0.75rem;">(' + f.sources.join(', ') + ')</span></li>'; });
            } else {
                cHtml += '<li>System Integration is forecast 21 days behind plan (Milestone Tracker vs Project Status Update)</li>';
                cHtml += '<li>Unresolved vendor API dependency directly impacts UAT testing window (Risk & Issue Log vs Milestone Tracker)</li>';
            }
            cHtml += '</ul>';
            detailsChain.innerHTML = cHtml;
        }
        
        if (detailsReco) {
            detailsReco.innerHTML = '<h5 style="margin: 0 0 8px 0; font-size: 0.8rem; font-weight: 700; color: var(--color-text);">Agent Rationale</h5><p style="line-height: 1.6; margin:0; color: var(--color-text-sec);">' + whyText + '</p>';
        }
    }

    // ══════════════════════════════════════════════════════════
    // MODAL SYSTEM
    // ══════════════════════════════════════════════════════════

    var modalOverlay = document.getElementById("modalOverlay");
    var modalPanel   = document.getElementById("modalPanel");

    function openModal(html) {
        modalPanel.innerHTML = html;
        modalOverlay.style.display = "flex";
    }

    function closeModal() {
        modalOverlay.style.display = "none";
        modalPanel.innerHTML = "";
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", function (e) {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // ══════════════════════════════════════════════════════════
    // DECISION WORKFLOW
    // ══════════════════════════════════════════════════════════

    var approvalContent  = document.getElementById("approvalContent");
    var historySection   = document.getElementById("decisionHistory");
    var historyContent   = document.getElementById("decisionHistoryContent");

    function formatDateTime(d) {
        var date = d || new Date();
        return date.toLocaleDateString("en-GB", {
            day: "numeric", month: "long", year: "numeric"
        }) + " at " + date.toLocaleTimeString("en-GB", {
            hour: "2-digit", minute: "2-digit"
        });
    }

    function svgCheck() {
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    }

    function svgX() {
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    }

    function svgEdit() {
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    }

    // ── Render: Approved Outcome ─────────────────────────────
    function renderApprovedOutcome(decisionData) {
        var reco = decisionData.recommendation || appState.analysis.recommendation;
        var actionsHtml = '';
        reco.actions.forEach(function (a) { actionsHtml += '<li>' + a + '</li>'; });

        approvalContent.innerHTML =
            '<div class="decision-outcome" style="border-left: 4px solid var(--color-green);">' +
                '<div class="decision-outcome-header">' +
                    '<div class="decision-outcome-icon decision-outcome-icon--approved">' + svgCheck() + '</div>' +
                    '<span class="decision-outcome-title decision-outcome-title--approved">Agent Recommendation Approved</span>' +
                    '<span class="decision-outcome-badge decision-outcome-badge--approved">Approved</span>' +
                '</div>' +
                '<div class="decision-outcome-body">' +
                    '<p>Management has approved the recommended actions.</p>' +
                    '<ol>' + actionsHtml + '</ol>' +
                '</div>' +
                '<div class="decision-outcome-meta">' +
                    '<span><strong>Decision status:</strong> APPROVED</span>' +
                    '<span><strong>Decision owner:</strong> Management</span>' +
                    '<span><strong>Date/time:</strong> ' + decisionData.timestamp + '</span>' +
                '</div>' +
            '</div>';
    }

    // ── Render: Edited Outcome ───────────────────────────────
    function renderEditedOutcome(decisionData) {
        var origActions = '';
        appState.analysis.recommendation.actions.forEach(function (a) { origActions += '<li>' + a + '</li>'; });
        var finalActions = '';
        decisionData.editedActions.forEach(function (a) { finalActions += '<li>' + a + '</li>'; });

        approvalContent.innerHTML =
            '<div class="decision-outcome" style="border-left: 4px solid var(--color-amber);">' +
                '<div class="decision-outcome-header">' +
                    '<div class="decision-outcome-icon decision-outcome-icon--edited">' + svgEdit() + '</div>' +
                    '<span class="decision-outcome-title decision-outcome-title--edited">Recommendation Edited and Saved</span>' +
                    '<span class="decision-outcome-badge decision-outcome-badge--edited">Edited</span>' +
                '</div>' +
                '<div class="decision-outcome-body">' +
                    '<p>Management has reviewed and modified the agent recommendation.</p>' +
                '</div>' +
                '<div class="decision-compare">' +
                    '<div class="decision-compare-col">' +
                        '<span class="decision-compare-label decision-compare-label--original">Agent Original Recommendation</span>' +
                        '<ol>' + origActions + '</ol>' +
                        '<p style="margin-top:8px;font-size:0.78rem;color:var(--color-text-sec);"><strong>Status:</strong> ' + appState.analysis.overallStatus + '</p>' +
                        '<p style="font-size:0.78rem;color:var(--color-text-sec);"><strong>Rationale:</strong> ' + appState.analysis.recommendation.rationale + '</p>' +
                    '</div>' +
                    '<div class="decision-compare-col" style="border:1px solid var(--color-accent);background:var(--color-accent-lt);">' +
                        '<span class="decision-compare-label decision-compare-label--final">Management Final Decision</span>' +
                        '<ol>' + finalActions + '</ol>' +
                        '<p style="margin-top:8px;font-size:0.78rem;color:var(--color-text);"><strong>Status:</strong> ' + decisionData.editedStatus + '</p>' +
                        '<p style="font-size:0.78rem;color:var(--color-text);"><strong>Rationale:</strong> ' + decisionData.editedRationale + '</p>' +
                    '</div>' +
                '</div>' +
                '<div class="decision-outcome-meta">' +
                    '<span><strong>Decision status:</strong> EDITED</span>' +
                    '<span><strong>Decision owner:</strong> Management</span>' +
                    '<span><strong>Date/time:</strong> ' + decisionData.timestamp + '</span>' +
                '</div>' +
            '</div>';
    }

    // ── Render: Rejected Outcome ─────────────────────────────
    function renderRejectedOutcome(decisionData) {
        approvalContent.innerHTML =
            '<div class="decision-outcome" style="border-left: 4px solid var(--color-red);">' +
                '<div class="decision-outcome-header">' +
                    '<div class="decision-outcome-icon decision-outcome-icon--rejected">' + svgX() + '</div>' +
                    '<span class="decision-outcome-title decision-outcome-title--rejected">Agent Recommendation Rejected</span>' +
                    '<span class="decision-outcome-badge decision-outcome-badge--rejected">Rejected</span>' +
                '</div>' +
                '<div class="decision-outcome-body">' +
                    '<p>The project requires an alternative management decision.</p>' +
                '</div>' +
                '<div class="rejection-reason">' +
                    '<strong>Reason for rejection:</strong> ' + decisionData.rejectionReason +
                '</div>' +
                '<div class="decision-outcome-meta">' +
                    '<span><strong>Decision status:</strong> REJECTED</span>' +
                    '<span><strong>Decision owner:</strong> Management</span>' +
                    '<span><strong>Date/time:</strong> ' + decisionData.timestamp + '</span>' +
                '</div>' +
            '</div>';
    }

    // ── Render: Audit Trail ──────────────────────────────────
    function renderAuditTrail(decisionData) {
        historySection.style.display = "block";

        var entries =
            '<div class="audit-entry">' +
                '<span class="audit-dot audit-dot--accent"></span>' +
                '<div class="audit-title">AI Recommendation Generated</div>' +
                '<div class="audit-status">Status: Awaiting Management Review</div>' +
                '<div class="audit-time">' + (decisionData.analysisTimestamp || decisionData.timestamp) + '</div>' +
            '</div>';

        if (decisionData.status === "APPROVED") {
            entries +=
                '<div class="audit-entry">' +
                    '<span class="audit-dot audit-dot--green"></span>' +
                    '<div class="audit-title">Management Decision</div>' +
                    '<div class="audit-status">Status: APPROVED</div>' +
                    '<div class="audit-time">' + decisionData.timestamp + '</div>' +
                '</div>';
        } else if (decisionData.status === "EDITED") {
            entries +=
                '<div class="audit-entry">' +
                    '<span class="audit-dot audit-dot--amber"></span>' +
                    '<div class="audit-title">Management Decision</div>' +
                    '<div class="audit-status">Status: EDITED — Final decision differs from original AI recommendation</div>' +
                    '<div class="audit-time">' + decisionData.timestamp + '</div>' +
                '</div>';
        } else if (decisionData.status === "REJECTED") {
            entries +=
                '<div class="audit-entry">' +
                    '<span class="audit-dot audit-dot--red"></span>' +
                    '<div class="audit-title">Management Decision</div>' +
                    '<div class="audit-status">Status: REJECTED</div>' +
                    '<div class="audit-time">' + decisionData.timestamp + '</div>' +
                '</div>';
        }

        historyContent.innerHTML = '<div class="audit-trail">' + entries + '</div>';
    }

    // ── Persist to localStorage ──────────────────────────────
    function saveDecision(data) {
        try { localStorage.setItem("vertex_pmo_decision", JSON.stringify(data)); }
        catch (e) { /* silent */ }
    }

    function loadDecision() {
        try {
            var raw = localStorage.getItem("vertex_pmo_decision");
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function clearDecision() {
        try { localStorage.removeItem("vertex_pmo_decision"); }
        catch (e) { /* silent */ }
    }

    // ── Apply a saved decision ───────────────────────────────
    function applyDecision(decisionData) {
        appState.decision = decisionData.status;

        if (decisionData.status === "APPROVED") {
            renderApprovedOutcome(decisionData);
        } else if (decisionData.status === "EDITED") {
            renderEditedOutcome(decisionData);
        } else if (decisionData.status === "REJECTED") {
            renderRejectedOutcome(decisionData);
        }

        renderAuditTrail(decisionData);
    }

    // ══════════════════════════════════════════════════════════
    // APPROVE FLOW
    // ══════════════════════════════════════════════════════════

    function showApproveModal() {
        var reco = appState.analysis.recommendation;
        var actionsHtml = '';
        reco.actions.forEach(function (a) { actionsHtml += '<li>' + a + '</li>'; });

        openModal(
            '<h4 class="modal-title">Approve Agent Recommendation?</h4>' +
            '<div class="modal-body">' +
                '<p>You are about to approve the following recommendation:</p>' +
                '<ol>' + actionsHtml + '</ol>' +
            '</div>' +
            '<div class="modal-actions">' +
                '<button class="modal-btn modal-btn--cancel" id="modalCancel">Cancel</button>' +
                '<button class="modal-btn modal-btn--confirm-approve" id="modalConfirmApprove">Confirm Approval</button>' +
            '</div>'
        );

        document.getElementById("modalCancel").addEventListener("click", closeModal);
        document.getElementById("modalConfirmApprove").addEventListener("click", function () {
            var decisionData = {
                status: "APPROVED",
                timestamp: formatDateTime(),
                analysisTimestamp: formatDateTime(),
                recommendation: appState.analysis.recommendation
            };
            saveDecision(decisionData);
            applyDecision(decisionData);
            closeModal();
        });
    }

    // ══════════════════════════════════════════════════════════
    // EDIT FLOW
    // ══════════════════════════════════════════════════════════

    function showEditInterface() {
        var reco = appState.analysis.recommendation;
        var actionsHtml = '';
        reco.actions.forEach(function (a, i) {
            actionsHtml +=
                '<div class="edit-action-row" data-idx="' + i + '">' +
                    '<input class="edit-input" type="text" value="' + a.replace(/"/g, '&quot;') + '" style="margin-bottom:0;">' +
                    '<button class="edit-action-btn" data-delete="' + i + '">Remove</button>' +
                '</div>';
        });

        approvalContent.innerHTML =
            '<div class="edit-interface">' +
                '<span class="edit-section-label">Overall Project Status</span>' +
                '<select class="edit-select" id="editStatus">' +
                    '<option value="GREEN"' + (appState.analysis.overallStatus === "GREEN" ? ' selected' : '') + '>GREEN</option>' +
                    '<option value="AMBER"' + (appState.analysis.overallStatus === "AMBER" ? ' selected' : '') + '>AMBER</option>' +
                    '<option value="RED"' + (appState.analysis.overallStatus === "RED" ? ' selected' : '') + '>RED</option>' +
                '</select>' +

                '<span class="edit-section-label">Recommended Management Actions</span>' +
                '<div id="editActionsContainer">' + actionsHtml + '</div>' +
                '<button class="edit-add-btn" id="editAddAction">+ Add Action</button>' +

                '<span class="edit-section-label">Rationale</span>' +
                '<textarea class="edit-textarea" id="editRationale">' + (reco.why || reco.rationale) + '</textarea>' +

                '<div class="edit-form-actions">' +
                    '<button class="modal-btn modal-btn--cancel" id="editCancel">Cancel</button>' +
                    '<button class="modal-btn modal-btn--confirm-save" id="editSave">Save Changes</button>' +
                '</div>' +
            '</div>';

        var container = document.getElementById("editActionsContainer");
        container.addEventListener("click", function (e) {
            if (e.target.classList.contains("edit-action-btn")) {
                e.target.parentElement.remove();
            }
        });

        document.getElementById("editAddAction").addEventListener("click", function () {
            var row = document.createElement("div");
            row.className = "edit-action-row";
            row.innerHTML =
                '<input class="edit-input" type="text" placeholder="Enter new action..." style="margin-bottom:0;">' +
                '<button class="edit-action-btn">Remove</button>';
            container.appendChild(row);
        });

        document.getElementById("editCancel").addEventListener("click", function () {
            restorePendingReview();
        });

        document.getElementById("editSave").addEventListener("click", function () {
            var inputs = container.querySelectorAll("input");
            var actions = [];
            inputs.forEach(function (inp) {
                var val = inp.value.trim();
                if (val) actions.push(val);
            });
            if (actions.length === 0) return;

            var decisionData = {
                status: "EDITED",
                timestamp: formatDateTime(),
                analysisTimestamp: formatDateTime(),
                editedStatus: document.getElementById("editStatus").value,
                editedActions: actions,
                editedRationale: document.getElementById("editRationale").value.trim()
            };
            saveDecision(decisionData);
            applyDecision(decisionData);
        });
    }

    // ══════════════════════════════════════════════════════════
    // REJECT FLOW
    // ══════════════════════════════════════════════════════════

    function showRejectModal() {
        openModal(
            '<h4 class="modal-title">Reject Agent Recommendation?</h4>' +
            '<div class="modal-body">' +
                '<p>You are about to reject the agent recommendation. Please provide a reason.</p>' +
            '</div>' +
            '<label class="modal-textarea-label">Reason for rejection</label>' +
            '<textarea class="modal-textarea" id="rejectReason" placeholder="Enter the reason for rejection..."></textarea>' +
            '<div class="modal-error" id="rejectError">A rejection reason is required.</div>' +
            '<div class="modal-actions">' +
                '<button class="modal-btn modal-btn--cancel" id="modalCancel">Cancel</button>' +
                '<button class="modal-btn modal-btn--confirm-reject" id="modalConfirmReject">Confirm Rejection</button>' +
            '</div>'
        );

        document.getElementById("modalCancel").addEventListener("click", closeModal);
        document.getElementById("modalConfirmReject").addEventListener("click", function () {
            var reason = document.getElementById("rejectReason").value.trim();
            if (!reason) {
                document.getElementById("rejectError").style.display = "block";
                return;
            }

            var decisionData = {
                status: "REJECTED",
                timestamp: formatDateTime(),
                analysisTimestamp: formatDateTime(),
                rejectionReason: reason
            };
            saveDecision(decisionData);
            applyDecision(decisionData);
            closeModal();
        });
    }

    // ══════════════════════════════════════════════════════════
    // RESET DEMO
    // ══════════════════════════════════════════════════════════

    function showResetModal() {
        openModal(
            '<h4 class="modal-title">Reset Demo</h4>' +
            '<div class="modal-body">' +
                '<p>Reset all decisions and return the PMO Intelligence Agent to its initial state?</p>' +
            '</div>' +
            '<div class="modal-actions">' +
                '<button class="modal-btn modal-btn--cancel" id="modalCancel">Cancel</button>' +
                '<button class="modal-btn modal-btn--danger" id="modalConfirmReset">Reset Demo</button>' +
            '</div>'
        );

        document.getElementById("modalCancel").addEventListener("click", closeModal);
        document.getElementById("modalConfirmReset").addEventListener("click", function () {
            clearDecision();
            closeModal();
            appState.decision = null;
            appState.analysisComplete = false;
            appState.analysis = null;
            appState.isStale = false;

            // Restore pristine milestone delay for M-03 (21 days)
            if (window.SCENARIOS && window.SCENARIOS.integration_recovery && window.SCENARIOS.integration_recovery.milestones) {
                window.SCENARIOS.integration_recovery.milestones.forEach(function(m) {
                    if (m.id === "M-03" || m.milestone === "System Integration") {
                        m.varianceDays = 21;
                        m.status = "At Risk";
                        m.forecastDate = "06 Oct 2026";
                    }
                });
            }
            if (appState.inputs && appState.inputs.milestoneTracker) {
                appState.inputs.milestoneTracker.forEach(function(m) {
                    if (m.id === "M-03" || m.milestone === "System Integration") {
                        m.varianceDays = 21;
                        m.status = "At Risk";
                        m.forecastDate = "06 Oct 2026";
                    }
                });
            }

            restorePendingReview();
            if (historySection) historySection.style.display = "none";
            if (historyContent) historyContent.innerHTML = "";

            // Reset button
            runBtn.innerHTML =
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
                ' RUN PMO ANALYSIS';
            runBtn.classList.remove("btn-primary--done");
            runBtn.disabled = false;

            // Reset status tag
            var statusInd = document.getElementById("projectStatusIndicator");
            if (statusInd) {
                statusInd.className = "project-status-tag project-status-tag--ready";
                statusInd.innerHTML = '<svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg> Ready for analysis';
            }

            // Reset KPI displays
            overallBadge.textContent = "—";
            overallBadge.className = "status-badge status-badge--neutral";
            scheduleVal.textContent = "—";
            scheduleVal.className = "kpi-value kpi-value--none";
            budgetVal.textContent = "—";
            budgetVal.className = "kpi-value kpi-value--none";
            riskVal.textContent = "—";
            riskVal.className = "kpi-value kpi-value--none";

            var topEx = document.getElementById("topExceptionsList");
            if (topEx) topEx.innerHTML = '<div class="placeholder-text">Awaiting analysis...</div>';
            if (recoContainer) recoContainer.innerHTML = '<div class="placeholder-text">Awaiting analysis...</div>';
            var chainEl = document.getElementById("evidenceChainCompact");
            if (chainEl) chainEl.innerHTML = '<div class="placeholder-text">Awaiting analysis...</div>';
            var wfEl = document.getElementById("agentWorkflowCompact");
            if (wfEl) wfEl.innerHTML = '<div class="placeholder-text">Awaiting Agent Analysis</div>';
            var progGap = document.getElementById("progressGapValue");
            if (progGap) progGap.textContent = "--";
            var progVals = document.getElementById("progressValues");
            if (progVals) progVals.textContent = "-- actual | -- planned";
            var progGapEx = document.getElementById("progressGapExplanation");
            if (progGapEx) progGapEx.textContent = "";
            var exOverall = document.getElementById("overallExplanation");
            if (exOverall) exOverall.textContent = "Awaiting analysis...";
        });
    }

    // ── Restore to pending review state ──────────────────────
    function restorePendingReview() {
        var staleBanner = '';
        if (appState.isStale) {
            staleBanner = '<div id="staleWarningBanner" class="stale-warning-banner" style="background:#FEF2F2; border:1px solid #F87171; border-radius:6px; padding:10px 12px; margin-bottom:12px; font-size:0.78rem; color:#991B1B; line-height:1.4; font-weight:600; display:flex; align-items:flex-start; gap:8px;">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
                '<span>Project evidence has changed since this analysis was generated. Re-run the Agent before making a management decision.</span>' +
            '</div>';
        }

        approvalContent.innerHTML =
            staleBanner +
            '<div class="human-gate-title">AGENT RECOMMENDS. HUMAN DECIDES.</div>' +
            '<p class="human-gate-desc">Human review is required before these actions are applied to the project.</p>' +
            '<div class="approval-actions" id="approvalActions">' +
                '<button class="btn-primary btn-approve" id="btnApprove"' + (appState.isStale ? ' disabled style="opacity:0.4; cursor:not-allowed;"' : '') + '>' + svgCheck() + ' APPROVE</button>' +
                '<button class="btn-secondary btn-edit" id="btnEdit"' + (appState.isStale ? ' disabled style="opacity:0.4; cursor:not-allowed;"' : '') + '>' + svgEdit() + ' EDIT</button>' +
                '<button class="btn-danger btn-reject" id="btnReject"' + (appState.isStale ? ' disabled style="opacity:0.4; cursor:not-allowed;"' : '') + '>' + svgX() + ' REJECT</button>' +
            '</div>';

        document.getElementById("btnApprove").addEventListener("click", function () {
            if (!appState.analysisComplete || appState.isStale) return;
            showApproveModal();
        });
        document.getElementById("btnEdit").addEventListener("click", function () {
            if (!appState.analysisComplete || appState.isStale) return;
            showEditInterface();
        });
        document.getElementById("btnReject").addEventListener("click", function () {
            if (!appState.analysisComplete || appState.isStale) return;
            showRejectModal();
        });
    }

    // ── Stale Analysis Protection ────────────────────────────
    function markAnalysisStale() {
        if (!appState.analysisComplete) return;
        appState.isStale = true;

        // Render stale banner and disable approval buttons
        restorePendingReview();

        // Update run button to prompt re-run
        runBtn.innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
            ' RUN PMO ANALYSIS (EVIDENCE UPDATED)';
        runBtn.classList.remove("btn-primary--done");
        runBtn.disabled = false;

        // Update status indicator
        var statusInd = document.getElementById("projectStatusIndicator");
        if (statusInd) {
            statusInd.className = "project-status-tag project-status-tag--amber";
            statusInd.innerHTML = '<svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg> Evidence Updated (Re-run Required)';
        }
    }
    window.markAnalysisStale = markAnalysisStale;

    // ── Dynamic Evidence Control (Developer & UI Hook) ────────
    window.setIntegrationDelay = function(days) {
        var d = parseInt(days, 10);
        if (isNaN(d)) d = 0;

        // Update in active inputs
        if (appState.inputs && appState.inputs.milestoneTracker) {
            appState.inputs.milestoneTracker.forEach(function(m) {
                if (m.id === "M-03" || m.milestone === "System Integration") {
                    m.varianceDays = d;
                    m.status = d <= 5 ? "Complete" : (d <= 14 ? "In Progress" : "At Risk");
                    m.forecastDate = d === 0 ? m.plannedDate : (d <= 5 ? "17 Sep 2026" : "06 Oct 2026");
                }
            });
        }

        // Update in SCENARIOS object for persistence
        if (window.SCENARIOS && window.SCENARIOS.integration_recovery && window.SCENARIOS.integration_recovery.milestones) {
            window.SCENARIOS.integration_recovery.milestones.forEach(function(m) {
                if (m.id === "M-03" || m.milestone === "System Integration") {
                    m.varianceDays = d;
                    m.status = d <= 5 ? "Complete" : (d <= 14 ? "In Progress" : "At Risk");
                    m.forecastDate = d === 0 ? m.plannedDate : (d <= 5 ? "17 Sep 2026" : "06 Oct 2026");
                }
            });
        }

        console.log("[DYNAMIC EVIDENCE] System Integration delay updated to: " + d + " days");

        // If analysis is already displayed, mark it stale and lock approval until re-run
        if (appState.analysisComplete) {
            markAnalysisStale();
        }
    };

    // ══════════════════════════════════════════════════════════
    // MAIN HANDLER
    // ══════════════════════════════════════════════════════════

    function handleRunAnalysis() {
        if (appState.isRunning) return;
        
        try {
            appState.isRunning = true;
            appState.isStale = false;

            // 1. Ensure project evidence is loaded
            initProjectData();

            // 2. Run Deterministic Analysis FIRST (Instant Synchronous Assessment)
            var result = runAnalysis();
            if (!result) throw new Error("runAnalysis() returned null or undefined");
            
            appState.analysis = result;

            console.log("[DETERMINISTIC] analysis completed");

            // 3. IMMEDIATE DETERMINISTIC FIRST RENDER
            renderDashboard(appState.analysis);
            renderExceptions(appState.analysis.exceptions);
            renderRecommendation(appState.analysis);
            
            // 4. SHOW WORKFLOW PROGRESSION
            runBtn.disabled = true;
            runBtn.innerHTML = '<span class="ai-loading-spinner" style="width:14px;height:14px;margin:0;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span> ANALYSING PROJECT...';
            
            var steps = [
                "OBSERVING EVIDENCE...", 
                "VALIDATING EVIDENCE...", 
                "COMPARING SOURCES...", 
                "INVESTIGATING PRIORITY ISSUES...", 
                "ASSESSING PROJECT...", 
                "GENERATING MANAGEMENT RECOMMENDATION..."
            ];
            var stepIdx = 0;
            appState.loadingInterval = setInterval(function() {
                if (stepIdx < steps.length) {
                    runBtn.innerHTML = '<span class="ai-loading-spinner" style="width:14px;height:14px;margin:0;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span> ' + steps[stepIdx];
                    stepIdx++;
                }
            }, 600);

            // 5. Yield control and dispatch Gemini API request
            setTimeout(function() {
                try {
                    var abortController = new AbortController();
                    var timeoutId = setTimeout(function() {
                        abortController.abort();
                    }, 30000); // 30-second timeout

                    console.log("[Gemini] API synthesis requested");

                    fetch('/api/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        signal: abortController.signal,
                        body: JSON.stringify({
                            scenario: appState.currentScenarioId,
                            project: "Digital Transformation Programme (VCG-DT-2026)",
                            reportingPeriod: "September 2026",
                            projectStatus: appState.inputs.projectStatusUpdate,
                            riskIssueLog: appState.inputs.riskIssueLog,
                            milestones: appState.inputs.milestoneTracker,
                            meetingNotes: appState.inputs.steeringCommitteeNotes,
                            previousPmoReport: appState.inputs.previousPMOReport
                        })
                    })
                    .then(function(res) {
                        clearTimeout(timeoutId);
                        if (!res.ok) throw new Error("API response not ok: " + res.status);
                        return res.json();
                    })
                    .then(function(data) {
                        if (data.error || data.aiUnavailable || !data.analysis) {
                            throw new Error(data.error || "AI synthesis unavailable");
                        }
                        clearInterval(appState.loadingInterval);
                        appState.analysis.ai = data.analysis;
                        appState.analysisComplete = true;
                        finalizeAnalysisUI();
                    })
                    .catch(function(err) {
                        clearTimeout(timeoutId);
                        clearInterval(appState.loadingInterval);
                        console.warn("Gemini synthesis fallback:", err.message);
                        appState.analysis.aiError = true;
                        appState.analysisComplete = true;
                        finalizeAnalysisUI();
                    });
                } catch(e) {
                    console.error("Timeout Block Error: " + e.message);
                    finalizeAnalysisUI();
                }
            }, 50);
            
        } catch (e) {
            console.error("handleRunAnalysis Error: ", e);
            appState.isRunning = false;
        }
    }

    function finalizeAnalysisUI() {
        var analysis = appState.analysis;
        appState.isRunning = false;
        appState.isStale = false;

        // Render results
        renderDashboard(analysis);
        renderExceptions(analysis.exceptions);
        renderRecommendation(analysis); 

        historySection.style.display = "block";
        runBtn.innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<polyline points="20 6 9 17 4 12"/></svg>' +
            " ANALYSIS COMPLETE";
        runBtn.classList.add("btn-primary--done");
        runBtn.disabled = false;

        var statusInd = document.getElementById("projectStatusIndicator");
        if (statusInd) {
            statusInd.className = "project-status-tag project-status-tag--complete";
            statusInd.innerHTML = '<svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg> Analysis Complete';
        }

        // Check for saved decision
        var saved = loadDecision();
        if (saved) {
            applyDecision(saved);
        } else {
            restorePendingReview();
        }

        console.log("[Vertex PMO] September 2026 project analysis complete.", analysis);
    }

    // ══════════════════════════════════════════════════════════
    // INITIALIZATION & INTERNAL TEST HOOKS
    // ══════════════════════════════════════════════════════════

    function initProjectData() {
        var scenario = (window.SCENARIOS && window.SCENARIOS[appState.currentScenarioId]) || 
                       (window.SCENARIOS && window.SCENARIOS.integration_recovery);
        if (!scenario) return;

        appState.inputs.projectStatusUpdate    = scenario.statusUpdate;
        appState.inputs.riskIssueLog           = scenario.riskLog;
        appState.inputs.milestoneTracker       = scenario.milestones;
        appState.inputs.steeringCommitteeNotes = scenario.steeringNotes;
        appState.inputs.previousPMOReport      = scenario.previousReport;
        appState.dataLoaded = true;

        // Update evidence cards to Loaded state
        cards.forEach(function (card, i) {
            card.classList.add("input-card--loaded");
            if (statusEls[i]) {
                statusEls[i].textContent = "Loaded";
                statusEls[i].classList.add("input-card-status--loaded");
            }
        });
    }

    // Developer hook to test alternative scenario datasets (preserves internal testing)
    window.loadTestScenario = function(scenarioId) {
        if (!window.SCENARIOS || !window.SCENARIOS[scenarioId]) {
            console.warn("Unknown scenario: " + scenarioId + ". Available:", window.SCENARIOS ? Object.keys(window.SCENARIOS) : []);
            return;
        }
        appState.currentScenarioId = scenarioId;
        window.__currentScenarioId = scenarioId;
        appState.analysisComplete = false;
        appState.analysis = null;
        appState.decision = null;

        clearDecision();
        restorePendingReview();
        if (historySection) historySection.style.display = "none";
        if (historyContent) historyContent.innerHTML = "";

        initProjectData();

        runBtn.innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
            ' RUN PMO ANALYSIS';
        runBtn.classList.remove("btn-primary--done");
        runBtn.disabled = false;

        var statusInd = document.getElementById("projectStatusIndicator");
        if (statusInd) {
            statusInd.className = "project-status-tag project-status-tag--ready";
            statusInd.innerHTML = '<svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg> Ready for analysis';
        }

        overallBadge.textContent = "—";
        overallBadge.className = "status-badge status-badge--neutral";
        scheduleVal.textContent = "—";
        scheduleVal.className = "kpi-value kpi-value--none";
        budgetVal.textContent = "—";
        budgetVal.className = "kpi-value kpi-value--none";
        riskVal.textContent = "—";
        riskVal.className = "kpi-value kpi-value--none";

        var topEx = document.getElementById("topExceptionsList");
        if (topEx) topEx.innerHTML = '<div class="placeholder-text">Awaiting analysis...</div>';
        if (recoContainer) recoContainer.innerHTML = '<div class="placeholder-text">Awaiting analysis...</div>';
        var chainEl = document.getElementById("evidenceChainCompact");
        if (chainEl) chainEl.innerHTML = '<div class="placeholder-text">Awaiting analysis...</div>';
        var wfEl = document.getElementById("agentWorkflowCompact");
        if (wfEl) wfEl.innerHTML = '<div class="placeholder-text">Awaiting Agent Analysis</div>';

        console.log("[Developer Hook] Loaded test dataset: " + scenarioId);
    };

    // Pre-load current project evidence on startup
    initProjectData();

    // Event Bindings
    if (runBtn) {
        runBtn.addEventListener("click", handleRunAnalysis);
        runBtn.addEventListener("mouseenter", function() {
            if (appState.analysisComplete && !appState.isRunning) {
                runBtn.innerHTML =
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
                    ' RUN PMO ANALYSIS';
            }
        });
        runBtn.addEventListener("mouseleave", function() {
            if (appState.analysisComplete && !appState.isRunning) {
                runBtn.innerHTML =
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
                    ' ANALYSIS COMPLETE';
            }
        });
    }

    if (btnApprove) btnApprove.addEventListener("click", function () {
        if (!appState.analysisComplete || appState.isStale) return;
        showApproveModal();
    });

    if (btnEdit) btnEdit.addEventListener("click", function () {
        if (!appState.analysisComplete || appState.isStale) return;
        showEditInterface();
    });

    if (btnReject) btnReject.addEventListener("click", function () {
        if (!appState.analysisComplete || appState.isStale) return;
        showRejectModal();
    });

    var btnReset = document.getElementById("btnResetDemo");
    if (btnReset) btnReset.addEventListener("click", function () {
        showResetModal();
    });

    var btnExec = document.getElementById("btnExecutiveView");
    if (btnExec) {
        btnExec.addEventListener("click", function() {
            document.body.classList.toggle("executive-view");
            if (document.body.classList.contains("executive-view")) {
                btnExec.textContent = "EXIT EXECUTIVE VIEW";
            } else {
                btnExec.textContent = "EXECUTIVE VIEW";
            }
        });
    }

    var btnDetails = document.getElementById("btnViewDetails") || document.getElementById("btnViewDetailsTop");
    if (btnDetails) {
        btnDetails.addEventListener("click", function() {
            document.getElementById("analysisDetailsModal").style.display = "flex";
        });
    }

    // Auto-restore saved decision if present
    var initialSaved = loadDecision();
    if (initialSaved) {
        handleRunAnalysis();
    }

})();
