import { useEffect, useState } from "react";
import Papa from "papaparse";
import styles from "./Project.module.css";
import Modal from "../Modal";
import * as pdfjsLib from "pdfjs-dist";
import {
  FaFilePdf,
  FaImages,
  FaFilePowerpoint,
  FaFileAlt,
  FaVideo,
  FaCertificate,
  FaSpinner,
  FaImage,
  FaAlignLeft,
} from "react-icons/fa";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const sheetUrl = import.meta.env.VITE_SHEET_URL;

const RESOURCE_DETAILS = {
  "Innovata Certificates": { icon: <FaCertificate />, name: "Certificates" },
  "Innovata Papers": { icon: <FaFilePdf />, name: "Papers" },
  "Innovata Pictures": { icon: <FaImages />, name: "Pictures Link" },
  "Innovata PPTs": { icon: <FaFilePowerpoint />, name: "Presentation" },
  "Innovata Reports": { icon: <FaFileAlt />, name: "Reports" },
  "Innovata Videos": { icon: <FaVideo />, name: "Videos" },
};
const RESOURCE_FIELDS_ORDER = Object.keys(RESOURCE_DETAILS);

const extractTextFromPDF = async (blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";

  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    text += strings.join(" ") + "\n\n";
  }

  return text.trim();
};

