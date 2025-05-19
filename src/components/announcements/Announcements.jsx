import { useState, useEffect } from "react";
import Papa from "papaparse";
import styles from "./Announcements.module.css";
import {
  FaBullhorn,
  FaSpinner,
  FaExternalLinkAlt,
  FaFilePdf,
} from "react-icons/fa";

const sheetUrl = import.meta.env.VITE_SHEET_URL;
const ANNOUNCEMENT_LINK_COLUMN = "Innovata Announcements";
const ANNOUNCEMENT_TITLE_COLUMN = "Announcement Title";
const ANNOUNCEMENT_DATE_COLUMN = "Announcement Date";
const ANNOUNCEMENT_SUMMARY_COLUMN = "Announcement Summary";

// Component to display individual announcement
const AnnouncementItem = ({ announcement, index }) => {
  const title =
    announcement[ANNOUNCEMENT_TITLE_COLUMN] || `Announcement #${index + 1}`;
  const dateStr = announcement[ANNOUNCEMENT_DATE_COLUMN] || null;
  const summary =
    announcement[ANNOUNCEMENT_SUMMARY_COLUMN] ||
    "View the announcement for more details.";
  const link = announcement[ANNOUNCEMENT_LINK_COLUMN];
  const isPdf = link && link.toLowerCase().includes(".pdf");

  return (
    <div className={styles.announcementItem}>
      <div className={styles.itemHeader}>
        <h3 className={styles.itemTitle}>{title}</h3>
        {!isPdf && dateStr && (
          <span className={styles.itemDate}>
            {new Date(dateStr).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        )}
      </div>
      <p className={styles.itemSummary}>{summary}</p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.itemLink}
      >
        {isPdf ? (
          <>
            <FaFilePdf /> View PDF
          </>
        ) : (
          <>
            <FaExternalLinkAlt /> View Details
          </>
        )}
      </a>
    </div>
  );
};

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    Papa.parse(sheetUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const relevantRows = results.data.filter(
          (row) =>
            row[ANNOUNCEMENT_LINK_COLUMN] &&
            row[ANNOUNCEMENT_LINK_COLUMN].trim().length > 0
        );

        setAnnouncements(relevantRows);
        setIsLoading(false);
      },
      error: (err) => {
        console.error("Error fetching announcements:", err);
        setError("Failed to load announcements. Please try again later.");
        setIsLoading(false);
      },
    });
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.loadingSpinner} />
        <p>Loading Announcements...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.announcementsPage}>
      <div className={styles.pageHeader}>
        <FaBullhorn className={styles.headerIcon} />
        <h1 className={styles.pageTitle}>Announcements</h1>
        <p className={styles.pageSubtitle}>
          Stay updated with the latest news and notices from the department.
        </p>
      </div>

      {announcements.length > 0 ? (
        <div className={styles.announcementsList}>
          {announcements.map((announcementData, index) => (
            <AnnouncementItem
              key={index}
              announcement={announcementData}
              index={index}
            />
          ))}
        </div>
      ) : (
        <p className={styles.noAnnouncements}>
          No announcements posted yet. Please check back later.
        </p>
      )}
    </div>
  );
}

export default Announcements;

// import { useState, useEffect } from "react"; // Assuming useDriveData might not expose loading/error
// import Papa from "papaparse"; // Using PapaParse directly for clearer loading/error handling here
// import styles from "./Announcements.module.css";
// import {
//   FaBullhorn,
//   FaSpinner,
//   FaExternalLinkAlt,
//   FaFilePdf,
//   FaCalendarAlt,
// } from "react-icons/fa"; // Example icons

// const sheetUrl = import.meta.env.VITE_SHEET_URL;

// // Helper to attempt to parse date for sorting
// const parseDate = (dateStr) => {
//   if (!dateStr) return null;
//   // Attempt common formats, e.g., YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY
//   // This is basic; a robust solution might need a library like date-fns if formats vary widely
//   try {
//     const D_M_Y_Dash = /^\d{1,2}-\d{1,2}-\d{4}$/;
//     const D_M_Y_Slash = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
//     const Y_M_D_Dash = /^\d{4}-\d{1,2}-\d{1,2}$/;

