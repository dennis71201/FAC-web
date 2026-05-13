-- ==========================================
-- EmployeePermission Data Update Script
-- Date: 2026-05-11
-- Description: Add Passdown permission key into EmployeePermission.Permission JSON
-- ==========================================

SET NOCOUNT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    -- Rule:
    -- All employees can use Passdown page, regardless of role.
    -- 1) If Permission is valid JSON and missing $.Passdown:
    --    Set Passdown = true
    -- 2) If Permission is invalid JSON or NULL, rebuild a minimal JSON payload with Passdown = true.
    UPDATE ep
    SET [Permission] =
        CASE
            WHEN ISJSON(ep.[Permission]) = 1 THEN
                CASE
                    WHEN JSON_VALUE(ep.[Permission], '$.Passdown') IS NULL THEN
                        JSON_MODIFY(
                            ep.[Permission],
                            '$.Passdown',
                            CAST(1 AS bit)
                        )
                    ELSE ep.[Permission]
                END
            ELSE
                N'{"Attendance Record": true, "Passdown": true}'
        END
    FROM [dbo].[EmployeePermission] ep;

    -- Validation output
    SELECT
        ep.[EmployeePermissionId],
        ep.[EmployeeId],
        ep.[Role],
        JSON_VALUE(ep.[Permission], '$.Passdown') AS [PassdownPermission],
        ep.[Permission]
    FROM [dbo].[EmployeePermission] ep
    ORDER BY ep.[EmployeePermissionId];

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
