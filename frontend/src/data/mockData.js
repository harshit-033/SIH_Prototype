/**
 * SIH1730 AI-Assisted Institutional Inspection Platform - Central Mock Data
 */

export const MOCK_INSTITUTIONS = [
  {
    id: "INST-001",
    name: "GL Bajaj Institute of Technology & Management",
    code: "C-46182",
    aishe: "U-0512",
    location: "Greater Noida, Uttar Pradesh",
    region: "Northern Region",
    activeInspection: "Annual Accreditation & Infrastructure Audit — 2026",
    inspectionDate: "2026-08-18",
    inspectorName: "Dr. K. S. Ramanujan (Chief Inspector)",
    complianceScore: 84,
    status: "In Progress",
    risk: "Medium",
    findingsCount: 5,
    pendingActions: 2,
    totalLabs: 14,
    totalFaculty: 168,
    totalComputersDeclared: 420,
    totalComputersDiscovered: 408
  },
  {
    id: "INST-002",
    name: "ABC Engineering College",
    code: "C-32910",
    aishe: "U-0244",
    location: "Bengaluru, Karnataka",
    region: "Southern Region",
    activeInspection: "Regular Quality Assurance Inspection",
    inspectionDate: "2026-07-29",
    inspectorName: "Prof. Meenakshi Sundaram",
    complianceScore: 92,
    status: "Compliant",
    risk: "Low",
    findingsCount: 1,
    pendingActions: 0,
    totalLabs: 18,
    totalFaculty: 210,
    totalComputersDeclared: 550,
    totalComputersDiscovered: 552
  },
  {
    id: "INST-003",
    name: "XYZ University Institute of Science & Tech",
    code: "C-11094",
    aishe: "U-0089",
    location: "Jaipur, Rajasthan",
    region: "Western Region",
    activeInspection: "Special Defect & Infrastructure Review",
    inspectionDate: "2026-08-10",
    inspectorName: "Dr. Anirudh Mehta",
    complianceScore: 61,
    status: "Action Required",
    risk: "High",
    findingsCount: 8,
    pendingActions: 5,
    totalLabs: 8,
    totalFaculty: 95,
    totalComputersDeclared: 250,
    totalComputersDiscovered: 215
  },
  {
    id: "INST-004",
    name: "National Institute of Technology (NIT Trichy Campus)",
    code: "C-59821",
    aishe: "U-0411",
    location: "Tiruchirappalli, Tamil Nadu",
    region: "Southern Region",
    activeInspection: "Periodic Five-Year Regulatory Audit",
    inspectionDate: "2026-06-15",
    inspectorName: "Dr. S. K. Bhattacharya",
    complianceScore: 98,
    status: "Compliant",
    risk: "Low",
    findingsCount: 0,
    pendingActions: 0,
    totalLabs: 28,
    totalFaculty: 340,
    totalComputersDeclared: 920,
    totalComputersDiscovered: 924
  }
];

export const ACTIVE_INSPECTION_DETAIL = {
  id: "INSP-2026-GLB-01",
  institution: "GL Bajaj Institute of Technology & Management",
  title: "Annual Institutional Inspection — 2026",
  inspector: "Dr. K. S. Ramanujan",
  dateScheduled: "18 Aug 2026 - 22 Aug 2026",
  currentStage: "Inspector Verification",
  overallProgress: 68,
  sections: [
    { name: "Infrastructure & Structural Safety", progress: 100, status: "Verified", icon: "fa-building" },
    { name: "Laboratories & Systems", progress: 85, status: "Needs Verification", icon: "fa-flask" },
    { name: "Faculty Credentials & Roster", progress: 90, status: "Verified", icon: "fa-user-graduate" },
    { name: "Document Intelligence (OCR)", progress: 75, status: "Needs Review", icon: "fa-file-invoice" },
    { name: "Technical Assets & Networks", progress: 80, status: "Needs Verification", icon: "fa-network-wired" },
    { name: "Safety & Fire Compliance", progress: 50, status: "Action Required", icon: "fa-shield-halved" }
  ],
  workflowSteps: [
    { step: 1, name: "Institution Info", status: "completed", desc: "Declared profiles & regulatory baseline" },
    { step: 2, name: "Evidence Collection", status: "completed", desc: "CCTV frames, scanner sweeps & doc uploads" },
    { step: 3, name: "AI Analysis", status: "completed", desc: "YOLO detection, OCR extraction & heuristics" },
    { step: 4, name: "Expected vs Actual", status: "completed", desc: "Automated multi-source discrepancy matching" },
    { step: 5, name: "Findings Summary", status: "active", desc: "Review 5 flagged items with AI confidence" },
    { step: 6, name: "Inspector Verification", status: "active", desc: "Human decision: Confirm, Reject, or Request" },
    { step: 7, name: "Final Report", status: "pending", desc: "Seal compliance report & generate official PDF" }
  ]
};

