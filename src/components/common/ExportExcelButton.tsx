import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { generateAdvancedReportData, exportToExcel } from '../../utils/advancedReport';

interface ExportExcelButtonProps {
  label?: string;
  fileName?: string;
}

export const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({
  label = 'تصدير التقرير الشامل',
  fileName = 'تقرير_الشركات_الشامل',
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    try {
      const data = await generateAdvancedReportData(console.log);

      exportToExcel(data, fileName);
    } catch (error: any) {
      console.error('فشل تصدير التقرير:', error);
      alert(`خطأ أثناء تصدير التقرير: ${error.message || 'خطأ غير معروف'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip
      title="استخراج تقرير شامل يحتوي على إحصائيات جميع الشركات (فروع، موظفين، مشاريع)"
      placement="top"
    >
      <Button
        variant="contained"
        color="success"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AssessmentIcon />}
        onClick={handleExport}
        disabled={loading}
        sx={{
          borderRadius: '10px',
          padding: '9px 20px',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          boxShadow: '0 4px 12px rgba(46,125,50,0.3)',
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(46,125,50,0.4)',
          },
        }}
      >
        {loading ? 'جاري التصدير...' : label}
      </Button>
    </Tooltip>
  );
};
