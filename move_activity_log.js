const fs = require('fs');
const path = require('path');

const dashPath = '/Users/pro/Desktop/projects/dashbordfrountend/src/pages/DashboardWithDatabase.tsx';
const loginPath = '/Users/pro/Desktop/projects/dashbordfrountend/src/pages/LoginActivity.js';

let dashContent = fs.readFileSync(dashPath, 'utf8');
let loginContent = fs.readFileSync(loginPath, 'utf8');

// 1. Remove imports from dashboard
dashContent = dashContent.replace(/import \{ ActivityLogEntry \} from '\.\.\/api\/dashboard';\n/, '');
dashContent = dashContent.replace(/import \{ fetchActivityLog \} from '\.\.\/api\/dashboard';\n/, '');

// 2. Remove states from dashboard
const statesRegex = /\s*\/\/ سجل العمليات\n\s*const \[activityLog, setActivityLog\].*?\n\s*const \[activityNextCursor, setActivityNextCursor\].*?\n\s*const \[activityHasMore, setActivityHasMore\].*?\n\s*const \[activityLoading, setActivityLoading\].*?\n\s*const \[activityLoadError, setActivityLoadError\].*?\n/;
dashContent = dashContent.replace(statesRegex, '');

// 3. Remove loadActivityLog function from dashboard
const loadFuncRegex = /\s*\/\/ تحميل سجل العمليات \(مع دعم Load More\)[\s\S]*?setActivityLoading\(false\);\n\s*\};\n/;
dashContent = dashContent.replace(loadFuncRegex, '');

// 4. Remove loadActivityLog call from useEffect
dashContent = dashContent.replace(/\s*loadActivityLog\(\);\n/, '\n');

// 5. Extract UI
const uiStartStr = '      {/* ===== قسم سجل آخر العمليات ===== */}';
const uiStartIndex = dashContent.indexOf(uiStartStr);
const gridEndStr = '      </Grid>\n\n';
const gridEndIndex = dashContent.indexOf(gridEndStr) + gridEndStr.length;

if (uiStartIndex > -1) {
  const uiContent = dashContent.substring(uiStartIndex);
  
  // We want to delete from uiStartIndex to the end of the Box wrapper, which is right before </Box>\n    </Container> or similar at the end of the file.
  // Let's just find the closing tags of the dashboard.
  const endDash = `      </Box>\n    </Container>\n  );\n};\n\nexport default DashboardWithDatabase;`;
  const endDashIndex = dashContent.indexOf(endDash);
  
  const extractedUi = dashContent.substring(uiStartIndex, endDashIndex);
  
  dashContent = dashContent.substring(0, uiStartIndex) + endDash;
  
  fs.writeFileSync('extracted_ui.txt', extractedUi);
}

fs.writeFileSync(dashPath, dashContent);
console.log('Dashboard cleaned up and UI extracted.');
