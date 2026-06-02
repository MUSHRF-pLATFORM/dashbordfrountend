const fs = require('fs');

const loginPath = '/Users/pro/Desktop/projects/dashbordfrountend/src/pages/LoginActivity.js';
let content = fs.readFileSync(loginPath, 'utf8');

// 1. Add imports
content = content.replace(
  "import { useTheme } from '@mui/material/styles';",
  "import { useTheme } from '@mui/material/styles';\nimport { fetchActivityLog } from '../api/dashboard';\nimport { History as HistoryIcon, Refresh as RefreshIcon, ExpandMore as ExpandMoreIcon, Assignment as AssignmentIcon, Build as BuildIcon, AccountTree as AccountTreeIcon } from '@mui/icons-material';\nimport { List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';"
);

// 2. Add State inside component
const stateInjectionStr = `
  // سجل العمليات
  const [activityLog, setActivityLog] = useState([]);
  const [activityNextCursor, setActivityNextCursor] = useState(null);
  const [activityHasMore, setActivityHasMore] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityLoadError, setActivityLoadError] = useState(null);

  // تحميل سجل العمليات (مع دعم Load More)
  const loadActivityLog = async (cursor) => {
    setActivityLoading(true);
    setActivityLoadError(null);
    try {
      const result = await fetchActivityLog(cursor);
      if (result.success) {
        setActivityLog(prev => cursor ? [...prev, ...result.data] : result.data);
        setActivityNextCursor(result.pagination.nextCursor);
        setActivityHasMore(result.pagination.hasMore);
      } else {
        setActivityLoadError('تعذر تحميل سجل العمليات');
      }
    } catch (e) {
      setActivityLoadError('خطأ في الاتصال بسجل العمليات');
    } finally {
      setActivityLoading(false);
    }
  };
`;

content = content.replace(
  "const [error, setError] = useState(null);",
  "const [error, setError] = useState(null);" + stateInjectionStr
);

// 3. Update useEffect to fetch activity log on mount
content = content.replace(
  "fetchStats();",
  "fetchStats();\n    loadActivityLog();"
);

// 4. Add Tab
const newTab = `          <Tab
            icon={<HistoryIcon />}
            label="سجل النظام"
            sx={{ minHeight: 60 }}
          />
`;
content = content.replace(
  "          </Tabs>",
  newTab + "          </Tabs>"
);

