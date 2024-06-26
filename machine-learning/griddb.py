import jpype
import jpype.dbapi2

jpype.startJVM(jpype.getDefaultJVMPath(), "-ea", "-Djava.class.path=/app/lib/gridstore-jdbc-5.6.0.jar")

url = "jdbc:gs://griddb-server:20001/myCluster/public"
conn = jpype.dbapi2.connect(url, driver="com.toshiba.mwcloud.gs.sql.Driver", driver_args={"user": "admin", "password": "admin"})
curs = conn.cursor()
curs.execute("SELECT timestamp  FROM LOG_agent_intrusion_exploit")
rows = curs.fetchall()