export const MOCK_LABS = [
  {
    id: "LAB-01",
    name: "AI & ML Supercomputing Lab",
    building: "APJ Abdul Kalam Block",
    room: "Lab 304, 3rd Floor",
    cameraRef: "LAB-CAM-01",
    declaredPCs: 30,
    detectedCctvPCs: 28,
    discoveredScannerPCs: 29,
    onlinePCs: 27,
    osSummary: "Ubuntu 22.04 LTS / CUDA 12.2",
    hardwareSpecs: "Intel i9-13900K, 64GB DDR5, NVIDIA RTX 4090 24GB, 1TB NVMe",
    complianceStatus: "Needs Verification",
    discrepancyNote: "1 PC not detected by CCTV camera due to angle obstruction; 29 responding to network ping.",
    lastScan: "2026-08-20 11:15:00",
    switchIp: "152.20.21.1",
    gpuCount: 30
  },
  {
    id: "LAB-02",
    name: "Advanced Computer Networks & Security Lab",
    building: "Aryabhata Engineering Complex",
    room: "Lab 102, 1st Floor",
    cameraRef: "LAB-CAM-02",
    declaredPCs: 35,
    detectedCctvPCs: 35,
    discoveredScannerPCs: 35,
    onlinePCs: 34,
    osSummary: "Kali Linux / Windows 11 Enterprise (Dual Boot)",
    hardwareSpecs: "Intel Core i7-12700, 32GB RAM, Intel UHD 770, Dual 1Gbps NIC",
    complianceStatus: "Compliant",
    discrepancyNote: "All declared equipment accounted for. Hardware matched declared spec.",
    lastScan: "2026-08-20 11:18:22",
    switchIp: "152.20.16.1",
    gpuCount: 0
  },
  {
    id: "LAB-03",
    name: "IoT & Embedded Systems Workspace",
    building: "Ramanujan Innovation Hub",
    room: "Lab 201, 2nd Floor",
    cameraRef: "LAB-CAM-03",
    declaredPCs: 25,
    detectedCctvPCs: 23,
    discoveredScannerPCs: 23,
    onlinePCs: 22,
    osSummary: "Windows 10 Pro / Raspberry Pi OS",
    hardwareSpecs: "Intel Core i5-11400, 16GB RAM, 512GB SSD + Logic Analyzers",
    complianceStatus: "Deficiency",
    discrepancyNote: "2 declared high-performance workstations missing from room inventory.",
    lastScan: "2026-08-20 10:45:10",
    switchIp: "152.20.23.1",
    gpuCount: 0
  },
  {
    id: "LAB-04",
    name: "Cloud Computing & DevOps Lab",
    building: "APJ Abdul Kalam Block",
    room: "Lab 402, 4th Floor",
    cameraRef: "LAB-CAM-04",
    declaredPCs: 40,
    detectedCctvPCs: 40,
    discoveredScannerPCs: 40,
    onlinePCs: 39,
    osSummary: "Red Hat Enterprise Linux 9",
    hardwareSpecs: "AMD Ryzen 9 7900X, 64GB ECC RAM, 2TB Enterprise SSD",
    complianceStatus: "Compliant",
    discrepancyNote: "Full inventory verified against purchase order PO-2024-918.",
    lastScan: "2026-08-20 11:10:05",
    switchIp: "152.20.30.1",
    gpuCount: 10
  }
];

