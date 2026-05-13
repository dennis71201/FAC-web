-- ==========================================
-- PassdownSection Data Insert Script
-- Date: 2026-05-11
-- Description: Insert hierarchical section/system/subsystem mapping for Passdown feature
-- ==========================================

SET NOCOUNT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    -- Section: Building
    INSERT INTO [dbo].[PassdownSection] ([PassdownSectionName], [PassdownSystemName], [PassdownSubSystemName])
    VALUES
    (N'Building', N'CR', N'CR'),
    (N'Building', N'CR', N'MAU'),
    (N'Building', N'CR', N'Air shower'),
    (N'Building', N'CR', N'DCC'),
    (N'Building', N'CR', N'RCU'),
    (N'Building', N'CR', N'N/A'),
    (N'Building', N'EXH', N'GEX'),
    (N'Building', N'EXH', N'AEX'),
    (N'Building', N'EXH', N'AMX'),
    (N'Building', N'EXH', N'SOX'),
    (N'Building', N'EXH', N'EF'),
    (N'Building', N'EXH', N'NG'),
    (N'Building', N'EXH', N'N/A'),
    (N'Building', N'HVAC', N'CT'),
    (N'Building', N'HVAC', N'Chiller'),
    (N'Building', N'HVAC', N'Glycol'),
    (N'Building', N'HVAC', N'Boiler'),
    (N'Building', N'HVAC', N'CDA'),
    (N'Building', N'HVAC', N'N/A'),
    (N'Building', N'Mech.', N'PCW'),
    (N'Building', N'Mech.', N'PV'),
    (N'Building', N'Mech.', N'FCU'),
    (N'Building', N'Mech.', N'AHU'),
    (N'Building', N'Mech.', N'FRZ'),
    (N'Building', N'Mech.', N'BA'),
    (N'Building', N'Mech.', N'MAU'),
    (N'Building', N'Mech.', N'N/A'),
    (N'Building', N'Elec.', N'UPS'),
    (N'Building', N'Elec.', N'生產盤'),
    (N'Building', N'Elec.', N'高/中/低壓盤'),
    (N'Building', N'Elec.', N'發電機'),
    (N'Building', N'Elec.', N'照明'),
    (N'Building', N'Elec.', N'N/A'),
    (N'Building', N'I&C', N'I&C'),
    (N'Building', N'I&C', N'LDS'),
    (N'Building', N'I&C', N'N/A'),
    (N'Building', N'LSS', N'火警系統'),
    (N'Building', N'LSS', N'VESDA'),
    (N'Building', N'LSS', N'N/A'),
    (N'Building', N'N/A', N'N/A'),
    -- Section: WTS
    (N'WTS', N'WWT', N'WWR'),
    (N'WTS', N'WWT', N'BGW'),
    (N'WTS', N'WWT', N'OXIDE'),
    (N'WTS', N'WWT', N'SAW'),
    (N'WTS', N'WWT', N'RCW'),
    (N'WTS', N'WWT', N'OAC'),
    (N'WTS', N'WWT', N'MMW'),
    (N'WTS', N'WWT', N'FWH'),
    (N'WTS', N'WWT', N'AWH'),
    (N'WTS', N'WWT', N'OWWT'),
    (N'WTS', N'WWT', N'EMG'),
    (N'WTS', N'WWT', N'加藥系統'),
    (N'WTS', N'WWT', N'Sludge'),
    (N'WTS', N'WWT', N'LSR'),
    (N'WTS', N'WWT', N'Blower'),
    (N'WTS', N'WWT', N'放流'),
    (N'WTS', N'WWT', N'N/A'),
    (N'WTS', N'UPW', N'MMF'),
    (N'WTS', N'UPW', N'ACF'),
    (N'WTS', N'UPW', N'2B3T'),
    (N'WTS', N'UPW', N'RO'),
    (N'WTS', N'UPW', N'MB'),
    (N'WTS', N'UPW', N'MD'),
    (N'WTS', N'UPW', N'CP'),
    (N'WTS', N'UPW', N'UF'),
    (N'WTS', N'UPW', N'N/A'),
    (N'WTS', N'SDW', N'工業水箱'),
    (N'WTS', N'SDW', N'消防水箱'),
    (N'WTS', N'SDW', N'民生用水'),
    (N'WTS', N'SDW', N'化糞池'),
    (N'WTS', N'SDW', N'沖身洗眼器'),
    (N'WTS', N'SDW', N'PIT'),
    (N'WTS', N'SDW', N'回收用水'),
    (N'WTS', N'SDW', N'N/A'),
    (N'WTS', N'N/A', N'N/A'),
    -- Section: GC
    (N'GC', N'GAS', N'GD'),
    (N'GC', N'GAS', N'LDS'),
    (N'GC', N'GAS', N'CQC'),
    (N'GC', N'GAS', N'Purifier'),
    (N'GC', N'GAS', N'SG'),
    (N'GC', N'GAS', N'BG'),
    (N'GC', N'Chemical', N'CCB'),
    (N'GC', N'Chemical', N'CCBTU'),
    (N'GC', N'Chemical', N'CDU'),
    (N'GC', N'Chemical', N'CMDU'),
    (N'GC', N'Chemical', N'SLR'),
    (N'GC', N'Chemical', N'W-Glue'),
    (N'GC', N'Chemical', N'VMB'),
    (N'GC', N'Chemical', N'N/A'),
    (N'GC', N'N/A', N'N/A'),
    -- Section: Project
    (N'Project', N'Project', N'Project'),
    (N'Project', N'Project', N'N/A'),
    (N'Project', N'Hook up', N'Hook up'),
    (N'Project', N'Hook up', N'N/A'),
    (N'Project', N'Site serve', N'Site serve'),
    (N'Project', N'Site serve', N'N/A'),
    (N'Project', N'N/A', N'N/A'),
    -- Section: 外部影響
    (N'外部影響', N'地震', N'地震'),
    (N'外部影響', N'地震', N'N/A'),
    (N'外部影響', N'壓降', N'壓降'),
    (N'外部影響', N'壓降', N'N/A'),
    (N'外部影響', N'火災', N'火災'),
    (N'外部影響', N'火災', N'N/A'),
    (N'外部影響', N'異味', N'異味'),
    (N'外部影響', N'異味', N'N/A'),
    (N'外部影響', N'N/A', N'N/A'),
    -- Section: N/A
    (N'N/A', N'N/A', N'N/A');

    -- Validation output
    SELECT COUNT(*) AS [PassdownSectionCount] FROM [dbo].[PassdownSection];
    SELECT * FROM [dbo].[PassdownSection] ORDER BY [PassdownSectionId];

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
