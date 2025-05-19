// src/components/guidelines/Guidelines.jsx
import { useState, useEffect } from "react";
import Papa from "papaparse";
import styles from "./Guidelines.module.css"; // We'll keep using this new CSS module file
import { FaBookOpen, FaSpinner, FaLink, FaListOl, FaFilter } from 'react-icons/fa';

const sheetUrl = import.meta.env.VITE_SHEET_URL;

// Hardcoded link names based on order for each phase
// THIS IS FRAGILE. If the order of links in your Google Sheet cell changes, these names will be wrong.
const PHASE_LINK_NAMES = {
  "Phase-1": [
    "Literature Survey Guidelines",
    "Introduction & Report Format",
    "Project Guidelines",
    "Synopsis Guidelines",
  ],
  "Phase-2": [
    "Evaluation Annexure",
    "Presentation Template",
    "Final Report Front sheet",
  ],
};

function Guidelines() {
  const [phaseData, setPhaseData] = useState({}); // Stores { "Phase-1": [links], "Phase-2": [links] }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // For dropdowns - scheme will be hardcoded for now
  const [availableSchemes, setAvailableSchemes] = useState(["2021"]); // Hardcoded default scheme
  const [selectedScheme, setSelectedScheme] = useState("2021");    // Default selected scheme

  const [availablePhases, setAvailablePhases] = useState([]); // ["Phase-1", "Phase-2"]
  const [selectedPhase, setSelectedPhase] = useState(""); // e.g., "Phase-1"

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    Papa.parse(sheetUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Find the first row that actually has data in "Phase-1" or "Phase-2" columns
        const rowWithGuidelineData = results.data.find(
          (r) => (r["Phase-1"] && r["Phase-1"].trim() !== "") ||
                 (r["Phase-2"] && r["Phase-2"].trim() !== "")
        );

        if (!rowWithGuidelineData) {
          setError("No guideline data found in the sheet for Phase-1 or Phase-2.");
          setIsLoading(false);
          setAvailablePhases([]); // No data, no phases
          return;
        }

        const extractedPhaseData = {};
        const phasesFound = [];

        if (rowWithGuidelineData["Phase-1"]) {
          extractedPhaseData["Phase-1"] = rowWithGuidelineData["Phase-1"]
            .split(/\r?\n/) // Split by newline (Unix or Windows)
            .map((url) => url.trim())
            .filter((url) => url.startsWith("http"));
          if (extractedPhaseData["Phase-1"].length > 0) phasesFound.push("Phase-1");
        } else {
          extractedPhaseData["Phase-1"] = [];
        }

        if (rowWithGuidelineData["Phase-2"]) {
          extractedPhaseData["Phase-2"] = rowWithGuidelineData["Phase-2"]
            .split(/\r?\n/)
            .map((url) => url.trim())
            .filter((url) => url.startsWith("http"));
          if (extractedPhaseData["Phase-2"].length > 0) phasesFound.push("Phase-2");
        } else {
          extractedPhaseData["Phase-2"] = [];
        }
        
        setPhaseData(extractedPhaseData);
        setAvailablePhases(phasesFound);

        if (phasesFound.length > 0) {
          setSelectedPhase(phasesFound[0]); // Select the first available phase by default
        } else {
            setError("No valid guideline links found for Phase-1 or Phase-2.");
        }
        setIsLoading(false);
      },
      error: (err) => {
        console.error("Error fetching guidelines:", err);
        setError("Failed to load guidelines. Please try again later.");
        setIsLoading(false);
      },
    });
  }, []); // Empty dependency array: fetch data once on mount

  // Get the links for the currently selected phase and scheme.
  // Since scheme handling is simplified (hardcoded), we mainly use selectedPhase.
  const currentPhaseLinks = phaseData[selectedPhase] || [];

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.loadingSpinner} />
        <p>Loading Guidelines...</p>
      </div>
    );
  }

  // No need to show error if there are selectable phases, error handles catastrophic failure
  // The "No links available" message will handle empty phases.

  return (
    <div className={styles.guidelinesPage}>
      <div className={styles.pageHeader}>
        <FaBookOpen className={styles.headerIcon} />
        <h1 className={styles.pageTitle}>Innovata Guidelines</h1>
        <p className={styles.pageSubtitle}>Find all necessary guidelines and templates for project phases.</p>
      </div>

      <div className={styles.filtersSection}>
        {/* Scheme Dropdown - Currently hardcoded */}
        <div className={styles.filterGroup}>
          <label htmlFor="schemeFilter" className={styles.filterLabel}><FaFilter /> Select Scheme:</label>
          <select
            id="schemeFilter"
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value)}
            className={styles.filterSelect}
            disabled={availableSchemes.length <= 1 && isLoading} // Disable if only one or loading
          >
            {availableSchemes.map(scheme => (
              <option key={scheme} value={scheme}>{scheme}</option>
            ))}
          </select>
        </div>

        {/* Phase Dropdown/Buttons - based on fetched data */}
        {availablePhases.length > 0 && (
          <div className={styles.filterGroup}>
            <label htmlFor="phaseFilter" className={styles.filterLabel}><FaListOl /> Select Phase:</label>
            <select
              id="phaseFilter"
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className={styles.filterSelect}
            >
              {/* Option to select no phase or a placeholder */}
              {/* <option value="">-- Select a Phase --</option> */}
              {availablePhases.map(phase => (
                <option key={phase} value={phase}>{phase.replace("-", " ")}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {error && !isLoading && ( /* Display critical errors */
         <div className={styles.errorContainer}>{error}</div>
      )}


      {!isLoading && !error && selectedPhase && (
        <div className={styles.guidelinesContent}>
          <h2 className={styles.selectedPhaseTitle}>
            {selectedPhase.replace("-", " ")} Guidelines ({selectedScheme})
          </h2>
          {currentPhaseLinks.length > 0 ? (
            <ul className={styles.guidelinesList}>
              {currentPhaseLinks.map((link, index) => {
                // Get the hardcoded name based on phase and index
                const linkName = PHASE_LINK_NAMES[selectedPhase]?.[index] || `Guideline Link ${index + 1}`;
                return (
                  <li key={index} className={styles.guidelineItem}>
                    <FaLink className={styles.linkIcon} />
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.guidelineName}
                      title={`Open ${linkName}`}
                    >
                      {linkName}
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.noGuidelinesMessage}>
              No guideline links found for {selectedPhase.replace("-", " ")} in scheme {selectedScheme}.
            </p>
          )}
        </div>
      )}

      {!isLoading && !error && !selectedPhase && availablePhases.length > 0 && (
        <p className={styles.noGuidelinesMessage}>Please select a phase to view guidelines for scheme {selectedScheme}.</p>
      )}
       {!isLoading && !error && availablePhases.length === 0 && !error && (
        <p className={styles.noGuidelinesMessage}>No guidelines available for scheme {selectedScheme}.</p>
      )}
      {!isLoading && !error && availableSchemes.length === 0 && (
         <p className={styles.noGuidelinesMessage}>No schemes available to display guidelines.</p>
      )}


    </div>
  );
}

export default Guidelines;