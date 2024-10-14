-- Create a stored procedure to remove a car park from an account's favourites
CREATE PROCEDURE usp_remove_favourite_carpark
    @account_id INT,
    @carpark_to_remove NVARCHAR(255)
AS
BEGIN
    -- Check if the account exists
    IF EXISTS (SELECT 1 FROM account WHERE id = @account_id)
    BEGIN
        DECLARE @updated_favourite_carparks NVARCHAR(MAX);

        -- Retrieve the current favourite car parks, removing the one to be deleted
        SELECT @updated_favourite_carparks = 
            STRING_AGG(LTRIM(RTRIM(value)), ', ')
        FROM STRING_SPLIT((SELECT favourite_carpark FROM account WHERE id = @account_id), ',')
        WHERE LTRIM(RTRIM(value)) <> @carpark_to_remove;

        -- Update the account's favourite_carpark with the remaining car parks
        UPDATE account
        SET favourite_carpark = @updated_favourite_carparks
        WHERE id = @account_id;

        PRINT 'Car park removed from favourites successfully.';
    END
    ELSE
    BEGIN
        PRINT 'Account not found.';
    END
END;
GO

-- Example usage of the stored procedure
EXEC usp_remove_favourite_carpark @account_id = 1, @carpark_to_remove = 'BLK 123 EXAMPLE STREET';
