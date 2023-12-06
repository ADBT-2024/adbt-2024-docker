# PowerShell equivalent for computePerformance.sh

# Find the file names and store them in variables
$filenames_sequelize_mariadb = Get-ChildItem -Path .\performanceMeasurements -Filter "sequelize-mariadb-*" -File -Recurse
$filenames_mongoose_mongodb = Get-ChildItem -Path .\performanceMeasurements -Filter "mongoose-mongodb-*" -File -Recurse
$filenames_mongoose_mongodbsrv = Get-ChildItem -Path .\performanceMeasurements -Filter "mongoose-mongodb+srv-*" -File -Recurse

# Function to check if files were found and exit if not
function Check-Files {
    param (
        [Parameter(Mandatory=$true)]
        [object]$Files,
        [Parameter(Mandatory=$true)]
        [string]$Name
    )
    
    if ($Files.Count -eq 0) {
        Write-Host "No files starting with '$Name' were found."
        exit 1
    }
}

# Check if files were found
Check-Files -Files $filenames_sequelize_mariadb -Name "sequelize-mariadb"
Check-Files -Files $filenames_mongoose_mongodb -Name "mongoose-mongodb"
Check-Files -Files $filenames_mongoose_mongodbsrv -Name "mongoose-mongodb+srv"

$output_file = ".\performanceMeasurements\aggregatedPerformance.txt"

# Ensure the output file is empty and UTF-8 encoded
if (Test-Path $output_file) { Remove-Item $output_file }
New-Item -Path $output_file -ItemType File

# Function to process files
function Process-Files {
    param (
        [Parameter(Mandatory=$true)]
        [object]$Files,
        [Parameter(Mandatory=$true)]
        [string]$SectionHeader
    )

    Add-Content -Path $output_file -Value "====$SectionHeader====" -Encoding UTF8
    foreach ($file in $Files) {
        # GLOBAL
        Get-Content $file.FullName | & rbql-js --query "SELECT AVG(a3) as GLOBAL" --delim "," --with-headers | Out-File -Append -Encoding UTF8 -FilePath $output_file
        # USERS CATEGORY
        Get-Content $file.FullName | & rbql-js --query "SELECT AVG(a3) as USERS WHERE like(a2,'/users%')" --delim "," --with-headers | Out-File -Append -Encoding UTF8 -FilePath $output_file
        # RESTAURANTS CATEGORY
        Get-Content $file.FullName | & rbql-js --query "SELECT AVG(a3) as RESTAURANTS WHERE like(a2,'/restaurants%')" --delim "," --with-headers | Out-File -Append -Encoding UTF8 -FilePath $output_file
        # PRODUCTS CATEGORY
        Get-Content $file.FullName | & rbql-js --query "SELECT AVG(a3) as PRODUCTS WHERE like(a2,'/products%')" --delim "," --with-headers | Out-File -Append -Encoding UTF8 -FilePath $output_file
        # ORDERS CATEGORY
        Get-Content $file.FullName | & rbql-js --query "SELECT AVG(a3) as ORDERS WHERE like(a2,'/orders%')" --delim "," --with-headers | Out-File -Append -Encoding UTF8 -FilePath $output_file
    }
}

# Process the files
Process-Files -Files $filenames_sequelize_mariadb -SectionHeader "SEQUELIZE_MARIADB"
Process-Files -Files $filenames_mongoose_mongodb -SectionHeader "MONGOOSE-MONGO-LOCAL"
Process-Files -Files $filenames_mongoose_mongodbsrv -SectionHeader "MONGOOSE-MONGO-ATLAS"
