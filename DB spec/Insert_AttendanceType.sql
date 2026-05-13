-- 插入 AttendanceType 測試資料
INSERT INTO [dbo].[AttendanceType] ([AttendanceTypeName], [AttendanceTypeColor])
VALUES 
(N'出差', '#22c55e'),
(N'請假', '#f97316'),
(N'公假', '#3b82f6'),
(N'Training', '#a855f7'),
(N'FWA', '#06b6d4');

-- 查詢確認資料
SELECT * FROM [AttendanceType];