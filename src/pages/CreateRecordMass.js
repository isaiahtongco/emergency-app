import React, { useState } from "react";
import { Button } from "@ui5/webcomponents-react";
import Papa from "papaparse"; // ✅ Ensure it's installed: npm install papaparse
import axios from "axios";

const CreateRecordMass = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [csvData, setCsvData] = useState([]);

  // 📌 Handle File Upload & Parsing
  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];

    if (!file) {
      setUploadStatus("⚠️ No file selected.");
      console.error("No file selected");
      return;
    }

    console.log("🟢 File Selected:", file.name); // ✅ Debugging log

    setSelectedFile(file); // ✅ Store the selected file

    Papa.parse(file, {
      header: true, // ✅ Parses CSV headers
      skipEmptyLines: true,
      complete: (result) => {
        if (!result.data || result.data.length === 0) {
          setUploadStatus("❌ CSV file is empty or incorrectly formatted.");
          console.error("CSV file is empty or incorrectly formatted.");
          return;
        }
        console.log("🟢 Parsed CSV Data:", result.data); // ✅ Debugging log
        setCsvData(result.data);
        setUploadStatus(`✅ File "${file.name}" loaded successfully. Ready for upload.`);
      },
      error: (error) => {
        setUploadStatus(`❌ Error parsing file: ${error.message}`);
        console.error("❌ Error parsing file:", error.message);
      },
    });
  };

  // 📌 Function to Upload CSV Data
  const handleUpload = async () => {
    if (!selectedFile || csvData.length === 0) {
      setUploadStatus("⚠️ Please select and parse a file first.");
      return;
    }

    setUploadStatus("⏳ Uploading records...");

    let successCount = 0;
    let failedCount = 0;

    for (const record of csvData) {
      try {
        await axios.post("https://icttestalarm.com:3000/api/ict_alarm_account", {
          accountName: record["Account Name"],
          firstName: record["First Name"],
          lastName: record["Last Name"],
          address: record["Address"],
          phoneNumbers: record["Phone Number"] ? record["Phone Number"].split(",") : [],
          email: record["Email"] || "",
          emergencyContact: record["Emergency Contact"] || "",
        });

        successCount++;
      } catch (error) {
        console.error("❌ Failed to save:", record, error);
        failedCount++;
      }
    }

    setUploadStatus(`✅ Upload complete! Success: ${successCount}, Failed: ${failedCount}`);
  };

  // 📌 Function to Download Template
  const downloadTemplate = () => {
    const sampleData = [
      ["John Doe Corp", "John", "Doe", "123 Main St, City", "09123456789", "john@example.com", "0987654321"],
      ["Jane Smith LLC", "Jane", "Smith", "456 Elm St, City", "09234567890", "jane@example.com", "0976543210"]
    ];

    const csv = Papa.unparse({
      fields: ["Account Name", "First Name", "Last Name", "Address", "Phone Number", "Email", "Emergency Contact"],
      data: sampleData, 
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "MassUploadTemplate.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ backgroundColor: "blue", color: "white", textAlign: "center", padding: "1rem", marginBottom: "1rem" }}>
        Mass Upload
      </h2>

      {/* 📌 Buttons for Download & Upload */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "1rem" }}>
        <Button onClick={downloadTemplate}>Download Template (CSV)</Button>
        {/* ✅ Fixed: Replaced with a standard file input */}
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          style={{ cursor: "pointer", padding: "0.5rem" }} 
        />
        <Button onClick={handleUpload} design="Emphasized">Upload</Button>
      </div>

      {/* 📌 Upload Status Messages */}
      {uploadStatus && <p style={{ textAlign: "center", color: "blue" }}>{uploadStatus}</p>}

      {/* 📌 Debugging Uploaded Data */}
      {csvData.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Uploaded CSV Data Preview:</h3>
          <pre>{JSON.stringify(csvData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default CreateRecordMass;
