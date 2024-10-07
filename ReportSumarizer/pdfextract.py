import pdfplumber
import pandas as pd

def pdf_to_string(path):
    # Open the PDF file
    with pdfplumber.open(path) as pdf:
        # Initialize an empty list to hold all tables
        all_tables = []
        
        # Iterate through the pages
        for page in pdf.pages:
            # Extract the table from the page (if any)
            table = page.extract_table()
            
            # If a table is found, append it to all_tables
            if table:
                all_tables.extend(table)

    # Convert the list of tables to a Pandas DataFrame
    df = pd.DataFrame(all_tables[1:], columns=all_tables[0])

    #dropping rows with null values
    df=df.dropna(axis=0) 

    #dropping columns having -,>,<

    # List of symbols to check for
    symbols = ['-', '<', '>']

    # Loop through columns and check if any cell contains the symbols
    columns_to_drop = []
    for col in df.columns:
        # Check if any of the symbols are present in the column
        if df[col].astype(str).apply(lambda x: any(sym in x for sym in symbols)).any():
            columns_to_drop.append(col)

    # Drop the identified columns
    df = df.drop(columns=columns_to_drop)


    # Convert all values to a string without column names
    df_string = df.astype(str).agg(' '.join, axis=1).str.cat(sep=' ')

    # Output the final single string without column names
    return df_string

