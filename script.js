document.addEventListener("DOMContentLoaded", async () => {
    try {
      await tableau.extensions.initializeAsync();
      const dashboard = tableau.extensions.dashboardContent.dashboard;
      const worksheet = dashboard.worksheets.find(w => w.name === "Offline Tracker");
      if (!worksheet) throw new Error("Worksheet 'Offline Tracker' not found");
  
      const options = { maxRows: 0, ignoreAliases: false, ignoreSelection: true, includeAllColumns: true };
      const dataTable = await worksheet.getUnderlyingDataAsync(options);
  
      // Map your groups and their child columns
      const groups = {
        "Attempted": [
          "Less than 15 min att", "Less than 30 min att", "30 to 1 att", "1 to 3 att",
          "3 to 6 att", "6 to 12 att", "12 to 24 att", "24 to 48 att", "48 to 72 att", ">72 att",
          "<15 min att%", "15-30 att%", "30-1 % att", "1-3hr % att", "3-6 % att", "6-12 % att",
          "12-24 % att", "24-48 % att", "48-72 % att", ">72 % att"
        ],
        "Connected": [
          "Less than 15 cnt", "Less than 30 min cnt", "30 to 1 cnt", "1 to 3 cnt",
          "3 to 6 cnt", "6 to 12 cnt", "12 to 24 cnt", "48 to 72 cnt", ">72 cnt",
          "<15 min % cnt", "<30 min % cnt", "30-1 % cnt", "1-3 % cnt", "3-6 % cnt", "6-12 % cnt",
          "12-24 % cnt", "24-48 % cnt", "48-72 % cnt", ">72 % cnt"
        ],
        "Non Contact": [
          "DNP 1", "DNP 2", "DNP 3", "DNP 4", "DNP 5", "DNP 5+"
        ],
        "Connect/Assign %": [
          "Followup", "Not Interested", "Callback", "Centre_City_Missmatch",
          "Invalid Lead", "Language Barrier", "No_responce", "PTP"
        ]
      };
  
      // Extract columns and data rows from Tableau
      const columns = dataTable.columns.map(c => c.fieldName);
      const rows = dataTable.data.map(row => {
        const obj = {};
        row.forEach((cell, i) => obj[columns[i]] = cell.formattedValue);
        return obj;
      });
  
      // Build Tabulator columns with toggles
      let tabulatorColumns = [];
  
      // Helper to generate toggle buttons for groups
      const toggleStates = {}; // track expanded/collapsed state
  
      Object.keys(groups).forEach(mainCol => {
        toggleStates[mainCol] = false; // collapsed by default
  
        // Add main column with toggle button
        tabulatorColumns.push({
          title: `<span class="toggle-btn" data-group="${mainCol}">▶</span>${mainCol}`,
          field: mainCol,
          formatter: "plaintext",
          width: 150,
        });
  
        // Add child columns hidden by default
        groups[mainCol].forEach(childCol => {
          tabulatorColumns.push({
            title: childCol,
            field: childCol,
            visible: false, // hide initially
            width: 120,
          });
        });
      });
  
      // Initialize Tabulator
      const table = new Tabulator("#table", {
        data: rows,
        columns: tabulatorColumns,
        layout: "fitDataTable",
        autoColumns: false,
      });
  
      // Handle toggle button clicks
      document.querySelector("#table").addEventListener("click", (e) => {
        if (e.target.classList.contains("toggle-btn")) {
          const group = e.target.getAttribute("data-group");
          toggleStates[group] = !toggleStates[group];
  
          // Update toggle arrow
          e.target.textContent = toggleStates[group] ? "▼" : "▶";
  
          // Show or hide child columns accordingly
          groups[group].forEach(childCol => {
            if (toggleStates[group]) {
              table.showColumn(childCol);
            } else {
              table.hideColumn(childCol);
            }
          });
        }
      });
  
    } catch (err) {
      console.error(err);
      document.body.innerHTML = "<h3>Error loading extension: " + err.message + "</h3>";
    }
});
