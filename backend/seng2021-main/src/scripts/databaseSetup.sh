#!/bin/bash

# Make sure PostgreSQL is running
echo "Checking if PostgreSQL is running..."
brew services start postgresql

# Create the database (if it doesn't already exist)
echo "Creating the database 'ordercreation'..."
psql -U postgres -c "CREATE DATABASE ordercreation;"

# Run the schema.sql file to set up the tables
echo "Setting up the schema..."
psql -U postgres -d ordercreation -f ../schema.sql

echo "Database setup completed!"