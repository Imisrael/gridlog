# Load ML Logic
import machine_learning.microbehavior_core as ex

# Load pandas
import pandas as pd

# Load os to parse directories
import os
import time

start_time = time.time()

# Declare global exploit and benign dataFrame vars for keeping the raw log data
df_ex = pd.DataFrame()
df_be = pd.DataFrame()

# keep the extracted micro behaviors here
df_mb_ex = pd.DataFrame()
df_mb_be = pd.DataFrame()

# specify the length of window used in generating microbehavior statistics
window_len = 5

proxy_benign = True
proxy_exploit = True

# helper method for building a dataframe of sliding windows
def create_df_of_sliding_windows(df_raw_log, df_microbeahaviors):
    # use for determining upper bound in number of sliding windows we create
    df_len = len(df_raw_log)

    if df_len > window_len:
        for i in range(0, df_len - window_len):
            # create sliding window which outputs another dataframe
            df_raw_log_window = df_raw_log[i:i + window_len]

            # use the micro behavior api to extract the stats as a dict
            dict_mb = ex.HTTPMicroBehaviors.behaviorVector(df_raw_log_window)
            print(str(dict_mb))

            # convert each dict (window) to a dataframe and add to our global variable
            df_from_dict = pd.DataFrame([dict_mb], columns=dict_mb.keys())
            df_microbeahaviors = df_microbeahaviors.append(df_from_dict, ignore_index=True)
            print('Total DF Size ', len(df_microbeahaviors))


    return df_microbeahaviors

try:
    df_proxy_raw_log_benign = gpp.generic_proxy_parser(proxy_benign_dir + "/" + filename)
    df_mb_be = create_df_of_sliding_windows(df_proxy_raw_log_benign, df_mb_be)
    print(str(df_mb_be))
except UnicodeDecodeError:
    print("Unicode Parsing Error")

    output_path = 'data/benign_proxy_microbehaviors.csv'
    print("Writing Benign Proxy Microbehavior Statistics to CSV file: " + output_path)
    df_mb_be.to_csv(output_path)
    print("Done Writing Benign Proxy Microbehavior Data")
    print("--- %s seconds ---" % (time.time() - start_time))

# if proxy_exploit:
#     for filename in os.listdir(proxy_exploit_dir):
#         try:
#             df_proxy_raw_log_exploit = gpp.generic_proxy_parser(proxy_exploit_dir + "/" + filename)
#             df_mb_ex = create_df_of_sliding_windows(df_proxy_raw_log_exploit, df_mb_ex)
#             print(str(df_mb_ex))
#         except UnicodeDecodeError:
#             print("Unicode Parsing Error")

#     output_path = 'data/exploit_proxy_microbehaviors.csv'
#     print("Writing Exploit Proxy Microbehavior Statistics to CSV file: " + output_path)
#     df_mb_ex.to_csv(output_path)
#     print("Done Writing Exploit Proxy Microbehavior Data")
#     print("--- %s seconds ---" % (time.time() - start_time))

print("--- %s seconds ---" % (time.time() - start_time))