export const MOCK_EVIDENCE = {
  visual: [
    {
      id: "VIS-01",
      camera: "LAB-CAM-01",
      location: "AI & ML Supercomputing Lab (Room 304)",
      timestamp: "2026-08-20 11:14:32 IST",
      model: "YOLOv8s-Monitor & YOLO11s-Seg",
      confidence: 0.94,
      detections: [
        { label: "Computer Monitors", count: 28, expected: 30, conf: "94.2%" },
        { label: "Active Student Terminals", count: 14, expected: "N/A", conf: "91.8%" },
        { label: "Lab Equipment Racks", count: 2, expected: 2, conf: "97.1%" }
      ],
      aiRemarks: "28 Monitors identified with high confidence (>0.90). 2 workstations obscured by pillar in Sector B.",
      status: "AI Detected",
      imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "VIS-02",
      camera: "STRUCT-CAM-08",
      location: "Mechanical Block - Eastern Exterior Wall",
      timestamp: "2026-08-20 09:30:15 IST",
      model: "YOLO11s-Seg (Structural Defect)",
      confidence: 0.89,
      detections: [
        { label: "Hairline Crack (Defect Class 0)", count: 1, conf: "89.4%" },
        { label: "Minor Spalling (Defect Class 1)", count: 1, conf: "83.1%" }
      ],
      aiRemarks: "Surface hairline crack detected (approx length 1.2m). Segmentation mask calculated. Structural integrity risk: Low.",
      status: "AI Flagged",
      imageUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1000&q=80"
    }
  ],
  technical: [
    {
      id: "TECH-01",
      scope: "AI & ML Lab Network Subnet (152.20.21.0/24)",
      declaredCount: 30,
      discoveredCount: 29,
      onlineCount: 27,
      offlineCount: 2,
      agentType: "client.py Telemetry Agent v2.4",
      lastSeen: "2026-08-20 11:20:00",
      sampleHosts: [
        { hostname: "AIML-WS-01", ip: "152.20.21.164", os: "Ubuntu 22.04.3 LTS", cpu: "12.4%", ram: "44.2%", status: "Online" },
        { hostname: "AIML-WS-02", ip: "152.20.21.212", os: "Ubuntu 22.04.3 LTS", cpu: "2.1%", ram: "38.5%", status: "Online" },
        { hostname: "AIML-WS-03", ip: "152.20.21.66", os: "Windows 11 Enterprise", cpu: "--", ram: "--", status: "Offline" }
      ]
    }
  ],
  documents: [
    {
      id: "DOC-01",
      name: "Faculty_Appointment_Letters_CSE_2025-26.pdf",
      category: "Faculty Qualifications",
      uploadDate: "2026-08-14",
      ocrStatus: "OCR Verified (100%)",
      verificationStatus: "Verified",
      expiryDate: "2027-06-30",
      extractedData: {
        totalFacultyDeclared: 168,
        phdHoldersExtracted: 62,
        cadreRatio: "1:2:6 (Prof : Assoc : Asst)",
        aiConfidence: "98.4%"
      }
    },
    {
      id: "DOC-02",
      name: "Building_Fire_Safety_NOC_Certificate.pdf",
      category: "Safety Certificates",
      uploadDate: "2026-08-12",
      ocrStatus: "OCR Extracted",
      verificationStatus: "Needs Review",
      expiryDate: "2026-05-15 (EXPIRED)",
      extractedData: {
        issuingAuthority: "Fire Service Directorate, UP State",
        certificateNo: "F-NOC/2023/8819",
        validityEnd: "2026-05-15",
        statusFlag: "EXPIRED_PRIOR_TO_AUDIT"
      }
    },
    {
      id: "DOC-03",
      name: "NVIDIA_RTX_Workstations_Purchase_Bill_PO891.pdf",
      category: "Equipment Records",
      uploadDate: "2026-08-10",
      ocrStatus: "OCR Verified",
      verificationStatus: "Verified",
      expiryDate: "Warranty: 2027-09-01",
      extractedData: {
        vendor: "CompTech Enterprise Solutions Pvt Ltd",
        unitCount: 30,
        gpuModel: "NVIDIA RTX 4090 24GB",
        serialNumbersExtracted: 30
      }
    }
  ]
};

