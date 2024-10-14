-- Create a stored procedure to add a car park to an account's favourites
CREATE PROCEDURE usp_add_favourite_carpark
    @account_id INT,
    @new_carpark NVARCHAR(255)
AS
BEGIN
    -- Check if the account exists
    IF EXISTS (SELECT 1 FROM account WHERE id = @account_id)
    BEGIN
        -- Update the account's favourite_carpark field by concatenating the new car park
        UPDATE account
        SET favourite_carpark = 
            CASE 
                WHEN favourite_carpark IS NULL OR favourite_carpark = '' THEN @new_carpark  -- If no favourites exist, just add the new one
                ELSE favourite_carpark + ', ' + @new_carpark  -- Otherwise, concatenate the new car park
            END
        WHERE id = @account_id;
        
        PRINT 'Car park added to favourites successfully.';
    END
    ELSE
    BEGIN
        PRINT 'Account not found.';
    END
END;
GO

-- Example usage of the stored procedure
EXEC usp_add_favourite_carpark @account_id = 1, @new_carpark = 'BLK 123 EXAMPLE STREET';
