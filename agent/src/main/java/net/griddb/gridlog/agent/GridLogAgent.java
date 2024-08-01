package net.griddb.gridlog.agent;

import java.util.Properties;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.net.InetAddress;
import java.lang.Thread;
import com.toshiba.mwcloud.gs.*;

import net.griddb.gridlog.agent.LogsConfig;

class GridLogAgent {

    String griddbURL;
    String hostname;

    public GridLogAgent(String griddbURL) {
        this.griddbURL = griddbURL;

        try {
            String SystemName = InetAddress.getLocalHost().getHostName();
            this.hostname = SystemName;
        } catch (Exception E) {
            System.err.println(E.getMessage());
        }
    }

    public static HashMap<String, String> getGridDBConf(String path) {
        InputStream input;
        Properties props = new Properties();
        try {
            input = new FileInputStream(path);
            props.load(input);
        } catch (Exception e) {
            System.out.println("COULD NOT LOAD source.properties");
        }
        HashMap<String, String> griddbConf = new HashMap<>();
        griddbConf.put("url", props.getProperty("url"));
        griddbConf.put("username", props.getProperty("admin"));
        return griddbConf;
    }

    // No Name Type CSTR RowKey
    // --------------------------------------------------------
    // 0 logtype STRING NN [RowKey]
    // 1 file_path STRING
    // 2 interval INTEGER
    // 3 expiration_time INTEGER
    // 4 partition_unit STRING
    // 5 timestamp_position INTEGER
    // 6 regex_format STRING
    // 7 timestamp_format STRING
    // 8 schema STRING_ARRAY

    public static HashMap<String, Row> parseConfigFromDB() throws GSException {
        HashMap<String, Row> retval = new HashMap<String, Row>();
        try {
            GridDBNoSQL GridDBNoSQL = new GridDBNoSQL();
            RowSet<Row> rs = GridDBNoSQL.readConfigs();
            if (rs == null ) {
                return null;
            } else {
                while (rs.hasNext()) {
                    Row row = rs.next();
                    String keyName = row.getString(0);
                    retval.put(keyName, row);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return retval;
    }

    public static void main(String[] args) throws GSException {

        // reading GridDB Properties file
        HashMap<String, String> griddbConf = getGridDBConf("./conf/griddb.properties");
        String url = griddbConf.get("url");
        GridLogAgent logAgent = new GridLogAgent(url);

        HashMap<String, Row> configs = parseConfigFromDB();
        // for (String name: configs.keySet()) {
        //     System.out.println("configs key set: " + name);
        // }
        if (configs == null) {
            return;
        } else {     
            try {
                for (String key : configs.keySet()) {
                    Row row = configs.get(key);
                    LogsConfig logConf = new LogsConfig();
                    logConf.logtype = row.getString(0);
                    logConf.file_path = row.getString(1);
                    logConf.interval = row.getInteger(2);
                    logConf.expiration_time = row.getInteger(3);
                    logConf.partition_unit = row.getString(4);
                    String[] schemaArr = row.getStringArray(9);
                    // for (String s: schemaArr) {
                    //     System.out.println("S: " + s + " " + logConf.logtype);
                    // }
                    logConf.schemaArr = new ArrayList<HashMap<String, String>>();
                    for (int i = 0; i < schemaArr.length; i += 2) {
             //           System.out.println("Column: " + schemaArr[i] + "Column Type: " + schemaArr[i + 1]);
                        HashMap<String, String> tmpMap = new HashMap<String, String>();
                        tmpMap.put("key", schemaArr[i]);
                        tmpMap.put("type", schemaArr[i + 1]);
                        logConf.schemaArr.add(tmpMap);
                    }
                    LogReader logReader = new LogReader(logConf, logAgent.hostname, logAgent.griddbURL);
                    logReader.start();
                    Thread.sleep(1000);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

    }
}