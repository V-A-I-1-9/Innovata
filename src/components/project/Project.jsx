// src/components/project/Project.jsx
import { useEffect, useState } from "react";
import Papa from "papaparse";
import styles from "./Project.module.css";
import Modal from "../Modal"; // Ensure this path is correct for your Modal.jsx
import {
  FaFilePdf, FaImages, FaFilePowerpoint, FaFileAlt, FaVideo, FaCertificate, FaSpinner, FaImage,
  FaAlignLeft, // Icon for Abstract button
} from 'react-icons/fa';

const sheetUrl = import.meta.env.VITE_SHEET_URL;

const RESOURCE_DETAILS = {
  "Innovata Abstract": { icon: <FaAlignLeft />, name: "Abstract" },
  "Innovata Certificates": { icon: <FaCertificate />, name: "Certificates" },
  "Innovata Papers": { icon: <FaFilePdf />, name: "Papers" },
  "Innovata Pictures": { icon: <FaImages />, name: "Pictures Link" },
  "Innovata PPTs": { icon: <FaFilePowerpoint />, name: "Presentation" },
  "Innovata Reports": { icon: <FaFileAlt />, name: "Reports" },
  "Innovata Videos": { icon: <FaVideo />, name: "Videos" },
};
const RESOURCE_FIELDS_ORDER = Object.keys(RESOURCE_DETAILS).filter(key => key !== "Innovata Abstract");