export const MOCK_RECONCILIATION_CARDS = [
  {
    id: "REC-01",
    title: "AI & ML Lab — Computer Inventory Verification",
    category: "Hardware Reconciliation",
    expected: "30 Computers Declared",
    actual: "29 Discovered (28 CCTV Detectable)",
    discrepancyType: "Inventory Count Mismatch",
    severity: "Medium",
    status: "Requires Inspector Verification",
    evidenceSources: ["LAB-CAM-01 (28)", "Network Subnet Ping (29)", "Purchase Order PO891 (30)"],
    aiReasoning: "29 systems pinging on local subnet 152.20.21.0/24 with valid MAC addresses. One system (AIML-WS-30) unreachable. 1 terminal obstructed in CCTV field of view.",
    inspectorVerdict: "Pending Human Review"
  },
  {
    id: "REC-02",
    title: "Python Runtime & Deep Learning Toolchain",
    category: "Software Specification",
    expected: "Python >= 3.11 with PyTorch 2.2+",
    actual: "Python 3.9.10 on 6 Terminals",
    discrepancyType: "Software Version Deficiency",
    severity: "Medium",
    status: "Deficiency Identified",
    evidenceSources: ["Agent client.py Environment Telemetry"],
    aiReasoning: "Telemetry scan detected Python 3.9 on terminals AIML-WS-11 through 16, violating curriculum standard CS-702 requirement.",
    inspectorVerdict: "Needs Correction Notice"
  },
  {
    id: "REC-03",
    title: "Institutional Fire Safety NOC Certificate",
    category: "Regulatory Safety Compliance",
    expected: "Valid NOC Certificate for 2026-27",
    actual: "Certificate Expired on 15 May 2026",
    discrepancyType: "Compliance Document Lapsed",
    severity: "High",
    status: "Deficiency Identified",
    evidenceSources: ["OCR Document: Building_Fire_Safety_NOC.pdf"],
    aiReasoning: "OCR extracted expiration timestamp 2026-05-15 is earlier than the inspection date (2026-08-18). Renewal application receipt not uploaded.",
    inspectorVerdict: "Urgent Rectification Required"
  },
  {
    id: "REC-04",
    title: "Faculty Cadre & PhD Qualification Ratio",
    category: "Academic Faculty Cadre",
    expected: "Min 35% PhD Faculty in CSE Dept",
    actual: "36.9% PhD Faculty (62 of 168)",
    discrepancyType: "No Discrepancy (Compliant)",
    severity: "Low",
    status: "Verified Compliant",
    evidenceSources: ["HR Portal Seed", "OCR Degree Verification"],
    aiReasoning: "All 62 doctorate certificates cross-verified with university awarding database.",
    inspectorVerdict: "Compliant & Confirmed"
  }
];

