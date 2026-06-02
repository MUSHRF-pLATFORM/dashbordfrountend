const fs = require('fs');
const loginPath = '/Users/pro/Desktop/projects/dashbordfrountend/src/pages/LoginActivity.js';
let content = fs.readFileSync(loginPath, 'utf8');

// 1. Fix the table company column
const tableOld = "companiesData.find(c => String(c.id) === String(activity.IDCompany))?.name";
const tableNew = "(() => { const c = companiesData.find(x => String(x.id || x.IDCompany || x.ID) === String(activity.IDCompany)); return c ? (c.name || c.NameCompany || c.companyName || c.Name) : null; })()";
content = content.replace(tableOld, tableNew);

// 2. Fix the activity log chip
const chipOld = "const comp = companiesData.find(c => String(c.id) === String(entry.companyId));\n                                const cName = entry.companyName || (comp ? comp.name : null);";
const chipNew = "const comp = companiesData.find(c => String(c.id || c.IDCompany || c.ID) === String(entry.companyId || entry.IDCompany));\n                                const cName = entry.companyName || (comp ? (comp.name || comp.NameCompany || comp.companyName || comp.Name) : null);";
content = content.replace(chipOld, chipNew);

fs.writeFileSync(loginPath, content);
console.log('Fixed company lookup logic.');
