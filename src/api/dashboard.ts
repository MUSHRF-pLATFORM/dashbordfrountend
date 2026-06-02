/**
 * Dashboard API - تفعيل طلبات لوحة التحكم المغلقة
 * 
 * 📊 APIs المفعلة حديثاً:
 * - GET /api/dashboard/stats - إحصائيات الداشبورد العامة
 * - GET /api/dashboard/reports - تقارير الداشبورد المتقدمة
 */

import { apiClient } from "./config";

// أنواع البيانات للإحصائيات
export interface DashboardStats {
  overview: {
    totalCompanies: number;
    totalSubs: number;
    totalProjects: number;
    activeProjects: number;
  };
  recentCompanies: Array<{
    id: number;
    name: string;
    subscriptionStart: string;
  }>;
  recentProjects: Array<{
    id: number;
    name: string;
    status: string;
    progress: number;
    companyName: string;
    subName: string;
  }>;
}

// أنواع البيانات للتقارير
export interface DashboardReports {
  companies: Array<{
    id: number;
    NameCompany: string;
    totalSubs: number;
    totalProjects: number;
    status: string;
    Cost: number;
    SubscriptionEndDate: string;
  }>;
  projects: Array<{
    id: number;
    Nameproject: string;
    progress: number;
    NameCompany: string;
    NameSub: string;
    status: string;
    cost: number;
    ProjectStartdate: string;
  }>;
  monthlyStats: Array<{
    month: string;
    companies: number;
    subs: number;
    projects: number;
    totalRevenue: number;
  }>;
  companiesByCity: Array<{
    City: string;
    count: number;
  }>;
}

/**
 * جلب إحصائيات الداشبورد العامة
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  console.log('🔍 جاري جلب إحصائيات الداشبورد...');

  try {
    const response = await apiClient.get<{
      success: boolean;
      data: DashboardStats;
      message?: string;
    }>('/dashboard/stats');

    console.log('📊 استجابة إحصائيات الداشبورد:', response.data);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'فشل في جلب إحصائيات الداشبورد');
    }
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات الداشبورد:', error);
    throw error;
  }
};

/**
 * جلب تقارير الداشبورد المتقدمة
 */
export const fetchDashboardReports = async (): Promise<DashboardReports> => {
  console.log('🔍 جاري جلب تقارير الداشبورد...');

  try {
    const response = await apiClient.get<{
      success: boolean;
      data: DashboardReports;
      message?: string;
    }>('/dashboard/reports');

    console.log('📊 استجابة تقارير الداشبورد:', response.data);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'فشل في جلب تقارير الداشبورد');
    }
  } catch (error) {
    console.error('❌ خطأ في جلب تقارير الداشبورد:', error);
    throw error;
  }
};

/**
 * دالة مساعدة لتنسيق الحالة
 */
export const formatProjectStatus = (status: string): { text: string; color: string } => {
  switch (status) {
    case 'جاري_العمل':
      return { text: 'جاري العمل', color: 'success' };
    case 'متوقف':
      return { text: 'متوقف', color: 'error' };
    case 'مكتمل':
      return { text: 'مكتمل', color: 'info' };
    default:
      return { text: status, color: 'default' };
  }
};

/**
 * دالة مساعدة لتنسيق التقدم
 */
export const formatProgress = (progress: number): string => {
  if (progress === null || progress === undefined) return '0.00%';
  return `${progress.toFixed(2)}%`;
};

/**
 * دالة مساعدة لتنسيق العملة في الداشبورد
 */
