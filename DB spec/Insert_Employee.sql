-- 插入 Employee 測試資料
INSERT INTO [dbo].[Employee] 
(
    [EmployeeName],
    [EmployeeNumber],
    [EmployeeEmail],
    [EmployeeSection],
    [EmployeeSystem],
    [EmployeeSectionId],
    [CreateTime],
    [IsAlive]
)
VALUES 
(N'王小明', N'FAC-001', N'FAC-001@company.com', N'Building', N'EI', 8, '2024-06-01', 1),
(N'李大華', N'FAC-002', N'FAC-002@company.com', N'Process', N'WTS', 2, '2024-06-01', 1),
(N'陳志偉', N'FAC-003', N'FAC-003@company.com', N'Building', N'HVAC', 6, '2024-06-15', 1),
(N'林美玲', N'FAC-004', N'FAC-004@company.com', N'Building', N'EI', 8, '2024-07-01', 1),
(N'張建國', N'FAC-005', N'FAC-005@company.com', N'Process', N'GC', 3, '2024-07-10', 1),
(N'黃俊傑', N'FAC-006', N'FAC-006@company.com', N'Project', N'PROJECT', 12, '2024-08-01', 1),
(N'吳淑芬', N'FAC-007', N'FAC-007@company.com', N'Process', N'WTS', 2, '2024-08-15', 1),
(N'趙文龍', N'FAC-008', N'FAC-008@company.com', N'Building', N'EXH', 5, '2024-09-01', 1),
(N'周雅琪', N'FAC-009', N'FAC-009@company.com', N'Building', N'I&C', 9, '2024-09-10', 1),
(N'鄭國輝', N'FAC-010', N'FAC-010@company.com', N'Process', N'GC', 3, '2024-06-01', 0),
(N'許家豪', N'FAC-011', N'FAC-011@company.com', N'Process', N'SHIFT', 1, '2024-10-01', 1),
(N'蔡怡君', N'FAC-012', N'FAC-012@company.com', N'Process', N'WTS', 2, '2024-10-15', 1),
(N'楊世昌', N'FAC-013', N'FAC-013@company.com', N'Building', N'HVAC', 6, '2024-11-01', 1),
(N'劉佩琪', N'FAC-014', N'FAC-014@company.com', N'Building', N'EI', 8, '2024-07-01', 0),
(N'洪振宇', N'FAC-015', N'FAC-015@company.com', N'Project', N'TI', 11, '2024-12-01', 1);



-- 查詢確認資料
SELECT * FROM [Employee];