// 5. Add UI TabPanel
const activityLogUI = `
      {/* Activity Log Tab */}
      {activeTab === 2 && (
        <Box sx={{ mt: 4, mb: 2 }}>
          <Card
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1e1e1e 0%, #2c2c2c 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              animation: 'slideInUp 0.8s ease-out 0.2s both',
            }}
          >
            {/* شريط العنوان المُتدرج */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)',
                color: 'white',
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <HistoryIcon sx={{ fontSize: 26 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  سجل آخر العمليات
                </Typography>
              </Box>
              <Tooltip title="تحديث السجل">
                <IconButton
                  size="small"
                  onClick={() => loadActivityLog()}
                  disabled={activityLoading}
                  sx={{ color: 'white' }}
                >
                  <RefreshIcon
                    sx={{ animation: activityLoading ? 'spin 1s linear infinite' : 'none' }}
                  />
                </IconButton>
              </Tooltip>
            </Box>

            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              {activityLoadError && (
                <Alert
                  severity="warning"
                  sx={{ mb: 2, borderRadius: 2 }}
                  action={
                    <Button color="inherit" size="small" onClick={() => loadActivityLog()}>
                      إعادة المحاولة
                    </Button>
                  }
                >
                  {activityLoadError}
                </Alert>
              )}

              {activityLoading && activityLog.length === 0 ? (
                // Skeleton loading
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: theme.palette.action.hover,
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    >
                      <Box sx={{
                        width: 40, height: 40, borderRadius: '50%',
                        bgcolor: theme.palette.divider,
                        flexShrink: 0
                      }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ height: 14, bgcolor: theme.palette.divider, borderRadius: 1, mb: 0.7, width: '60%' }} />
                        <Box sx={{ height: 12, bgcolor: theme.palette.divider, borderRadius: 1, width: '40%' }} />
                      </Box>
                      <Box sx={{ height: 12, bgcolor: theme.palette.divider, borderRadius: 1, width: 70 }} />
                    </Box>
                  ))}
                </Box>
              ) : activityLog.length === 0 && !activityLoadError ? (
                <Box sx={{
                  py: 6,
                  textAlign: 'center',
                  color: theme.palette.text.secondary
                }}>
                  <HistoryIcon sx={{ fontSize: 56, mb: 1, opacity: 0.3 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    لا توجد عمليات مسجلة بعد
                  </Typography>
                  <Typography variant="caption">
                    ستظهر هنا جميع العمليات عند توفر الـ API
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {activityLog.map((entry, index) => (
                    <React.Fragment key={entry.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          px: 1.5,
                          py: 1,
                          transition: 'background 0.2s ease',
                          '&:hover': { bgcolor: theme.palette.action.hover },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              width: 38,
                              height: 38,
                              fontSize: '0.85rem',
                              background:
                                entry.type?.includes('PROJECT') ? 'linear-gradient(135deg, #2196f3, #1565c0)' :
                                entry.type?.includes('COMPANY') ? 'linear-gradient(135deg, #9c27b0, #6a1b9a)' :
                                entry.type?.includes('USER') ? 'linear-gradient(135deg, #4caf50, #2e7d32)' :
                                entry.type?.includes('BRANCH') ? 'linear-gradient(135deg, #ff9800, #e65100)' :
                                'linear-gradient(135deg, #607d8b, #37474f)',
                              color: 'white',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                          >
                            {entry.type?.includes('PROJECT') ? <AssignmentIcon sx={{ fontSize: 18 }} /> :
                             entry.type?.includes('COMPANY') ? <BusinessIcon sx={{ fontSize: 18 }} /> :
                             entry.type?.includes('USER') ? <PersonIcon sx={{ fontSize: 18 }} /> :
                             entry.type?.includes('BRANCH') ? <AccountTreeIcon sx={{ fontSize: 18 }} /> :
                             <BuildIcon sx={{ fontSize: 18 }} />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                                {entry.title || entry.type}
                              </Typography>
                              {(() => {
                                const cName = entry.companyName;
                                if (!entry.companyId && !cName) return null;
                                return (
                                  <Chip
                                    label={cName ? \`شركة: \${cName}\` : \`شركة #\${entry.companyId}\`}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.7rem',
                                      bgcolor: theme.palette.primary.main + '20',
                                      color: theme.palette.primary.main,
                                      fontWeight: 600,
                                    }}
                                  />
                                );
                              })()}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {entry.userName && (
                                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                    <PersonIcon sx={{ fontSize: 12 }} />
                                    {entry.userName}
                                  </Typography>
                                )}
                                {entry.createdAt && (
                                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.3, color: theme.palette.text.disabled }}>
                                    <ScheduleIcon sx={{ fontSize: 12 }} />
                                    {new Date(entry.createdAt).toLocaleString('ar-SA', {
                                      month: 'short', day: 'numeric',
                                      hour: '2-digit', minute: '2-digit'
                                    })}
                                  </Typography>
                                )}
                              </Box>
                              {(entry.details || entry.description) && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem', lineHeight: 1.4 }}>
                                  {entry.details || entry.description}
                                </Typography>
                              )}
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItem>
                      {index < activityLog.length - 1 && (
                        <Divider sx={{ opacity: 0.2, mx: 2 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              )}

              {/* زر تحميل المزيد */}
              {activityHasMore && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={activityLoading}
                    onClick={() => loadActivityLog(activityNextCursor || undefined)}
                    startIcon={
                      activityLoading
                        ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} />
                        : <ExpandMoreIcon />
                    }
                    sx={{
                      borderRadius: 3,
                      fontWeight: 600,
                      px: 3,
                      borderColor: theme.palette.primary.main + '60',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: theme.palette.primary.main + '10',
                      }
                    }}
                  >
                    {activityLoading ? 'جاري التحميل...' : 'تحميل المزيد'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
`;

content = content.replace(
  "      {/* Details Dialog */}",
  activityLogUI + "\n      {/* Details Dialog */}"
);

fs.writeFileSync(loginPath, content);
console.log('Injected Activity Log into LoginActivity.js');