export const formatDashboardCurrency = (amount: number): string => {
  if (!amount || amount === 0) return '0.00 ريال';
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * دالة مساعدة لتنسيق التاريخ في الداشبورد
 */
export const formatDashboardDate = (dateString: string): string => {
  if (!dateString) return 'غير محدد';
  try {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'تاريخ غير صحيح';
  }
};

/**
 * دالة مساعدة لحساب النسبة المئوية
 */
export const calculatePercentage = (value: number, total: number): string => {
  if (total === 0) return '0.00%';
  return `${((value / total) * 100).toFixed(2)}%`;
};

// ===== سجل العمليات =====

/** سجل عملية واحدة من جدول Flowmove */
export interface ActivityLogEntry {
  id: number;
  type: string;       // movement_type من الـ backend (الحقل الأصلي)
  title?: string;     // عنوان وصفي مُولَّد في الفرونت
  description?: string;
  userId?: number;
  companyId?: number;
  companyName?: string;
  userName?: string;
  PhoneNumber?: string;
  createdAt: string;
  details?: string;
}

export interface ActivityLogPagination {
  pageSize: number;
  nextCursor: number | null;
  hasMore: boolean;
}

export interface ActivityLogResponse {
  success: boolean;
  data: ActivityLogEntry[];
  pagination: ActivityLogPagination;
}

/**
 * جلب سجل آخر العمليات بنظام المؤشر
 * GET /api/dashboard/activity-log
 * @param afterId - مؤشر الـ ID للبدء من بعده (للتحميل التدريجي)
 */
export const fetchActivityLog = async (afterId?: number): Promise<ActivityLogResponse> => {
  try {
    const params: Record<string, any> = {};
    if (afterId !== undefined && afterId > 0) {
      params.afterId = afterId;
    }

    const response = await apiClient.get('/dashboard/activity-log', { params });
    const resData = response.data;

    if (resData?.success === true || resData?.success === 'true') {
      // تحويل movement_type إلى عنوان وصفي
      const enrichedData = (resData.data || []).map((entry: any) => {
        const actualType = entry.type || entry.movement_type || entry.Movementtype || entry.MovementType || entry.title || 'UNKNOWN';
        const formattedType = formatActivityType(actualType);
        
        let processedDescription = entry.description || `قام ${entry.userName || 'مستخدم'} بـ ${formattedType}`;
        
        // التقاط المفتاح الإنجليزي من الوصف إذا كان الباك إند يرسله داخل النص
        if (processedDescription.includes('إجراء حركة:')) {
          const parts = processedDescription.split('إجراء حركة:');
          if (parts.length > 1) {
            const englishKey = parts[1].trim();
            // استخدام دالة الترجمة الذكية لترجمة المفتاح المخبأ
            const translatedKey = formatActivityType(englishKey);
            processedDescription = `${parts[0]}إجراء حركة: ${translatedKey}`;
          }
        }

        return {
          ...entry,
          type: actualType === 'OPERATION' ? 'عملية بالنظام' : actualType, // تعريب كلمة OPERATION
          title: entry.title === 'OPERATION' ? 'عملية بالنظام' : (entry.title || formattedType),
          description: processedDescription,
          createdAt: entry.createdAt || entry.Time || '',
          userId: entry.userId || entry.id,
          companyId: entry.companyId || entry.IDCompany,
          companyName: entry.companyName || entry.company_name || entry.CompanyName || entry.NameCompany || undefined,
          details: entry.Note || entry.note || entry.description || entry.details || undefined,
        };
      });

      return {
        success: true,
        data: enrichedData,
        pagination: resData.pagination || {
          pageSize: enrichedData.length,
          nextCursor: null,
          hasMore: false,
        },
      };
    }

    return {
      success: true,
      data: [],
      pagination: { pageSize: 0, nextCursor: null, hasMore: false },
    };
  } catch (error) {
    console.error('❌ خطأ في جلب سجل العمليات:', error);
    return {
      success: false,
      data: [],
      pagination: { pageSize: 0, nextCursor: null, hasMore: false },
    };
  }
};

/**
 * تحويل نوع العملية إلى نص عربي وصفي
 */
export const formatActivityType = (type: string): string => {
  if (!type) return 'عملية غير محددة';

  const typeMap: Record<string, string> = {
    // ===== عمليات المشاريع =====
    'update_project': 'تعديل مشروع',
    'create_project': 'إنشاء مشروع',
    'delete_project': 'حذف مشروع',
    'updatadataproject': 'تعديل بيانات مشروع',
    'updatestartdate': 'تعديل تاريخ بداية المشروع',
    'rearrangestage': 'إعادة ترتيب المراحل',
    'updatenotesstage': 'تعديل ملاحظات المرحلة',
    'updatedatastage': 'تعديل بيانات المرحلة',
    'updatedatastagesub': 'تعديل بيانات المرحلة الفرعية',
    'updatenamefolderorfileinarchive': 'تعديل اسم ملف/مجلد في الأرشيف',
    'expenseupdate': 'تعديل مصروف',
    'revenuesupdate': 'تعديل إيراد',
    'returnsupdate': 'تعديل مرتجع',
    'updatedatarequests': 'تعديل بيانات طلب',
    'updateimplementrquestsorcansle': 'تحديث أو إلغاء طلب تنفيذ',
    'updateimplementrequestsorcansle': 'تحديث أو إلغاء طلب تنفيذ',
    'confirmarrivdrequest': 'تأكيد وصول طلب',
    'createimplementrquests': 'إنشاء طلب تنفيذ',
    'createimplementrequests': 'إنشاء طلب تنفيذ',
    'deleteimplementrquests': 'حذف طلب تنفيذ',
    'deleteimplementrequests': 'حذف طلب تنفيذ',
    'implementedbyopreation': 'تنفيذ عملية',
    'implementedbyoperation': 'تنفيذ عملية',

    // ===== عمليات الشركات =====
    'update_company': 'تعديل شركة',
    'create_company': 'إنشاء شركة',
    'delete_company': 'حذف شركة',
    'updatedatacompany': 'تعديل بيانات الشركة',
    'updateapicompany': 'تعديل مفتاح API للشركة',
    'updatecompanydaschbord': 'تعديل بيانات الشركة (لوحة التحكم)',
    'agreedregistrationcompany': 'قبول تسجيل شركة جديدة',
    'deletecompanyregistration': 'حذف طلب تسجيل شركة',
    'updatedataregistration': 'تعديل بيانات تسجيل شركة',

    // ===== عمليات الفروع =====
    'update_branch': 'تعديل فرع',
    'create_branch': 'إنشاء فرع',
    'delete_branch': 'حذف فرع',
    'updatecompanybrinsh': 'تعديل بيانات فرع',
    'updatecompanysubdaschbord': 'تعديل فرع (لوحة التحكم)',
    'deletecompanysubdaschbord': 'حذف فرع (لوحة التحكم)',
    'branchdeletionprocedures': 'إجراءات حذف فرع',
    'acceptandrejectrequests': 'قبول أو رفض طلبات الفرع',
    'updatecovenantrequests': 'تعديل طلبات العهدة',
    'deletecovenantrequests': 'حذف طلبات العهدة',

    // ===== عمليات المستخدمين =====
    'update_user': 'تعديل مستخدم',
    'create_user': 'إضافة مستخدم',
    'delete_user': 'حذف مستخدم',
    'deletuser': 'حذف مستخدم',
    'usercompanyupdat': 'تعديل بيانات مستخدم',
    'usercompanyupdatdashbord': 'تعديل بيانات مستخدم (لوحة التحكم)',
    'updatusercompanyinbrinsh': 'تعديل صلاحيات مستخدم في فرع',
    'updatusercompanyinbrinshv2': 'تعديل صلاحيات مستخدم في فرع (محسّن)',
    'insertmultipleprojecsinvalidity': 'تعديل صلاحيات مشاريع متعددة لمستخدم',

    // ===== عمليات القوالب =====
    'deletstagehometemplet': 'حذف مرحلة رئيسية من القالب',
    'deletstagesubtemplet': 'حذف مرحلة فرعية من القالب',

    // ===== عمليات تسجيل الدخول =====
    'login': 'تسجيل دخول',
    'logout': 'تسجيل خروج',
  };

  const normalizedType = type.trim().toLowerCase();
  
  if (typeMap[normalizedType]) return typeMap[normalizedType];

  // محاولة تحسين قراءة الأسماء غير المعروفة برمجياً وترجمتها
  let fallback = type;
  
  // تحويل الصيغة مثل Implementedbyopreation إلى كلمات منفصلة
  fallback = fallback.replace(/_/g, ' ');
  fallback = fallback.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // قاموس مصغر للكلمات الشائعة في الباك إند
  const fallbackDict: Record<string, string> = {
    'update': 'تعديل',
    'updat': 'تعديل',
    'delete': 'حذف',
    'delet': 'حذف',
    'create': 'إنشاء',
    'add': 'إضافة',
    'insert': 'إضافة',
    'project': 'مشروع',
    'projects': 'مشاريع',
    'company': 'شركة',
    'companies': 'شركات',
    'user': 'مستخدم',
    'users': 'مستخدمين',
    'branch': 'فرع',
    'brinsh': 'فرع',
    'sub': 'فرع',
    'stage': 'مرحلة',
    'request': 'طلب',
    'requests': 'طلبات',
    'rquests': 'طلبات',
    'expense': 'مصروف',
    'revenue': 'إيراد',
    'return': 'مرتجع',
    'data': 'بيانات',
    'password': 'كلمة المرور',
    'login': 'تسجيل دخول',
    'logout': 'تسجيل خروج',
    'in': 'في',
    'from': 'من',
    'to': 'إلى',
    'file': 'ملف',
    'files': 'ملفات',
    'folder': 'مجلد',
    'folders': 'مجلدات',
    'archive': 'أرشيف',
    'notes': 'ملاحظات',
    'startdate': 'تاريخ البداية',
    'new': 'جديد',
    'operation': 'عملية بالنظام',
  };

  // تبديل كل كلمة بما يقابلها
  const words = fallback.split(' ');
  const translatedWords = words.map(word => {
    const lowerWord = word.toLowerCase();
    return fallbackDict[lowerWord] || word; // إذا لم تكن في القاموس، اتركها كما هي
  });

  const finalTranslation = translatedWords.join(' ').trim();
  
  // إذا لم يجد أي ترجمة وكان النص لا يزال إنجليزي بشكل كامل
  if (finalTranslation.match(/^[a-zA-Z\s]+$/)) {
    return finalTranslation || 'عملية غير محددة';
  }

  return finalTranslation;
};

const dashboardApi = {
  fetchDashboardStats,
  fetchDashboardReports,
  fetchActivityLog,
  formatProjectStatus,
  formatProgress,
  formatDashboardCurrency,
  formatDashboardDate,
  formatActivityType,
  calculatePercentage
};

export default dashboardApi;