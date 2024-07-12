import sys
import pandas as pd
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OrdinalEncoder
from sklearn.ensemble import RandomForestClassifier
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

def random_forest(clf, df_prediction):

    df = df_prediction
    try: 
       # print(df.head())
       # print(df['percentEncoded'])
        
        # for column in df_prediction.columns:
        #     if df_prediction[column].dtype == type(object):
        #         if (column == 'percentEncoded'):
        #             df_prediction[column] = df_prediction[column].astype(bool)
        #         elif (column == 'time_interval'):
        #             df_prediction[column] = df_prediction[column].astype(float)
        #         else:
        #             print("else clause of obhect")
        #             df_prediction[column] = df_prediction[column].astype(str)
        #         le = LabelEncoder()

        #         df[column] = le.fit_transform(df[column])
        #         df_prediction[column] = le.fit_transform(df_prediction[column])

        # nanColumns = df_prediction.columns[df_prediction.isnull().any()].tolist()

        # for nanColumn in nanColumns:
        #     df_prediction = df_prediction.drop(nanColumn, axis = 1)



        for column in df.columns:
            if df[column].dtype == type(object):
                try: 
                    df[column] = df[column].astype(str)

                    ordinal_encoder = OrdinalEncoder(handle_unknown='use_encoded_value',
                                                    unknown_value=-1)
                    df[column] = ordinal_encoder.fit_transform(df[column])
                    print(df[column])
                except Exception as e:
                    print("encoding failure")
                    print(e)

        nanColumns = df.columns[df.isnull().any()].tolist()

        for nanColumn in nanColumns:
            df = df.drop(nanColumn, axis = 1)


    #    print(df.head())
        print("Running prediction")
        y_predict = clf.predict(df)
        print("=====")
        print(y_predict)

    except Exception as e: 
        print(e)
        print("Failure")


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
    print('epochtime')
   # print(df_new_logs['epochTime'])
    df_new_logs = df_new_logs.rename(columns={'timestamp':'dateTime'})

    print(df_new_logs.head())
    # print(df_new_logs.columns)

    try:
        df_prediction = create_df_of_sliding_windows(df_new_logs, df_prediction)
    except UnicodeDecodeError:
        print("Unicode Parsing Error")

    random_forest(clf, df_prediction)

