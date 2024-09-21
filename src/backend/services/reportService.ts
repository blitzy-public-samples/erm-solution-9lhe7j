import { Report } from 'src/backend/models/Report';
import { Risk } from 'src/backend/models/Risk';
import { Assessment } from 'src/backend/models/Assessment';
import { User } from 'src/backend/models/User';
import { ApiError } from 'src/backend/utils/ApiError';
import { PaginatedResponse, ReportConfig } from 'src/shared/types/index';
import { generatePDF } from 'src/backend/utils/pdfGenerator';
import { generateExcel } from 'src/backend/utils/excelGenerator';

export const reportService = {
  async getReports(page: number, pageSize: number, filters: object): Promise<PaginatedResponse<Report>> {
    try {
      const offset = (page - 1) * pageSize;
      const where = { ...filters };

      const [reports, totalCount] = await Promise.all([
        Report.findAll({ where, limit: pageSize, offset }),
        Report.count({ where }),
      ]);

      return {
        items: reports,
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    } catch (error) {
      throw new ApiError(500, 'Error retrieving reports');
    }
  },

  async getReportById(id: number): Promise<Report> {
    const report = await Report.findByPk(id);
    if (!report) {
      throw new ApiError(404, 'Report not found');
    }
    return report;
  },

  async createReport(reportData: Partial<Report>): Promise<Report> {
    try {
      const user = await User.findByPk(reportData.userId);
      if (!user) {
        throw new ApiError(400, 'Invalid user');
      }

      const newReport = await Report.create(reportData);
      return newReport;
    } catch (error) {
      throw new ApiError(500, 'Error creating report');
    }
  },

  async updateReport(id: number, reportData: Partial<Report>): Promise<Report> {
    const report = await Report.findByPk(id);
    if (!report) {
      throw new ApiError(404, 'Report not found');
    }

    try {
      await report.update(reportData);
      return report;
    } catch (error) {
      throw new ApiError(500, 'Error updating report');
    }
  },

  async deleteReport(id: number): Promise<void> {
    const report = await Report.findByPk(id);
    if (!report) {
      throw new ApiError(404, 'Report not found');
    }

    try {
      await report.destroy();
    } catch (error) {
      throw new ApiError(500, 'Error deleting report');
    }
  },

  async generateReport(reportId: number): Promise<string> {
    const report = await Report.findByPk(reportId);
    if (!report) {
      throw new ApiError(404, 'Report not found');
    }

    try {
      const reportConfig: ReportConfig = JSON.parse(report.config);
      const risks = await Risk.findAll({ where: reportConfig.filters });
      const assessments = await Assessment.findAll({ where: { riskId: risks.map(r => r.id) } });

      const processedData = this.processReportData(risks, assessments, reportConfig);

      let reportPath: string;
      if (reportConfig.format === 'PDF') {
        reportPath = await generatePDF(processedData, reportConfig);
      } else if (reportConfig.format === 'Excel') {
        reportPath = await generateExcel(processedData, reportConfig);
      } else {
        throw new ApiError(400, 'Unsupported report format');
      }

      await report.update({ lastGeneratedAt: new Date() });

      return reportPath;
    } catch (error) {
      throw new ApiError(500, 'Error generating report');
    }
  },

  processReportData(risks: Risk[], assessments: Assessment[], config: ReportConfig): any {
    // Implement data processing and aggregation logic here
    // This is a placeholder and should be replaced with actual implementation
    return { risks, assessments, config };
  },
};