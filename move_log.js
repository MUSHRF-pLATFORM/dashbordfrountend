const fs = require('fs');

const dashPath = '/Users/pro/Desktop/projects/dashbordfrountend/src/pages/DashboardWithDatabase.tsx';
let dashContent = fs.readFileSync(dashPath, 'utf8');

// 1. Remove imports
dashContent = dashContent.replace(/import \{ ActivityLogEntry \} from '\.\.\/api\/dashboard';\n/, '');
dashContent = dashContent.replace(/import \{ fetchActivityLog \} from '\.\.\/api\/dashboard';\n/, '');

// 2. Remove states
const statesRegex = /\s*\/\/ سجل العمليات\n\s*const \[activityLog, setActivityLog\].*?\n\s*const \[activityNextCursor, setActivityNextCursor\].*?\n\s*const \[activityHasMore, setActivityHasMore\].*?\n\s*const \[activityLoading, setActivityLoading\].*?\n\s*const \[activityLoadError, setActivityLoadError\].*?\n/;
dashContent = dashContent.replace(statesRegex, '');

// 3. Remove loadActivityLog func
const loadFuncRegex = /\s*\/\/ تحميل سجل العمليات \(مع دعم Load More\)[\s\S]*?setActivityLoading\(false\);\n\s*\};\n/;
dashContent = dashContent.replace(loadFuncRegex, '');

// 4. Remove loadActivityLog() from useEffect
dashContent = dashContent.replace(/\s*loadActivityLog\(\);\n/, '\n');

// 5. Remove UI
const uiStartStr = '      {/* ===== قسم سجل آخر العمليات ===== */}';
const uiStartIndex = dashContent.indexOf(uiStartStr);
if (uiStartIndex > -1) {
  // find the end of the Dashboard container
  const endDashStr = '    </Container>\n  );\n};\n\nexport default DashboardWithDatabase;';
  const endDashIndex = dashContent.indexOf(endDashStr);
  
  if (endDashIndex > -1) {
    // The Box containing the Activity Log is the last element before </Container>. We replace everything from uiStartStr to endDashStr with just endDashStr.
    dashContent = dashContent.substring(0, uiStartIndex) + endDashStr;
  }
}

fs.writeFileSync(dashPath, dashContent);
console.log('Removed from Dashboard');
