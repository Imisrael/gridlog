import jpype
import jpype.dbapi2
from sqlalchemy import create_engine
from sqlalchemy.engine.url import URL
import pandas as pd

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
    # res = c.execute('SELECT CURRENT_DATE').fetchall()
    # print(res)
    df = pd.read_sql("SELECT timestamp FROM LOG_agent_intrusion_exploit", c)
    print(df.head())

