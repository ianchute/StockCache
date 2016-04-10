-- Assignment:
-- DONT USE UI. CODE BY HAND.
-- Create an SP that accepts the following parameters:
-- 1. UNIX timestamp (seconds): integer (1460073600 => Apr 08 2016)
    -- number of seconds passed after January 1, 1970 00:00:00:0000
-- 2. opening price: money
-- 3. high price: money
-- 4. low price: money
-- 5. closing price: money
-- 6. volume: integer
-- 7. symbol: string (stock shortcut name)

-- Then insert the 6 values into table and FK it with the ticker.
-- metrics=> CREATE TABLE Symbol (
-- metrics(> id SERIAL PRIMARY KEY,
-- metrics(> name VARCHAR(10));

-- CREATE TABLE StockTick (
-- id SERIAL PRIMARY KEY,
-- symbol_id INT REFERENCES Symbol(id),
-- timestamp TIMESTAMP NOT NULL,
-- open DECIMAL NOT NULL,
-- high DECIMAL NOT NULL,
-- low DECIMAL NOT NULL,
-- close DECIMAL NOT NULL,
-- metrics(> volume INT NOT NULL);

-- Things to check:
-- 1. No same timestamp AND same ticker id. <- table constraint if possible
-- 2. High MUST BE GREATER THAN OR EQUAL to low, close, open
-- 3. Low MUST BE LESSER THAN OR EQUAL to high, close, open
-- 4. Everything cannot be negative
-- 5. Timestamp must be less than NOW() (not future-dated)
-- 6. Remove timestamp hours,minutes,seconds before inserting to database. mm:dd:yyyy
    -- also can be 4pm sharp.
-- 7.

-- Other things to do:
-- 1. Add Sector column and sector table (make seeder)
-- 2. Add subsector column and subsector table (make seeder)
-- 3. Sector-subsector pairing constraints table (seed)
-- 4. Create an SP that will popuplate another table that has the following fields:
    -- a. date varchar
    -- b. percent changed decimal, varchar
    -- c. value decimal, varchar
    -- d. is interpolation?
    -- e. remarks

CREATE TABLE Symbol (
	id AUTOINCREMENT PRIMARY KEY,
	name VARCHAR(10)
);