import json

# Ask user for the file path
file_path = input("Enter the path to the obfuscated JSON file: ")

# Read the obfuscated JSON
with open(file_path, 'r', encoding='utf-8') as f:
    obfuscated_json = f.read()

# Decode Unicode escape sequences
decoded_json = json.loads(obfuscated_json)

# Pretty-print the deobfuscated JSON
print(json.dumps(decoded_json, indent=4, ensure_ascii=False))

