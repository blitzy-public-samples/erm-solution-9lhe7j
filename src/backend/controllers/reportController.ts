import { Request, Response, NextFunction } from 'express';
import { Report } from 'src/backend/models/Report';
import { Risk } from 'src/backend/models/Risk';
import { Assessment } from 'src/backend/models/Assessment';
import { User } from 'src/backend/models/User';
import { ApiResponse, PaginatedResponse, ReportConfig } from 'src/shared/types/index';
import { generatePDF } from 'src/backend/utils/pdfGenerator';
import { generateExcel } from 'src/backend/utils/excelGenerator';

export const reportController = {
  async getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};

      const { rows, count } = await Report.findAndCountAll({
        where: filters,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['createdAt', 'DESC']],
      });

      const response: PaginatedResponse<Report> = {
        data: rows,
        total: count,
        page,
        pageSize,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async getReportById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reportId = req.params.id;
      const report = await Report.findByPk(reportId);

      if (!report) {
        res.status(404).json({ message: 'Report not found' });
        return;
      }

      res.json(report);
    } catch (error) {
      next(error);
    }
  },

  async createReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reportData: ReportConfig = req.body;
      const newReport = await Report.create(reportData);
      res.status(201).json(newReport);
    } catch (error) {
      next(error);
    }
  },

  async updateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reportId = req.params.id;
      const reportData: Partial<ReportConfig> = req.body;

      const report = await Report.findByPk(reportId);

      if (!report) {
        res.status(404).json({ message: 'Report not found' });
        return;
      }

      const updatedReport = await report.update(reportData);
      res.json(updatedReport);
    } catch (error) {
      next(error);
    }
  },

  async deleteReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reportId = req.params.id;
      const report = await Report.findByPk(reportId);

      if (!report) {
        res.status(404).json({ message: 'Report not found' });
        return;
      }

      await report.destroy();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reportId = req.params.id;
      const report = await Report.findByPk(reportId);

      if (!report) {
        res.status(404).json({ message: 'Report not found' });
        return;
      }

      const { type, filters, format } = report;

      // Fetch required data based on report configuration
      const risks = await Risk.findAll({ where: filters });
      const assessments = await Assessment.findAll({ where: { riskId: risks.map(r => r.id) } });

      // Process and aggregate data
      const reportData = processReportData(type, risks, assessments);

      // Generate report in specified format
      let generatedReport;
      if (format === 'PDF') {
        generatedReport = await generatePDF(reportData);
      } else if (format === 'Excel') {
        generatedReport = await generateExcel(reportData);
      } else {
        throw new Error('Unsupported report format');
      }

      // Update report with latest generation timestamp
      await report.update({ lastGeneratedAt: new Date() });

      // Send the generated report
      res.setHeader('Content-Type', format === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="report_${reportId}.${format.toLowerCase()}"`);
      res.send(generatedReport);
    } catch (error) {
      next(error);
    }
  },
};

function processReportData(type: string, risks: Risk[], assessments: Assessment[]): any {
  // Implement data processing logic based on report type
  // This is a placeholder and should be implemented based on specific report requirements
  return {
    risks,
    assessments,
    // Add more processed data as needed
  };
}