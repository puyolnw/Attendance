import { ReportService } from '../services/ReportService.js';

export const getClassReport = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    const report = await ReportService.getClassAttendanceReport(
      classId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    if (error.message?.includes('not found')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    next(error);
  }
};

export const getAttendanceMatrix = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const matrix = await ReportService.getAttendanceMatrix(classId);
    res.json({ success: true, data: matrix });
  } catch (error) {
    if (error.message?.includes('not found')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    next(error);
  }
};

export const exportCSV = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    const csv = await ReportService.generateCSV(
      classId,
      startDate,
      endDate
    );

    // Add UTF-8 BOM to ensure Excel reads Thai characters correctly
    const csvWithBOM = '﻿' + csv;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="class-${classId}-report.csv"`);
    res.send(csvWithBOM);
  } catch (error) {
    if (error.message?.includes('not found')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    next(error);
  }
};
