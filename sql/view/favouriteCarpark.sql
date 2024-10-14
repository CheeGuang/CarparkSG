-- Create a view to display favourite car parks for each account
CREATE VIEW vw_favourite_carparks AS
SELECT 
    a.id AS account_id,
    a.name AS account_name,
    a.email,
    LTRIM(RTRIM(value)) AS favourite_carpark  -- Removes any leading/trailing spaces from car park addresses
FROM 
    account a
CROSS APPLY 
    STRING_SPLIT(a.favourite_carpark, ',')  -- Splitting the concatenated car park string by commas
GO

-- Query the view to test it
SELECT * FROM vw_favourite_carparks;