export const MOCK_FINDINGS = [
  {
    id: "FND-101",
    category: "Laboratory Hardware",
    description: "Physical count discrepancy in AI & ML Lab: 30 declared vs 29 discovered on subnet.",
    evidenceRef: "VIS-01 & TECH-01",
    severity: "Medium",
    aiConfidence: 0.94,
    status: "Needs Verification",
    decision: null,
    comments: "",
    suggestedRemedy: "Physically verify terminal AIML-WS-30 power status and camera angle coverage."
  },
  {
    id: "FND-102",
    category: "Safety & Compliance",
    description: "Building Fire Safety NOC certificate expired on 15 May 2026 without renewal receipt.",
    evidenceRef: "DOC-02",
    severity: "High",
    aiConfidence: 0.99,
    status: "AI Flagged",
    decision: null,
    comments: "",
    suggestedRemedy: "Issue formal 15-day compliance notice to furnish UP Fire Directorate renewal NOC."
  },
  {
    id: "FND-103",
    category: "Curriculum Software",
    description: "Outdated Python 3.9 runtime detected on 6 workstations in AI & ML Lab (Required: Python 3.11+).",
    evidenceRef: "TECH-01",
    severity: "Low",
    aiConfidence: 0.96,
    status: "Confirmed",
    decision: "Confirmed Deficiency",
    comments: "Verified by Inspector during live terminal sample test.",
    suggestedRemedy: "Update lab environment to Python 3.11 virtual environment."
  },
  {
    id: "FND-104",
    category: "Infrastructure",
    description: "Surface hairline crack detected by exterior inspection camera on Mechanical Block Eastern Wall.",
    evidenceRef: "VIS-02",
    severity: "Low",
    aiConfidence: 0.89,
    status: "Needs Verification",
    decision: null,
    comments: "",
    suggestedRemedy: "Request civil maintenance certificate of building structural soundness."
  },
  {
    id: "FND-105",
    category: "Laboratory Assets",
    description: "2 Workstations in IoT Workspace (Lab 201) offline and unlocated during continuous scanner sweep.",
    evidenceRef: "LAB-03",
    severity: "Medium",
    aiConfidence: 0.91,
    status: "Needs Verification",
    decision: null,
    comments: "",
    suggestedRemedy: "College to submit asset relocation transfer voucher or equipment repair log."
  }
];

export const MOCK_ASSETS = [
  { id: "AST-8810", type: "PC", hostname: "AIML-WS-01", ip: "152.20.21.164", mac: "D4:5D:64:88:E1:52", location: "AI & ML Lab (Room 304)", os: "Ubuntu 22.04", cpu: "Intel i9 13th Gen", ram: "64 GB", gpu: "RTX 4090", status: "Online", lastSeen: "Just now" },
  { id: "AST-8811", type: "PC", hostname: "AIML-WS-02", ip: "152.20.21.212", mac: "F8:E4:3B:6B:3F:BD", location: "AI & ML Lab (Room 304)", os: "Ubuntu 22.04", cpu: "Intel i9 13th Gen", ram: "64 GB", gpu: "RTX 4090", status: "Online", lastSeen: "Just now" },
  { id: "AST-8812", type: "PC", hostname: "AIML-WS-03", ip: "152.20.21.66", mac: "A2:9C:11:4F:8D:0B", location: "AI & ML Lab (Room 304)", os: "Ubuntu 22.04", cpu: "Intel i9 13th Gen", ram: "64 GB", gpu: "RTX 4090", status: "Offline", lastSeen: "3 hours ago" },
  { id: "AST-9001", type: "Server", hostname: "GLB-COMPUTE-SVR01", ip: "152.20.21.5", mac: "00:1E:67:D8:99:A1", location: "Server Room B", os: "RHEL 9.2", cpu: "Dual Xeon Gold 6430", ram: "256 GB", gpu: "4x A100 80GB", status: "Online", lastSeen: "Just now" },
  { id: "AST-9015", type: "Switch", hostname: "SW-AIML-CORE-01", ip: "152.20.21.1", mac: "38:22:D6:01:A4:CC", location: "AI & ML Lab Rack", os: "Cisco IOS-XE 17.6", cpu: "Managed L3", ram: "8 GB", gpu: "--", status: "Online", lastSeen: "Just now" },
  { id: "AST-9022", type: "Access Point", hostname: "AP-LAB-304-WIFI6", ip: "152.20.21.10", mac: "B4:FB:E4:11:22:33", location: "Room 304 Ceiling", os: "ArubaOS 8.10", cpu: "Dual-Radio", ram: "1 GB", gpu: "--", status: "Online", lastSeen: "Just now" },
  { id: "AST-9040", type: "Printer", hostname: "PRT-AIML-LASER", ip: "152.20.21.45", mac: "64:51:06:FE:DC:BA", location: "Room 304 Faculty Corner", os: "HP JetDirect", cpu: "Print Engine", ram: "512 MB", gpu: "--", status: "Online", lastSeen: "12 mins ago" },
  { id: "AST-9055", type: "Laboratory Equipment", hostname: "EQP-LOGIC-ANALYZER-01", ip: "152.20.23.88", mac: "10:65:30:44:99:10", location: "IoT Lab (Room 201)", os: "Embedded RTOS", cpu: "FPGA Controller", ram: "4 GB", gpu: "--", status: "Maintenance", lastSeen: "1 day ago" }
];

