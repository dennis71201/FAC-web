-- 插入部門與課別對應資料
INSERT INTO [dbo].[EmployeeSection] ([SectionName], [SystemName])
VALUES 
(N'Process', N'SHIFT'),
(N'Process', N'WTS'),
(N'Process', N'GC'),
(N'Building', N'CR'),
(N'Building', N'EXH'),
(N'Building', N'HVAC'),
(N'Building', N'PROCESS'),
(N'Building', N'EI'),
(N'Building', N'I&C'),
(N'Building', N'LSS'),
(N'Project', N'TI'),
(N'Project', N'PROJECT'),
(N'Project', N'GENERAL AFFAIRS');

-- 查詢確認生成的 ID
SELECT * FROM [EmployeeSection];