import { useState, useEffect } from "react";
import Papa from "papaparse";

const useDriveData = (csvUrl) => {
  const [data, setData] = useState([]);
console.log("CSV URL from .env:", csvUrl);
  useEffect(() => {
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      complete: (results) => setData(results.data),
    });
  }, [csvUrl]);

  return data;
};

export default useDriveData;
