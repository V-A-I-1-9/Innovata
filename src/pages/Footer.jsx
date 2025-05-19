// src/pages/Footer.jsx
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content-wrapper"> {/* To constrain width like header/main */}
        <div className="footer-section about-department">
          <h4 className="footer-heading">Information Science & Engineering</h4>
          <p className="university-affiliation">Maharaja Institute of Technology Mysore</p>
          <img src="/assets/MIT.webp" alt="MIT Mysore Logo" className="footer-logo mit-logo-footer" />
          <img src="/assets/ISE.webp" alt="ISE Department Logo" className="footer-logo ise-logo-footer" />
        </div>

        <div className="footer-section contact-info">
          <h4 className="footer-heading">Contact</h4>
          <p className="hod-name">Dr. Sharath Kumar Y H</p>
          <p className="hod-title">Professor & Head, Dept. of IS&E</p>
          <div className="contact-links">
            <a href="tel:+919480849443" className="footer-link">
              {/* Optional: Add an icon here */}
              Mobile: +91 94808 49443
            </a>
            <a href="tel:08236292601" className="footer-link">
              {/* Optional: Add an icon here */}
              Telephone: 08236-292601
            </a>
            {/* Consider adding an email link if available */}
            {/* <a href="mailto:email@example.com" className="footer-link">Email Us</a> */}
          </div>
        </div>

        {/* Optional: Add another section for Quick Links if needed later */}
        {/* <div className="footer-section quick-links">
          <h4 className="footer-heading">Quick Links</h4>
          <a href="/events" className="footer-link">Events</a>
          <a href="/gallery" className="footer-link">Gallery</a>
        </div> */}

      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear}, Department of Information Science & Engineering, MIT Mysore. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;