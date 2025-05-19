// src/components/prizes/Prizes.jsx
import { useState, useEffect } from "react";
import Papa from "papaparse";
import styles from "./Prizes.module.css";
import { FaTrophy, FaSpinner, FaExternalLinkAlt, FaUsers, FaProjectDiagram, FaCalendarAlt } from 'react-icons/fa';

const sheetUrl = import.meta.env.VITE_SHEET_URL;

// Represents one prize entry
const PrizeItem = ({ prizeData }) => {
  // Define expected fields from your Google Sheet, with fallbacks
  const category = prizeData["Prize Category"] || prizeData["Event Name"] || "General Awards";
  const prizeName = prizeData["Prize Name"] || "Award";
  const winners = prizeData["Winner Name(s) / Team Name"] || "To Be Announced";
  const projectTitle = prizeData["Project Title (if applicable)"] || null;
  const detailsLink = prizeData["Prizes"]; // Your existing column for the main link
  const year = prizeData["Year"] || prizeData["Scheme"] || null;

  return (
    <div className={styles.prizeItem}>
      <div className={styles.prizeIconColor}>
        <FaTrophy className={styles.trophyIcon}/>
      </div>
      <div className={styles.prizeDetails}>
        {year && <span className={styles.prizeYear}><FaCalendarAlt /> {year}</span>}
        <h3 className={styles.prizeCategory}>{category}</h3>
        <h4 className={styles.prizeName}>{prizeName}</h4>
        
        <p className={styles.prizeWinner}>
          <FaUsers /> Winner(s): <strong>{winners}</strong>
        </p>
        {projectTitle && (
          <p className={styles.prizeProject}>
            <FaProjectDiagram /> Project: <em>{projectTitle}</em>
          </p>
        )}
        {detailsLink && (
          <a
            href={detailsLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.detailsLink}
          >
            View Full List / Details <FaExternalLinkAlt />
          </a>
        )}
      </div>
    </div>
  );
};


function Prizes() {
  const [prizesData, setPrizesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(""); // To filter by year

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    Papa.parse(sheetUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Filter for rows that have at least a "Prizes" link or a "Prize Category/Event Name"
        const relevantRows = results.data.filter(
          (row) => (row.Prizes && row.Prizes.trim().length > 0) ||
                     (row["Prize Category"] && row["Prize Category"].trim().length > 0) ||
                     (row["Event Name"] && row["Event Name"].trim().length > 0)
        );
        setPrizesData(relevantRows);

        // Extract and set available years for filtering
        const years = [...new Set(relevantRows.map(r => r["Year"] || r["Scheme"]).filter(Boolean))]
                      .sort((a, b) => b.localeCompare(a)); // Sort descending
        setAvailableYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0]); // Default to latest year
        }

        setIsLoading(false);
      },
      error: (err) => {
        console.error("Error fetching prize data:", err);
        setError("Failed to load prize information. Please try again later.");
        setIsLoading(false);
      },
    });
  }, []);

  const filteredPrizes = prizesData.filter(prize => 
    !selectedYear || (prize["Year"] || prize["Scheme"]) === selectedYear
  );

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.loadingSpinner} />
        <p>Loading Prize Information...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.prizesPage}>
      <div className={styles.pageHeader}>
        <FaTrophy className={styles.headerIcon} />
        <h1 className={styles.pageTitle}>Awards & Recognition</h1>
        <p className={styles.pageSubtitle}>Celebrating the outstanding achievements of our students and their projects.</p>
      </div>

      {availableYears.length > 1 && ( // Show year filter only if multiple years exist
        <div className={styles.filterContainer}>
          <label htmlFor="yearFilter" className={styles.filterLabel}>Filter by Year/Scheme:</label>
          <select
            id="yearFilter"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={styles.yearSelect}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}

      {filteredPrizes.length > 0 ? (
        <div className={styles.prizesGrid}>
          {filteredPrizes.map((prize, index) => (
            <PrizeItem key={index} prizeData={prize} />
          ))}
        </div>
      ) : (
        <p className={styles.noPrizes}>No prize information available for the selected year, or no prizes have been posted yet.</p>
      )}
    </div>
  );
}

export default Prizes;