const Project = () => {
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState("");
  const [availableSchemes, setAvailableSchemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAbstract, setCurrentAbstract] = useState({
    title: "",
    content: "",
  });

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
        const rows = results.data.filter((r) => r["Scheme"] && r["Team No"]);

        const processedRows = rows.map((row) => {
          const teamNo = String(row["Team No"] || "").trim();
          const thumbnailUrl = teamNo
            ? `${IMAGE_BASE_PATH}${teamNo}${IMAGE_EXTENSION}`
            : null;

          return {
            ...row,
            localThumbnailUrl: thumbnailUrl,
            projectTitle: row["Project Info"] || `Team ${teamNo}'s Project`,
            abstractContent:
              row["Project Abstract"]?.trim() || "Abstract not available.",
          };
        });

        setAllData(processedRows);

        const schemesList = [
          ...new Set(processedRows.map((r) => String(r["Scheme"]))),
        ].sort((a, b) => b.localeCompare(a));

        setAvailableSchemes(schemesList);
        if (schemesList.length > 0) {
          setSelectedScheme(schemesList[0]);
        }

        setIsLoading(false);
      },
      error: (err) => {
        console.error("Error parsing Google Sheet:", err);
        setError("Failed to load project data.");
        setIsLoading(false);
      },
    });
  }, []);

  // useEffect(() => {
  //   setIsLoading(true);
  //   setError(null);

  //   Papa.parse(sheetUrl, {
  //     download: true,
  //     header: true,
  //     skipEmptyLines: true,
  //     complete: async (results) => {
  //       const rows = results.data.filter((r) => r["Scheme"] && r["Team No"]);

  //       const processedRows = rows.map((row) => {
  //         const teamNo = String(row["Team No"] || "").trim();
  //         const thumbnailUrl = teamNo
  //           ? `${IMAGE_BASE_PATH}${teamNo}${IMAGE_EXTENSION}`
  //           : null;

  //         return {
  //           ...row,
  //           localThumbnailUrl: thumbnailUrl,
  //           abstractLink: row["Project Abstract"] || null,
  //           abstractContent: "", // placeholder
  //           projectTitle: row["Project Info"] || `Team ${teamNo}'s Project`,
  //         };
  //       });

  //       // Fetch abstracts
  //       const updatedRows = await Promise.all(
  //         processedRows.map(async (team) => {
  //           if (!team.abstractLink) return team;
  //           try {
  //             const res = await fetch(
  //               `https://corsproxy.io/?${encodeURIComponent(team.abstractLink)}`
  //             );
  //             const blob = await res.blob();
  //             const pdfText = await extractTextFromPDF(blob);
  //             return {
  //               ...team,
  //               abstractContent: pdfText || "Could not extract abstract.",
  //             };
  //           } catch (err) {
  //             console.error(
  //               `Error loading abstract for Team ${team["Team No"]}`,
  //               err
  //             );
  //             return { ...team, abstractContent: "Failed to load abstract." };
  //           }
  //         })
  //       );

  //       setAllData(updatedRows);

  //       // Now extract and set unique schemes
  //       const uniqueSchemes = [
  //         ...new Set(updatedRows.map((r) => String(r["Scheme"]))),
  //       ].sort((a, b) => b.localeCompare(a));

  //       setAvailableSchemes(uniqueSchemes);
  //       if (uniqueSchemes.length > 0) {
  //         setSelectedScheme(uniqueSchemes[0]);
  //       }

  //       setIsLoading(false);
  //     },
  //     error: (err) => {
  //       console.error("Error fetching or parsing project data:", err);
  //       setError("Failed to load project data. Please try again later.");
  //       setIsLoading(false);
  //     },
  //   });
  // }, []);

  const openAbstractModal = (team) => {
    const projectTitle =
      team.projectTitle || `Team ${team["Team No"] || "N/A"}'s Project`;
    setCurrentAbstract({
      title: `Abstract: ${projectTitle}`,
      content: team.abstractContent || "No abstract available.",
    });
    setIsModalOpen(true);
  };

  const closeAbstractModal = () => {
    setIsModalOpen(false);
    setCurrentAbstract({ title: "", content: "" });
  };

  const filteredAndSearchedTeams = allData
    .filter(
      (team) => !selectedScheme || String(team["Scheme"]) === selectedScheme
    )
    .filter((team) => {
      if (!searchTerm) return true;
      const teamNo = String(team["Team No"] || "").toLowerCase();
      const projectTitle = String(team.projectTitle || "").toLowerCase();
      return (
        teamNo.includes(searchTerm.toLowerCase()) ||
        projectTitle.includes(searchTerm.toLowerCase())
      );
    });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner
          className={styles.loadingSpinner}
          aria-label="Loading projects"
        />
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
          Discover innovative projects from our talented students, filterable by
          academic scheme.
        </p>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label htmlFor="schemeSelector" className={styles.filterLabel}>
            Academic Scheme:
          </label>
          <select
            id="schemeSelector"
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value)}
            className={styles.schemeSelect}
            disabled={availableSchemes.length === 0 && isLoading}
          >
            {availableSchemes.map((scheme) => (
              <option key={scheme} value={scheme}>
                {scheme}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="searchProjects" className={styles.filterLabel}>
            Search:
          </label>
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
            const showImage =
              team.localThumbnailUrl && team.localThumbnailUrl.trim() !== "";
            return (
              <div
                className={styles.teamCard}
                key={`${team["Scheme"]}-${team["Team No"]}-${idx}`}
              >
                <div className={styles.projectThumbnailWrapper}>
                  <img
                    src={team.localThumbnailUrl}
                    alt={`Project thumbnail for Team ${team["Team No"]}`}
                    className={styles.projectThumbnail}
                    style={{ display: showImage ? "block" : "none" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      const placeholder = e.target.nextElementSibling;
                      if (
                        placeholder &&
                        placeholder.classList.contains(
                          styles.thumbnailPlaceholder
                        )
                      ) {
                        placeholder.style.display = "flex";
                      }
                    }}
                  />
                  <div
                    className={styles.thumbnailPlaceholder}
                    style={{ display: showImage ? "none" : "flex" }}
                  >
                    <FaImage />
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.projectTitle}>{team.projectTitle}</h3>
                    <span className={styles.teamNumber}>
                      Team {team["Team No"]}
                    </span>
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
                            title={`Open ${
                              RESOURCE_DETAILS[field]?.name ||
                              field.replace("Innovata ", "")
                            }`}
                          >
                            {RESOURCE_DETAILS[field]?.icon || <FaFileAlt />}
                            <span className={styles.resourceName}>
                              {RESOURCE_DETAILS[field]?.name ||
                                field.replace("Innovata ", "")}
                            </span>
                          </a>
                        ) : null
                      )}
                    </div>
                    {RESOURCE_FIELDS_ORDER.every((field) => !team[field]) && (
                      <p className={styles.noResources}>
                        No resources linked for this project.
                      </p>
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
            <button
              onClick={() => setSearchTerm("")}
              className={styles.clearSearchButton}
            >
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
        <p>{currentAbstract.content}</p>
      </Modal>
    </div>
  );
};

export default Project;
