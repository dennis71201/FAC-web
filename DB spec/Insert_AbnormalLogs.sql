-- ==========================================
-- AbnormalLogs Test Data Insert Script
-- Date: 2026-05-11
-- Description: Insert abnormal response tracking records linked to Passdown anomalies
-- ==========================================

SET NOCOUNT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    -- Insert AbnormalLogs test records
    -- Note: PassdownId values reference the test data from Insert_Passdown.sql
    -- Assuming PassdownIds 5, 6, 7, 8, 10, 13 are the abnormal records
    INSERT INTO [dbo].[AbnormalLogs]
    (
        [PassdownId],
        [RC_Content],
        [CA_Content],
        [PA_Content],
        [PlanDate],
        [DueDate],
        [IsClosed],
        [ResponseEmployeeId],
        [ResponseTime],
        [IsAlive]
    )
    VALUES
    -- Response to PassdownId 5: Major exhaust system issue
    (5, 
     N'Root Cause: Thermal sensor calibration drift due to humidity exposure in harsh environment. Sensor output exceeded threshold by 1.5V.',
     N'Replace thermal sensor unit with new calibrated unit. Run full equipment diagnostics to verify baseline parameters.',
     N'Implement weatherproof housing for sensor installation. Schedule quarterly calibration checks to prevent future drift.',
     DATEADD(day, 3, GETDATE()),
     DATEADD(day, 2, GETDATE()),
     1,
     2,
     DATEADD(day, 2, GETDATE()),
     1),

    -- Response to PassdownId 6: Major AHU failure - first response (pending)
    (6,
     N'Root Cause: Bearing wear in main fan motor causing intermittent contact loss. Oil analysis indicates particle contamination.',
     N'Schedule urgent bearing replacement and motor rewind inspection. Deploy temporary portable AHU unit to maintain area climate control.',
     N'Implement predictive maintenance program with vibration monitoring for early detection of bearing degradation.',
     DATEADD(day, 5, GETDATE()),
     NULL,
     0,
     8,
     GETDATE() - 1,
     1),

    -- Response to PassdownId 6: Major AHU failure - second response (closing)
    (6,
     N'Updated Root Cause Analysis: Bearing replacement completed. Investigation shows insufficient maintenance interval schedule.',
     N'Completed motor rewind, new bearing installation, and full system commissioning test. Performance parameters restored to baseline.',
     N'Revised maintenance schedule: bearing inspection every 6 months instead of annually. Implemented oil analysis program.',
     DATEADD(day, 5, GETDATE()),
     GETDATE(),
     1,
     7,
     GETDATE(),
     1),

    -- Response to PassdownId 7: Minor sensor reading drift
    (7,
     N'Root Cause: LDS sensor drift due to normal aging. Sensor reading variance within +/- 2% of nominal which is acceptable per spec.',
     N'Perform sensor recalibration using certified test gas. Document baseline readings for future trend analysis.',
     N'Schedule sensor replacement at next maintenance window (6 months). Implement trending dashboard to monitor sensor health.',
     DATEADD(day, 2, GETDATE()),
     DATEADD(day, 1, GETDATE()),
     1,
     1,
     DATEADD(day, 1, GETDATE()),
     1),

    -- Response to PassdownId 8: RO membrane pressure - pending
    (8,
     N'Root Cause: RO membrane fouling due to particulate accumulation over 18 months of operation. Pre-filter maintenance overdue.',
     N'Replace pre-filter cartridge and perform RO membrane chemical clean (CIP) cycle. Restore pressure to specification.',
     N'Increase pre-filter replacement frequency from 6 to 3 months. Implement inlet water quality monitoring.',
     DATEADD(day, 7, GETDATE()),
     NULL,
     0,
     13,
     GETDATE() - 1,
     1),

    -- Response to PassdownId 9: Fire alarm sensor - closed record
    (9,
     N'Root Cause: Battery expired after 5 years of service. Detector functional but required immediate battery replacement per code.',
     N'Installed new lithium battery (5-year rated). Tested detector response and confirmed proper operation.',
     N'Schedule annual battery replacement in Q2 each year. Implement preventive replacement policy for all detectors.',
     GETDATE() - 5,
     GETDATE() - 5,
     1,
     1,
     GETDATE() - 5,
     1),

    -- Response to PassdownId 10: Chemical dosing unit - closed record
    (10,
     N'Root Cause: Dosing pump calibration drift due to wear in internal valve seats. Actual output variance: -3% from setpoint.',
     N'Complete pump disassembly, valve seat resurfacing, and recalibration using certified test solutions. Verified output accuracy.',
     N'Implement quarterly calibration verification. Install flow meter for real-time monitoring of dosing accuracy.',
     GETDATE() - 5,
     GETDATE() - 5,
     1,
     6,
     GETDATE() - 5,
     1),

    -- Response to PassdownId 13: Electrical panel temperature - pending
    (13,
     N'Root Cause: Cooling fan filter clogged with dust accumulation. Air circulation reduced by approximately 40%.',
     N'Clean cooling fan filter and air intake grilles. Verify fan operation and temperature return to baseline.',
     N'Install filter replacement schedule: monthly during summer, quarterly during winter. Consider upgrading to washable filters.',
     DATEADD(day, 1, GETDATE()),
     NULL,
     0,
     9,
     GETDATE(),
     1);

    -- Validation output
    SELECT COUNT(*) AS [AbnormalLogsCount] FROM [dbo].[AbnormalLogs];
    SELECT 
        [AbnormalLogsId],
        [PassdownId],
        [ResponseEmployeeId],
        [ResponseTime],
        [IsClosed],
        [PlanDate],
        [DueDate],
        [RC_Content],
        [CA_Content],
        [PA_Content]
    FROM [dbo].[AbnormalLogs]
    ORDER BY [ResponseTime] DESC;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
