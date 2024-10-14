-- Drop the user table if it exists
IF OBJECT_ID('dbo.[user]', 'U') IS NOT NULL
    DROP TABLE dbo.[user];

-- Create the user table
CREATE TABLE dbo.[user] (
    id INT IDENTITY(1,1) PRIMARY KEY,  -- Auto-incrementing ID
    email NVARCHAR(255) NOT NULL UNIQUE,  -- Email is NOT NULL
    password NVARCHAR(255) NULL,  -- Password is nullable
    name NVARCHAR(100) NULL,  -- Name is nullable
    verification_code INT NULL CHECK(verification_code BETWEEN 100000 AND 999999),  -- Verification code is nullable
    verification_code_timestamp DATETIME2 NULL,  -- Verification code timestamp is nullable
    favourite_carpark NVARCHAR(MAX) NULL,  -- Favourite carpark is nullable
    profile_picture VARBINARY(MAX) NULL  -- Profile picture is nullable
);

-- Insert dummy data into the user table
INSERT INTO dbo.[user] (email, password, name, verification_code, verification_code_timestamp, favourite_carpark, profile_picture) 
VALUES 
('john.doe@example.com', 'password123', 'John Doe', 123456, GETDATE(), 'BLK 270/271 ALBERT CENTRE BASEMENT CAR PARK, BLK 98A ALJUNIED CRESCENT', NULL),
('jane.smith@example.com', NULL, 'Jane Smith', 654321, GETDATE(), 'BLK 101 JALAN DUSUN, BLK 98A ALJUNIED CRESCENT', NULL),
('samuel.jackson@example.com', 'mypassword789', NULL, 789012, GETDATE(), NULL, NULL);

-- Select all data from the user table
SELECT * FROM dbo.[user];
