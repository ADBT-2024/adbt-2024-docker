#!/bin/bash

# Find the file names and store them in a variable
filenames_sequelize_mariadb=$(find performanceMeasurements -type f -name "sequelize-mariadb-*")

if [ -z "$filenames_sequelize_mariadb" ]; then
  echo "No files starting with 'sequelize-mariadb' were found."
  exit 1
fi

filenames_mongoose_mongodb=$(find performanceMeasurements -type f -name "mongoose-mongodb-*")

if [ -z "$filenames_mongoose_mongodb" ]; then
  echo "No files starting with 'mongoose_mongodb' were found."
  exit 1
fi

filenames_mongoose_mongodbsrv=$(find performanceMeasurements -type f -name "mongoose-mongodb+srv-*")

if [ -z "$filenames_mongoose_mongodbsrv" ]; then
  echo "No files starting with 'mongoose-mongodb+srv' were found."
  exit 1
fi

output_file="./performanceMeasurements/aggregatedPerformance.txt"

# Loop a through the file names found and execute the rbql-js commands
echo "====SEQUELIZE_MARIADB====" >> "$output_file"
echo "$filenames_sequelize_mariadb" | while IFS= read -r filename; do
  #GLOBAL
  rbql-js --query "SELECT AVG(a3) as GLOBAL" --delim , --with-headers < "$filename" >> "$output_file"
  #USERS CATEGORY
  rbql-js --query "SELECT AVG(a3) as USERS WHERE like(a2,'/users%')" --delim , --with-headers < "$filename" >> "$output_file"
  #RESTAURANTS CATEGORY
  rbql-js --query "SELECT AVG(a3) as RESTAURANTS WHERE like(a2,'/restaurants%')" --delim , --with-headers < "$filename" >> "$output_file"
  #PRODUCTS CATEGORY
  rbql-js --query "SELECT AVG(a3) as PRODUCTS WHERE like(a2,'/products%')" --delim , --with-headers < "$filename" >> "$output_file"
  #ORDERS CATEGORY
  rbql-js --query "SELECT AVG(a3) as ORDERS WHERE like(a2,'/orders%')" --delim , --with-headers < "$filename" >> "$output_file"
done

echo "====MONGOOSE-MONGO-LOCAL====" >> "$output_file"
echo "$filenames_mongoose_mongodb" | while IFS= read -r filename; do
  #GLOBAL
  rbql-js --query "SELECT AVG(a3) as GLOBAL" --delim , --with-headers < "$filename" >> "$output_file"
  #USERS CATEGORY
  rbql-js --query "SELECT AVG(a3) as USERS WHERE like(a2,'/users%')" --delim , --with-headers < "$filename" >> "$output_file"
  #RESTAURANTS CATEGORY
  rbql-js --query "SELECT AVG(a3) as RESTAURANTS WHERE like(a2,'/restaurants%')" --delim , --with-headers < "$filename" >> "$output_file"
  #PRODUCTS CATEGORY
  rbql-js --query "SELECT AVG(a3) as PRODUCTS WHERE like(a2,'/products%')" --delim , --with-headers < "$filename" >> "$output_file"
  #ORDERS CATEGORY
  rbql-js --query "SELECT AVG(a3) as ORDERS WHERE like(a2,'/orders%')" --delim , --with-headers < "$filename" >> "$output_file"
done

echo "====MONGOOSE-MONGO-ATLAS====" >> "$output_file"
echo "$filenames_mongoose_mongodbsrv" | while IFS= read -r filename; do
  #GLOBAL
  rbql-js --query "SELECT AVG(a3) as GLOBAL" --delim , --with-headers < "$filename" >> "$output_file"
  #USERS CATEGORY
  rbql-js --query "SELECT AVG(a3) as USERS WHERE like(a2,'/users%')" --delim , --with-headers < "$filename" >> "$output_file"
  #RESTAURANTS CATEGORY
  rbql-js --query "SELECT AVG(a3) as RESTAURANTS WHERE like(a2,'/restaurants%')" --delim , --with-headers < "$filename" >> "$output_file"
  #PRODUCTS CATEGORY
  rbql-js --query "SELECT AVG(a3) as PRODUCTS WHERE like(a2,'/products%')" --delim , --with-headers < "$filename" >> "$output_file"
  #ORDERS CATEGORY
  rbql-js --query "SELECT AVG(a3) as ORDERS WHERE like(a2,'/orders%')" --delim , --with-headers < "$filename" >> "$output_file"
done
