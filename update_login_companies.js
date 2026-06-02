const fs = require('fs');

const loginPath = '/Users/pro/Desktop/projects/dashbordfrountend/src/pages/LoginActivity.js';
let content = fs.readFileSync(loginPath, 'utf8');

// 1. Add fetchCompanies import
if (!content.includes('fetchCompanies')) {
  content = content.replace(
    "import { fetchActivityLog } from '../api/dashboard';",
    "import { fetchActivityLog } from '../api/dashboard';\nimport { fetchCompanies } from '../api/database-api';"
  );
}

// 2. Add state
if (!content.includes('const [companiesData, setCompaniesData]')) {
  content = content.replace(
    "const [activityLoadError, setActivityLoadError] = useState(null);",
    "const [activityLoadError, setActivityLoadError] = useState(null);\n  const [companiesData, setCompaniesData] = useState([]);"
  );
}

// 3. Add load logic to useEffect or just a new loadCompanies func
const loadCompaniesStr = `
  const loadCompanies = async () => {
    try {
      const result = await fetchCompanies({ limit: 500, page: 1 });
      if (result && result.companies) {
        setCompaniesData(result.companies);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };
`;

if (!content.includes('loadCompanies()')) {
  content = content.replace(
    "// تحميل سجل العمليات",
    loadCompaniesStr + "\n  // تحميل سجل العمليات"
  );
  
  content = content.replace(
    "loadActivityLog();",
    "loadActivityLog();\n    loadCompanies();"
  );
}

// 4. Update the render loop to use companiesData
const renderStrOld = "const cName = entry.companyName;";
const renderStrNew = "const comp = companiesData.find(c => String(c.id) === String(entry.companyId));\n                                const cName = entry.companyName || (comp ? comp.name : null);";

content = content.replace(renderStrOld, renderStrNew);

// Also need to update the first tab "الأنشطة" table cells, where it says "شركة: {activity.IDCompany || 'غير محدد'}"
const tableCompanyOld = "شركة: {activity.IDCompany || 'غير محدد'}";
const tableCompanyNew = "شركة: {companiesData.find(c => String(c.id) === String(activity.IDCompany))?.name || activity.IDCompany || 'غير محدد'}";

content = content.replace(tableCompanyOld, tableCompanyNew);

fs.writeFileSync(loginPath, content);
console.log('LoginActivity updated to show company names.');
