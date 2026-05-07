-- ==========================================
-- Employee Data Update Script
-- Date: 2026-05-06
-- Description: Update EmployeeSection and Employee records
-- ==========================================

-- ==========================================
-- Step 1: Update EmployeeSection (部門與課別對應資料)
-- ==========================================
-- Required ID mapping (existing DB):
-- Building / LSS = 12
-- Project / TI = 13
-- Project / PROJECT = 14
-- Project / GENERAL AFFAIRS = 15
-- Update or Insert EmployeeSection using MERGE
MERGE INTO [dbo].[EmployeeSection] AS target
USING (
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
    (N'Project', N'GENERAL AFFAIRS')
) AS source ([SectionName], [SystemName])
ON target.[SectionName] = source.[SectionName] AND target.[SystemName] = source.[SystemName]
WHEN NOT MATCHED THEN
    INSERT ([SectionName], [SystemName])
    VALUES (source.[SectionName], source.[SystemName]);

-- 查詢確認更新結果
SELECT * FROM [EmployeeSection];

-- ==========================================
-- Step 2: Update Employee (員工測試資料)
-- ==========================================
-- Update existing employees by EmployeeNumber, or insert if not exists
MERGE INTO [dbo].[Employee] AS target
USING (
    VALUES 
    (N'王小明', N'FAC-001', N'FAC-001@company.com', N'Building', N'EI', 8, '2024-06-01', 1),
    (N'李大華', N'FAC-002', N'FAC-002@company.com', N'Process', N'WTS', 2, '2024-06-01', 1),
    (N'陳志偉', N'FAC-003', N'FAC-003@company.com', N'Building', N'HVAC', 6, '2024-06-15', 1),
    (N'林美玲', N'FAC-004', N'FAC-004@company.com', N'Building', N'EI', 8, '2024-07-01', 1),
    (N'張建國', N'FAC-005', N'FAC-005@company.com', N'Process', N'GC', 3, '2024-07-10', 1),
    (N'黃俊傑', N'FAC-006', N'FAC-006@company.com', N'Project', N'PROJECT', 14, '2024-08-01', 1),
    (N'吳淑芬', N'FAC-007', N'FAC-007@company.com', N'Process', N'WTS', 2, '2024-08-15', 1),
    (N'趙文龍', N'FAC-008', N'FAC-008@company.com', N'Building', N'EXH', 5, '2024-09-01', 1),
    (N'周雅琪', N'FAC-009', N'FAC-009@company.com', N'Building', N'I&C', 9, '2024-09-10', 1),
    (N'鄭國輝', N'FAC-010', N'FAC-010@company.com', N'Process', N'GC', 3, '2024-06-01', 0),
    (N'許家豪', N'FAC-011', N'FAC-011@company.com', N'Process', N'SHIFT', 1, '2024-10-01', 1),
    (N'蔡怡君', N'FAC-012', N'FAC-012@company.com', N'Process', N'WTS', 2, '2024-10-15', 1),
    (N'楊世昌', N'FAC-013', N'FAC-013@company.com', N'Building', N'HVAC', 6, '2024-11-01', 1),
    (N'劉佩琪', N'FAC-014', N'FAC-014@company.com', N'Building', N'EI', 8, '2024-07-01', 0),
    (N'洪振宇', N'FAC-015', N'FAC-015@company.com', N'Project', N'TI', 13, '2024-12-01', 1)
) AS source 
    ([EmployeeName], [EmployeeNumber], [EmployeeEmail], [EmployeeSection], [EmployeeSystem], [EmployeeSectionId], [CreateTime], [IsAlive])
ON target.[EmployeeNumber] = source.[EmployeeNumber]
WHEN MATCHED THEN
    UPDATE SET
        [EmployeeName] = source.[EmployeeName],
        [EmployeeEmail] = source.[EmployeeEmail],
        [EmployeeSection] = source.[EmployeeSection],
        [EmployeeSystem] = source.[EmployeeSystem],
        [EmployeeSectionId] = source.[EmployeeSectionId],
        [IsAlive] = source.[IsAlive]
WHEN NOT MATCHED THEN
    INSERT ([EmployeeName], [EmployeeNumber], [EmployeeEmail], [EmployeeSection], [EmployeeSystem], [EmployeeSectionId], [CreateTime], [IsAlive])
    VALUES (source.[EmployeeName], source.[EmployeeNumber], source.[EmployeeEmail], source.[EmployeeSection], source.[EmployeeSystem], source.[EmployeeSectionId], source.[CreateTime], source.[IsAlive]);

-- 查詢確認資料
SELECT * FROM [Employee];

-- ==========================================
-- Step 3: Data Validation Summary
-- ==========================================
-- Count records by section
SELECT [SectionName], COUNT(*) AS [Count] 
FROM [Employee] e 
JOIN [EmployeeSection] es ON e.[EmployeeSectionId] = es.[EmployeeSectionId]
GROUP BY [SectionName];

-- Count active vs inactive employees
SELECT [IsAlive], COUNT(*) AS [Count] 
FROM [Employee] 
GROUP BY [IsAlive];

-- Validate required EmployeeSectionId mapping
SELECT [EmployeeSectionId], [SectionName], [SystemName]
FROM [EmployeeSection]
WHERE ([SectionName] = N'Building' AND [SystemName] = N'LSS' AND [EmployeeSectionId] = 12)
    OR ([SectionName] = N'Project' AND [SystemName] = N'TI' AND [EmployeeSectionId] = 13)
    OR ([SectionName] = N'Project' AND [SystemName] = N'PROJECT' AND [EmployeeSectionId] = 14)
    OR ([SectionName] = N'Project' AND [SystemName] = N'GENERAL AFFAIRS' AND [EmployeeSectionId] = 15);