export const MOCK_COLLEGE_FACULTY = [
  { id: "FAC-101", name: "Dr. Rajesh Sharma", dept: "Computer Science & Eng", designation: "Professor & HOD", qualification: "Ph.D. (IIT Delhi)", experience: "18 Years", document: "Ph.D. Degree & Service Record", status: "Verified" },
  { id: "FAC-102", name: "Dr. Sunita Rao", dept: "AI & Machine Learning", designation: "Associate Professor", qualification: "Ph.D. (IISc Bangalore)", experience: "11 Years", document: "Doctorate Degree & AICTE ID", status: "Verified" },
  { id: "FAC-103", name: "Prof. Anil Kumar", dept: "Information Technology", designation: "Assistant Professor", qualification: "M.Tech (NIT Trichy)", experience: "6 Years", document: "M.Tech Certificate & Form 16", status: "Pending" },
  { id: "FAC-104", name: "Dr. Priya Deshmukh", dept: "Cyber Security", designation: "Associate Professor", qualification: "Ph.D. (BITS Pilani)", experience: "9 Years", document: "Ph.D. Notification & Patents", status: "Verified" },
  { id: "FAC-105", name: "Prof. Vikram Singh", dept: "Computer Science & Eng", designation: "Assistant Professor", qualification: "M.Tech (IIIT Hyderabad)", experience: "4 Years", document: "Degree Verification Pending", status: "Needs Review" }
];

export const MOCK_CORRECTIVE_ACTIONS = [
  {
    id: "CAP-01",
    findingId: "FND-102",
    title: "Renewal of Building Fire Safety NOC Certificate",
    description: "Submit renewed Fire Safety NOC or valid deposit receipt issued by UP Fire Services Directorate.",
    deadline: "2026-09-05",
    submittedEvidence: "Application_Receipt_FireNOC_Renewal_Ref_981.pdf",
    submittedAt: "2026-08-19 16:30",
    status: "Under Review",
    inspectorNotes: "Receipt submitted. Final NOC copy expected within 15 days."
  },
  {
    id: "CAP-02",
    findingId: "FND-103",
    title: "Upgrade AI Lab Workstations to Python 3.11 Runtime",
    description: "Re-image or update workstations AIML-WS-11 through 16 with Python 3.11 and verify PyTorch toolchain.",
    deadline: "2026-08-25",
    submittedEvidence: "Lab_Maintenance_Log_Upgrade_Batch2.pdf",
    submittedAt: "2026-08-20 09:15",
    status: "Submitted",
    inspectorNotes: "Awaiting inspector re-scan validation."
  },
  {
    id: "CAP-03",
    findingId: "FND-105",
    title: "IoT Lab Missing Workstations Asset Audit",
    description: "Provide physical location transfer challan for 2 workstations moved to project lab.",
    deadline: "2026-08-28",
    submittedEvidence: null,
    submittedAt: null,
    status: "Pending",
    inspectorNotes: "College action required."
  }
];
