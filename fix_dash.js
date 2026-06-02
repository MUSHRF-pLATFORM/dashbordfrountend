const fs = require('fs');

const dashPath = '/Users/pro/Desktop/projects/dashbordfrountend/src/pages/DashboardWithDatabase.tsx';
let dashContent = fs.readFileSync(dashPath, 'utf8');

// 1. Remove loadActivityLog function properly
const loadFuncStart = '  // تحميل سجل العمليات (مع دعم Load More)';
const getStatusColorStart = '  const getStatusColor = (status: string) => {';
const startIdx = dashContent.indexOf(loadFuncStart);
const endIdx = dashContent.indexOf(getStatusColorStart);
if (startIdx > -1 && endIdx > -1) {
  dashContent = dashContent.substring(0, startIdx) + dashContent.substring(endIdx);
}

// 2. Remove UI block properly
const uiStartStr = '      {/* ===== قسم سجل آخر العمليات ===== */}';
const endDashStr = '    </Box>\n  );\n};\n\nexport default DashboardWithDatabase;';
const uiStartIdx = dashContent.indexOf(uiStartStr);
const endDashIdx = dashContent.indexOf(endDashStr);
if (uiStartIdx > -1 && endDashIdx > -1) {
  dashContent = dashContent.substring(0, uiStartIdx) + endDashStr;
}

fs.writeFileSync(dashPath, dashContent);
console.log('Dashboard fixed.');
