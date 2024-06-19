#!/bin/sh

# Find all files in the directory and run the replace_env_vars function on each
find "/usr/share/nginx/html" -type f -exec sh -c '
  replace_env_vars() {
    file=$1
    # Get all unique environment variables in the form of process.env.VARIABLE
    env_vars=$(grep -o "process\\.env\\.[a-zA-Z_][a-zA-Z0-9_]*" "$file" | sort -u)
    
    for var in $env_vars; do
      # Extract the variable name (e.g., API_URL from process.env.API_URL)
      var_name=$(echo "$var" | awk -F"." "{print \$3}")
      # Get the value of the environment variable
      var_value=$(printenv "$var_name")
      # If the environment variable is set, replace it in the file
      if [ -n "$var_value" ]; then
        # Replace the occurrence with the value in double quotes
        sed -i "s|$var|\"$var_value\"|g" "$file"
      else
        echo "Warning: Environment variable $var_name is not set or is empty. Replacing by empty string."
        sed -i "s|$var|\"\"|g" "$file"
      fi
    done
  }
  replace_env_vars "$0"
' {} \;

echo "Replacement completed."