//     let date;
//     if (Y_M_D_Dash.test(dateStr)) {
//       // YYYY-MM-DD
//       date = new Date(dateStr);
//     } else if (D_M_Y_Slash.test(dateStr)) {
//       // DD/MM/YYYY or MM/DD/YYYY - assumes MM/DD/YYYY for JS Date
//       const parts = dateStr.split("/");
//       date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`); // Convert to YYYY-MM-DD for consistency
//     } else if (D_M_Y_Dash.test(dateStr)) {
//       // DD-MM-YYYY
//       const parts = dateStr.split("-");
//       date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // Convert to YYYY-MM-DD format for Date constructor
//     } else {
//       date = new Date(dateStr); // Generic attempt
//     }
//     return isNaN(date.getTime()) ? null : date;
//   } catch (e) {
//     return null;
//   }
// };

// const AnnouncementItem = ({ announcement, index }) => {
//   // Default values if specific fields are missing
//   const title =
//     announcement["Announcement Title"] || `Announcement #${index + 1}`;
//   const dateStr = announcement["Announcement Date"] || null;
//   const summary =
//     announcement["Announcement Summary"] ||
//     "View the announcement for more details.";
//   const link = announcement["Announcements"]; // The link itself
//   const type = announcement["Announcement Type"] || "General"; // Optional

//   const formattedDate = dateStr
//     ? new Date(dateStr).toLocaleDateString("en-GB", {
//         day: "numeric",
//         month: "long",
//         year: "numeric",
//       })
//     : null;

//   // Simple heuristic to guess if it's a PDF for icon
//   const isPdf = link && link.toLowerCase().includes(".pdf");

//   return (
//     <div className={styles.announcementItem}>
//       <div className={styles.itemHeader}>
//         <h3 className={styles.itemTitle}>{title}</h3>
//         {formattedDate && (
//           <span className={styles.itemDate}>
//             <FaCalendarAlt /> {formattedDate}
//           </span>
//         )}
//       </div>
//       {/* <p className={styles.itemType}>{type}</p> */}{" "}
//       {/* Uncomment if you use Announcement Type */}
//       <p className={styles.itemSummary}>{summary}</p>
//       <a
//         href={link}
//         target="_blank"
//         rel="noopener noreferrer"
//         className={styles.itemLink}
//       >
//         {isPdf ? (
//           <>
//             <FaFilePdf /> View PDF
//           </>
//         ) : (
//           <>
//             <FaExternalLinkAlt /> View Details
//           </>
//         )}
//       </a>
//     </div>
//   );
// };

// function Announcements() {
//   const [announcements, setAnnouncements] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     setIsLoading(true);
//     setError(null);
//     Papa.parse(sheetUrl, {
//       download: true,
//       header: true,
//       skipEmptyLines: true,
//       complete: (results) => {
//         const relevantRows = results.data.filter(
//           (row) => row.Announcements && row.Announcements.trim().length > 0
//         );

//         // Sort by date if "Announcement Date" column exists, most recent first
//         if (relevantRows.length > 0 && relevantRows[0]["Announcement Date"]) {
//           relevantRows.sort((a, b) => {
//             const dateA = parseDate(a["Announcement Date"]);
//             const dateB = parseDate(b["Announcement Date"]);
//             if (dateA && dateB) return dateB - dateA; // Sort descending
//             if (dateA) return -1; // A has date, B doesn't, A comes first
//             if (dateB) return 1; // B has date, A doesn't, B comes first
//             return 0; // Neither has a valid date
//           });
//         }
//         setAnnouncements(relevantRows);
//         setIsLoading(false);
//       },
//       error: (err) => {
//         console.error("Error fetching announcements:", err);
//         setError("Failed to load announcements. Please try again later.");
//         setIsLoading(false);
//       },
//     });
//   }, []);

//   if (isLoading) {
//     return (
//       <div className={styles.loadingContainer}>
//         <FaSpinner className={styles.loadingSpinner} />
//         <p>Loading Announcements...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return <div className={styles.errorContainer}>{error}</div>;
//   }

//   return (
//     <div className={styles.announcementsPage}>
//       <div className={styles.pageHeader}>
//         <FaBullhorn className={styles.headerIcon} />
//         <h1 className={styles.pageTitle}>Announcements</h1>
//         <p className={styles.pageSubtitle}>
//           Stay updated with the latest news and notices from the department.
//         </p>
//       </div>

//       {announcements.length > 0 ? (
//         <div className={styles.announcementsList}>
//           {announcements.map((announcementData, index) => (
//             <AnnouncementItem
//               key={index}
//               announcement={announcementData}
//               index={index}
//             />
//           ))}
//         </div>
//       ) : (
//         <p className={styles.noAnnouncements}>
//           No announcements posted yet. Please check back later.
//         </p>
//       )}
//     </div>
//   );
// }

// export default Announcements;
