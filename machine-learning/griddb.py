import jpype
import jpype.dbapi2
from sqlalchemy import create_engine
from sqlalchemy.engine.url import URL
import datetime as dt
import pandas as pd

import aktaion.microbehavior_core as ex

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

window_len = 5

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
            df_microbeahaviors = pd.concat([df_from_dict, df_microbeahaviors],ignore_index=True)
            print('Total DF Size ', len(df_microbeahaviors))

    return df_microbeahaviors



jpype.startJVM(jpype.getDefaultJVMPath(), "-ea", "-Djava.class.path=/app/lib/gridstore-jdbc-5.6.0.jar")

eng_url = URL.create(
    drivername='sqlajdbc',
    host='/myCluster/public',
    query={
        '_class': 'com.toshiba.mwcloud.gs.sql.Driver',
        '_driver': 'gs',
        'user': 'admin',
        'password': 'admin',
        'notificationMember': 'griddb-server:20001',
        '_jars':  '/app/lib/gridstore-jdbc-5.6.0.jar'
    }
)

eng = create_engine(eng_url)
with eng.connect() as c:
    print("Connected")
    df_proxy_exploit = pd.read_sql("SELECT * FROM LOG_agent_intrusion WHERE exploit = True", c)
    df_proxy_benign =  pd.read_sql("SELECT * FROM LOG_agent_intrusion WHERE exploit = True", c) 
    df_proxy_raw_log['timestamp'] = pd.to_datetime(df_proxy_raw_log['timestamp'])
    epochTime = (df_proxy_raw_log['timestamp'] - dt.datetime(1970,1,1)).dt.total_seconds()
    df_proxy_raw_log['epochTime'] = pd.to_datetime(epochTime, unit='s')
    df_proxy_raw_log.rename(columns={"timestamp": "dateTime"})
    df_proxy_raw_exploit = df_proxy_raw_log.loc[df_proxy_raw_log['exploit']]
    df_proxy_raw_benign = df_proxy_raw_log.loc[df_proxy_raw_log['exploit']==False]

    print(df_proxy_raw_exploit.info())
    print(df_proxy_raw_benign.head)
    # try:
    #     df_mb_be = create_df_of_sliding_windows(df_proxy_raw_log, df_mb_be)
    #     print(str(df_mb_be))
    # except UnicodeDecodeError:
    #     print("Unicode Parsing Error")

    # output_path = 'data/benign_proxy_microbehaviors.csv'
    # print("Writing Benign Proxy Microbehavior Statistics to CSV file: " + output_path)
    # df_mb_be.to_csv(output_path)
    # print("Done Writing Benign Proxy Microbehavior Data")
    # print("--- %s seconds ---" % (time.time() - start_time))