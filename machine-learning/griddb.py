import jpype
import jpype.dbapi2
from sqlalchemy import create_engine
from sqlalchemy.engine.url import URL
import datetime as dt
import pandas as pd
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import numpy as np
import gzip, pickle, pickletools

import aktaion.microbehavior_core as ex

# Load os to parse directories
import time

start_time = time.time()

# # Declare global exploit and benign dataFrame vars for keeping the raw log data
# df_ex = pd.DataFrame()
# df_be = pd.DataFrame()

# keep the extracted micro behaviors here
df_mb_ex = pd.DataFrame()
df_mb_be = pd.DataFrame()

window_len = 5
num_of_rows = "90000"

# helper method for building a dataframe of sliding windows
def create_df_of_sliding_windows(df_raw_log, df_microbeahaviors):
    # use for determining upper bound in number of sliding windows we create
    df_len = len(df_raw_log)
    print("creating sliding windows")
    if df_len > window_len:
        for i in range(0, df_len - window_len):
            # create sliding window which outputs another dataframe
            df_raw_log_window = df_raw_log[i:i + window_len]

            # use the micro behavior api to extract the stats as a dict
            dict_mb = ex.HTTPMicroBehaviors.behaviorVector(df_raw_log_window)
            # print(str(dict_mb))

            # convert each dict (window) to a dataframe and add to our global variable
            df_from_dict = pd.DataFrame([dict_mb], columns=dict_mb.keys())
            df_microbeahaviors = pd.concat([df_from_dict, df_microbeahaviors],ignore_index=True)
          #  print('Current DF Size ', len(df_microbeahaviors))
    print('Total DF Size ', len(df_microbeahaviors))
    return df_microbeahaviors



def random_forest(df_proxy_exploit, df_proxy_benign):

    try: 
        df_proxy_exploit['Type'] = "exploit"
        df_proxy_benign['Type'] = "benign"
        frame = [df_proxy_exploit, df_proxy_benign]
        df = pd.concat(frame)
        print(df.head())
        print(df['percentEncoded'])

        X = df

        for column in df.columns:
            if df[column].dtype == type(object):
                df[column] = df[column].astype(str)
                le = LabelEncoder()

                df[column] = le.fit_transform(df[column])

        nanColumns = df.columns[df.isnull().any()].tolist()

        for nanColumn in nanColumns:
            df = df.drop(nanColumn, axis = 1)

        featureList = []
        X = df.drop('Type', axis=1)
        for feature in X:
            featureList.append(feature)

        featureList = np.array(featureList)
        y = df['Type']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)

        random_forest = RandomForestClassifier(n_estimators=30, max_depth=10, random_state=1)

        random_forest.fit(X_train, y_train)
        RandomForestClassifier(bootstrap=True, class_weight=None, criterion='gini',
                    max_depth=10, max_features='auto', max_leaf_nodes=None,
                    min_impurity_decrease=1e-07, min_samples_leaf=1,
                    min_samples_split=2, min_weight_fraction_leaf=0.0,
                    n_estimators=30, n_jobs=1, oob_score=False, random_state=1,
                    verbose=0, warm_start=False)

        y_predict = random_forest.predict(X_test)
        filepath = "/app/data/random_forest.pkl"
        with gzip.open(filepath, "wb") as f:
            pickled = pickle.dumps(random_forest)
            optimized_pickle = pickletools.optimize(pickled)
            print("Writing to file")
            f.write(optimized_pickle)

        print(accuracy_score(y_test, y_predict))


        from sklearn.metrics import confusion_matrix

        print(pd.DataFrame(
            confusion_matrix(y_test, y_predict),
            columns=['Predicted Benign', 'Predicted Exploit'],
            index=['True Benign', 'True Exploit']
        ))

        importances = random_forest.feature_importances_
        importances = [x for x in importances if x != 0.0]
        importances = np.array(importances)
        #print importances
        std = np.std([tree.feature_importances_ for tree in random_forest.estimators_],
                    axis=0)
        indices = np.argsort(importances)[::-1]

        # Print the feature ranking
        print("Feature ranking:")

        for f in range(len(importances)):
            print("%d. feature %s (%f)" % (f + 1, featureList[f], importances[indices[f]]))

    except Exception as e: 
        print(e)
        print("Failure")



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
    print("Querying GridDB: " + "SELECT * FROM LOG_agent_intrusion WHERE exploit = True limit " + num_of_rows)
    print("Querying GridDB: " + "SELECT * FROM LOG_agent_intrusion WHERE exploit = False limit " + num_of_rows)
    df_proxy_exploit = pd.read_sql("SELECT * FROM LOG_agent_intrusion WHERE exploit = True limit " + num_of_rows, c)
    df_proxy_benign =  pd.read_sql("SELECT * FROM LOG_agent_intrusion WHERE exploit = False limit " + num_of_rows, c) 

    df_proxy_exploit['timestamp'] = pd.to_datetime(df_proxy_exploit['timestamp'])
    df_proxy_benign['timestamp'] = pd.to_datetime(df_proxy_benign['timestamp'])

    epoch_time_exploit = (df_proxy_exploit['timestamp'] - dt.datetime(1970,1,1)).dt.total_seconds()
    epoch_time_benign = (df_proxy_benign['timestamp'] - dt.datetime(1970,1,1)).dt.total_seconds()

    df_proxy_exploit['epochTime'] = pd.to_datetime(epoch_time_exploit, unit='s')
    df_proxy_benign['epochTime'] = pd.to_datetime(epoch_time_benign, unit='s')
    
    df_proxy_exploit.rename(columns={"timestamp": "dateTime"})
    df_proxy_benign.rename(columns={"timestamp": "dateTime"})

    try:
        df_mb_be = create_df_of_sliding_windows(df_proxy_benign, df_mb_be)
        #print("printing global df mb be")
        #print(str(df_mb_be))
    except UnicodeDecodeError:
        print("Unicode Parsing Error")

    try:
        df_mb_ex = create_df_of_sliding_windows(df_proxy_exploit, df_mb_ex)
        #print("printing global df mb ex")
        #print(str(df_mb_ex))
    except UnicodeDecodeError:
        print("Unicode Parsing Error")

    # output_path = 'data/exploit_proxy_microbehaviors.csv'
    # print("Writing Benign Proxy Microbehavior Statistics to CSV file: " + output_path)
    # df_mb_ex.to_csv(output_path)
    # print("Done Writing Benign Proxy Microbehavior Data")
    # print("--- %s seconds ---" % (time.time() - start_time))


    random_forest(df_mb_ex, df_mb_be)

    
