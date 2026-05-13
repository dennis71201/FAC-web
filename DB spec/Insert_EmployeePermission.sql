-- 插入 EmployeePermission 測試資料
INSERT INTO [dbo].[EmployeePermission] ([EmployeeId], [Role], [Permission])
VALUES 
-- 管理者 (Administrator)
(1, N'Administrator', N'{"Attendance Record": true, "Abnormal Review": true, "Alarm": true}'),
(4, N'Administrator', N'{"Attendance Record": true, "Abnormal Review": true, "Alarm": true}'),
(12, N'Administrator', N'{"Attendance Record": true, "Abnormal Review": true, "Alarm": true}'),

-- 一般使用者 (General User)
(2, N'General User', N'{"Attendance Record": true, "Abnormal Review": false, "Alarm": false}'),
-- 特別測試對象：IsAlive=1 但 Attendance Record=false
(3, N'General User', N'{"Attendance Record": false, "Abnormal Review": false, "Alarm": false}'), 
(5, N'General User', N'{"Attendance Record": true, "Abnormal Review": false, "Alarm": false}'),
(6, N'General User', N'{"Attendance Record": true, "Abnormal Review": false, "Alarm": false}'),
(7, N'General User', N'{"Attendance Record": true, "Abnormal Review": false, "Alarm": false}'),
(8, N'General User', N'{"Attendance Record": true, "Abnormal Review": false, "Alarm": false}'),
(9, N'General User', N'{"Attendance Record": true, "Abnormal Review": false, "Alarm": false}'),
(10, N'General User', N'{"Attendance Record": true, "Abnormal Review": false, "Alarm": false}'), -- IsAlive=0
(11, N'General User', N'{"Attendance Record": true, "Abnormal Review": false, "Alarm": false}'),
(13, N'General User', N'{"Attendance Record": true, "Abnormal Review": false, "Alarm": false}'),
(14, N'General User', N'{"Attendance Record": true, "Abnormal Review": false, "Alarm": false}'), -- IsAlive=0
(15, N'General User', N'{"Attendance Record": true, "Abnormal Review": false, "Alarm": false}');

-- 查詢確認資料
SELECT * FROM [EmployeePermission];