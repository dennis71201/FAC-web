-- ==========================================
-- Site Data Insert Script
-- Date: 2026-05-11
-- Description: Insert factory site master data
-- ==========================================

SET NOCOUNT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO [dbo].[Site]
    (
        [SiteName]
    )
    VALUES
    (N'MTB'),
    (N'TCP'),
    (N'AATT'),
    (N'AATT 2');

    -- Validation output
    SELECT * FROM [dbo].[Site];

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