const Project = () => {
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState("");
  const [availableSchemes, setAvailableSchemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAbstract, setCurrentAbstract] = useState({ title: "", content: "" });

  const IMAGE_BASE_PATH = "/project-thumbnails/";
  const IMAGE_EXTENSION = "-image.jpg";

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    Papa.parse(sheetUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.filter(
          (r) => r["Scheme"] && r["Team No"]
        );

        const processedRows = rows.map(row => {
          const teamNo = String(row["Team No"] || "").trim();
          let thumbnailUrl = null;
          if (teamNo) {
            thumbnailUrl = `${IMAGE_BASE_PATH}${teamNo}${IMAGE_EXTENSION}`;
          }

          const abstractText = `This is a placeholder abstract for Team ${teamNo || 'N/A'}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

          return {
            ...row,
            localThumbnailUrl: thumbnailUrl,
            abstractContent: abstractText,
          };
        });

        setAllData(processedRows);
        const schemes = [...new Set(processedRows.map((r) => String(r["Scheme"])))].sort(
          (a, b) => b.localeCompare(a)
        );
        setAvailableSchemes(schemes);
        if (schemes.length > 0) {
          setSelectedScheme(schemes[0]);
        }
        setIsLoading(false);
      },
      error: (err) => {
        console.error("Error fetching or parsing project data:", err);
        setError("Failed to load project data. Please try again later.");
        setIsLoading(false);
      },
    });
  }, [IMAGE_BASE_PATH, IMAGE_EXTENSION]);

  const openAbstractModal = (team) => {
    const projectTitle = team["Project Title"] || `Team ${team["Team No"] || 'N/A'}'s Project`;
    setCurrentAbstract({
      title: `Abstract: ${projectTitle}`,
      content: team.abstractContent
    });
    setIsModalOpen(true);
  };

  const closeAbstractModal = () => {
    setIsModalOpen(false);
    setCurrentAbstract({ title: "", content: "" });
  };

  const filteredAndSearchedTeams = allData
    .filter((team) => !selectedScheme || String(team["Scheme"]) === selectedScheme)
    .filter((team) => {
      if (!searchTerm) return true;
      const teamNo = String(team["Team No"] || "").toLowerCase();
      const projectTitle = String(team["Project Title"] || "").toLowerCase();
      return teamNo.includes(searchTerm.toLowerCase()) || projectTitle.includes(searchTerm.toLowerCase());
    });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.loadingSpinner} aria-label="Loading projects" />
        <p>Loading Projects...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.projectsPageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Student Projects</h1>
        <p className={styles.pageSubtitle}>
          Discover innovative projects from our talented students, filterable by academic scheme.
        </p>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label htmlFor="schemeSelector" className={styles.filterLabel}>Academic Scheme:</label>
          <select
            id="schemeSelector"
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value)}
            className={styles.schemeSelect}
            disabled={availableSchemes.length === 0 && isLoading}
          >
            {isLoading && <option value="">Loading schemes...</option>}
            {!isLoading && availableSchemes.length === 0 && <option value="">No schemes available</option>}
            {availableSchemes.map((scheme) => (
              <option key={scheme} value={scheme}>{scheme}</option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="searchProjects" className={styles.filterLabel}>Search:</label>
          <input
            type="text"
            id="searchProjects"
            placeholder="Team No or Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {filteredAndSearchedTeams.length > 0 ? (
        <div className={styles.projectsGrid}>
          {filteredAndSearchedTeams.map((team, idx) => {
            // Determine if the image should be shown based on a valid localThumbnailUrl
            const showImage = team.localThumbnailUrl && team.localThumbnailUrl.trim() !== "";

            return (
              <div className={styles.teamCard} key={`${team["Scheme"]}-${team["Team No"]}-${idx}`}>
                <div className={styles.projectThumbnailWrapper}>
                  <img
                    src={team.localThumbnailUrl}
                    alt={`Project thumbnail for Team ${team["Team No"]}`}
                    className={styles.projectThumbnail}
                    style={{ display: showImage ? 'block' : 'none' }} // Show if showImage is true
                    onError={(e) => {
                      e.target.style.display = 'none'; // Hide the broken image
                      const placeholder = e.target.nextElementSibling;
                      if (placeholder && placeholder.classList.contains(styles.thumbnailPlaceholder)) {
                        placeholder.style.display = 'flex'; // Show the placeholder
                      }
                    }}
                  />
                  <div
                    className={styles.thumbnailPlaceholder}
                    style={{ display: showImage ? 'none' : 'flex' }} // Show if showImage is false
                  >
                    <FaImage />
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    {team["Project Title"] ? (
                      <h3 className={styles.projectTitle}>{team["Project Title"]}</h3>
                    ) : (
                      <h3 className={styles.projectTitle}>Team Project</h3>
                    )}
                    <span className={styles.teamNumber}>Team {team["Team No"]}</span>
                  </div>

                  <button
                    className={styles.abstractButton}
                    onClick={() => openAbstractModal(team)}
                    aria-label={`View abstract for Team ${team["Team No"]}`}
                  >
                    <FaAlignLeft /> View Abstract
                  </button>

                  <div className={styles.resourcesSection}>
                    <h4 className={styles.resourcesTitle}>Resources:</h4>
                    <div className={styles.resourcesList}>
                      {RESOURCE_FIELDS_ORDER.map((field) =>
                        team[field] ? (
                          <a
                            key={field}
                            href={team[field]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.resourceLink}
                            title={`Open ${RESOURCE_DETAILS[field]?.name || field.replace("Innovata ", "")}`}
                          >
                            {RESOURCE_DETAILS[field]?.icon || <FaFileAlt />}
                            <span className={styles.resourceName}>
                              {RESOURCE_DETAILS[field]?.name || field.replace("Innovata ", "")}
                            </span>
                          </a>
                        ) : null
                      )}
                    </div>
                    {RESOURCE_FIELDS_ORDER.every(field => !team[field]) && (
                      <p className={styles.noResources}>No resources linked for this project.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.noProjectsFound}>
          <p>No projects found for the selected scheme or search term.</p>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className={styles.clearSearchButton}>
              Clear Search
            </button>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeAbstractModal}
        title={currentAbstract.title}
      >
        {currentAbstract.content.split('\n').map((paragraph, index) => (
            paragraph.trim() ? <p key={index}>{paragraph}</p> : null
        ))}
      </Modal>
    </div>
  );
};

export default Project;