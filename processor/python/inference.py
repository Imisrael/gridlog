import sys
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn import preprocessing
import traceback

import numpy as np
import json
import datetime as dt
import gzip, pickle
import aktaion.microbehavior_core as ex

window_len = 5
df_prediction = pd.DataFrame()

pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)

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
            # for key in dict_mb:
            #     print("~~~~~~~~~~~")
            #     print(key )
            #     print( dict_mb[key])
            #     print(type(dict_mb[key]))

            # convert each dict (window) to a dataframe and add to our global variable
            df_from_dict = pd.DataFrame([dict_mb], columns=dict_mb.keys())
            df_microbeahaviors = pd.concat([df_from_dict, df_microbeahaviors],ignore_index=True)
          #  print('Current DF Size ', len(df_microbeahaviors))
    print('Total DF Size ', len(df_microbeahaviors))
    return df_microbeahaviors

def random_forest(clf, df_proxy):
    try: 
        df = df_proxy
        print("==========DF COlumns========")
        print(df.columns)


        for column in df.columns:
            if df[column].dtype == type(object):
                try: 
                    le = preprocessing.LabelEncoder()
                    df[column] = df[column].astype("string")
                    le.fit(df[column])
                    print("Second le classes")
                    print(le.classes_)
                    df[column] = le.transform(df[column])
                except Exception as e:
                    print(traceback.format_exc())

        nanColumns = df.columns[df.isnull().any()].tolist()

        for nanColumn in nanColumns:
            df = df.drop(nanColumn, axis = 1)

        print("Running prediction")
        y_predict = clf.predict(df)
        print(y_predict)
        # for index, row in df.iterrows():
        #     print("Row")
        #     print(row.values)
        #     y_predict = clf.predict(row.values)
        #     print("=====")
        #     print(y_predict)

    except Exception as e: 
        print("Failure")
        print(e)
        


jsonStr = sys.argv[1]
list = jsonStr.split('|')
#print(jsonStr)
jsonList = []
for str in list:
    js = json.loads(str)
    jsonList.append(js)

df_new_logs = pd.json_normalize(jsonList)

filepath = "/app/data/random_forest.pkl"
with gzip.open(filepath, 'rb') as f:
    pic = pickle.Unpickler(f)
    clf = pic.load()

    
    df_new_logs['timestamp'] = pd.to_datetime(df_new_logs['timestamp'], unit='ms')
    df_new_logs['epochTime'] = df_new_logs['timestamp']
   # print(df_new_logs['epochTime'])
    df_new_logs = df_new_logs.rename(columns={'timestamp':'dateTime'})

   # print(df_new_logs.head())
    # print(df_new_logs.columns)

    try:
        df_prediction = create_df_of_sliding_windows(df_new_logs, df_prediction)
    except UnicodeDecodeError:
        print("Unicode Parsing Error")

    random_forest(clf, df_prediction)

