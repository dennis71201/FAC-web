-- ==========================================
-- Passdown Test Data Insert Script
-- Date: 2026-05-11
-- Description: Insert test Passdown records with various types and statuses
-- ==========================================

SET NOCOUNT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    -- Insert Passdown test records
    -- Mix of PassdownType and PassdownStatus for comprehensive testing
    INSERT INTO [dbo].[Passdown]
    (
        [PassdownTime],
        [PassdownType],
        [PassdownStatus],
        [SiteId],
        [PassdownSectionId],
        [PassdownSectionName],
        [PassdownSystemName],
        [PassdownSubSystemName],
        [PassdownDescription],
        [CreateEmployeeId],
        [ReceiveEmployeeId],
        [PassdownAttachments],
        [IsAlive]
    )
    VALUES
    -- Normal / 值班交接 records
    (GETDATE(), N'值班交接', N'正常', 1, 4, N'Building', N'CR', N'CR', N'CR system daily handover - normal operation', 1, 2, NULL, 1),
    (GETDATE(), N'值班交接', N'正常', 1, 14, N'Building', N'HVAC', N'Chiller', N'HVAC chiller unit handover', 3, 4, NULL, 1),
    
    -- Normal / 主辦交接 records
    (GETDATE(), N'主辦交接', N'正常', 2, 42, N'WTS', N'WWT', N'WWR', N'Wastewater recycling system handover', 5, 7, NULL, 1),
    (GETDATE(), N'主辦交接', N'正常', 3, 55, N'GC', N'GAS', N'GD', N'Gas detection system routine handover', 2, 12, NULL, 1),
    
    -- Major Abnormal / 異常(重大) records
    (GETDATE() - 2, N'異常(重大)', N'重大異常', 1, 8, N'Building', N'EXH', N'GEX', N'Critical exhaust system malfunction detected - equipment temperature exceeds threshold by 15 degrees', 1, 2, N'["inspection_report_20260511.pdf"]', 1),
    (GETDATE() - 1, N'異常(重大)', N'處理中', 2, 20, N'Building', N'Mech.', N'AHU', N'Major AHU failure in processing area - immediate action required', 6, 8, NULL, 1),
    
    -- Minor Abnormal / 異常(一般) records
    (GETDATE() - 3, N'異常(一般)', N'一般異常', 1, 35, N'Building', N'I&C', N'LDS', N'Minor sensor reading drift - within acceptable range but requires monitoring', 4, 1, NULL, 1),
    (GETDATE() - 1, N'異常(一般)', N'處理中', 3, 48, N'WTS', N'UPW', N'RO', N'RO membrane pressure slightly elevated - scheduled maintenance recommended', 11, 13, NULL, 1),
    
    -- Closed records / 已結案
    (GETDATE() - 7, N'異常(一般)', N'已結案', 1, 38, N'Building', N'LSS', N'火警系統', N'Fire alarm sensor battery replacement completed', 9, 1, N'["maintenance_log_20260504.pdf","completion_cert_20260504.pdf"]', 1),
    (GETDATE() - 5, N'異常(重大)', N'已結案', 2, 52, N'GC', N'Chemical', N'CDU', N'Chemical dosing unit recalibration completed and verified', 5, 6, NULL, 1),
    
    -- Additional mixed records for comprehensive testing
    (GETDATE() - 4, N'值班交接', N'正常', 4, 64, N'Project', N'Project', N'Project', N'Project site daily status handover', 13, 15, NULL, 1),
    (GETDATE() - 2, N'主辦交接', N'正常', 1, 38, N'Building', N'LSS', N'VESDA', N'VESDA air sampling system routine check', 12, 3, NULL, 1),
    (GETDATE() - 6, N'異常(重大)', N'已結案', 3, 28, N'Building', N'Elec.', N'UPS', N'UPS battery failure - replacement and testing completed', 4, 11, N'["battery_replacement_order.pdf"]', 1),
    (GETDATE() - 1, N'異常(一般)', N'處理中', 1, 27, N'Building', N'Elec.', N'高/中/低壓盤', N'Electrical panel temperature reading elevated - cooling inspection in progress', 2, 9, NULL, 1);

    -- Validation output
    SELECT COUNT(*) AS [PassdownCount] FROM [dbo].[Passdown];
    SELECT 
        [PassdownId],
        [PassdownTime],
        [PassdownType],
        [PassdownStatus],
        [SiteId],
        [PassdownSectionName],
        [PassdownSystemName],
        [PassdownSubSystemName],
        [CreateEmployeeId],
        [ReceiveEmployeeId]
    FROM [dbo].[Passdown]
    ORDER BY [PassdownTime] DESC;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
