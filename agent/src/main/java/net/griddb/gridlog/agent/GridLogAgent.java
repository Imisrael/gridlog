package net.griddb.gridlog.agent;

import java.util.Properties;

import javax.print.attribute.HashPrintJobAttributeSet;

import org.ietf.jgss.GSSException;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.net.InetAddress;
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
    // 4 partition_unit INTEGER
    // 5 timestamp_position INTEGER
    // 6 regex_format STRING
    // 7 timestamp_format STRING
    // 8 schema STRING_ARRAY

    public static HashMap<String, Row> parseConfigFromDB() throws GSSException {
        HashMap<String, Row> retval = new HashMap<String, Row>();
        try {
            GridDBNoSQL GridDBNoSQL = new GridDBNoSQL();
            RowSet<Row> rs = GridDBNoSQL.readConfigs();
            while (rs.hasNext()) {
                Row row = rs.next();
                String keyName = row.getString(0);
                System.out.println("One row of data read from parseConfig keyname: " + keyName);
                retval.put(keyName, row);
                // String file_path = row.getString(1);
                // int interval = row.getInteger(2);
                // int expiration_time = row.getInteger(3);
                // int partition_unit = row.getInteger(4);
                // String[] schemaArr = row.getStringArray(8);

            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return retval;
    }

    public static void main(String[] args) throws GSSException {

        // reading GridDB Properties file
        HashMap<String, String> griddbConf = getGridDBConf("./conf/griddb.properties");
        String url = griddbConf.get("url");
        GridLogAgent logAgent = new GridLogAgent(url);

        HashMap<String, Row> configs = parseConfigFromDB();

        int k = 0;
        
        try {
            
            for (String key : configs.keySet()) {
                
                System.out.println("iterating through k for rows in configs table: " + k);
                k++;
                Row row = configs.get(key);
                LogsConfig logConf = new LogsConfig();
                logConf.logtype = row.getString(0);
                logConf.file_path = row.getString(1);
                logConf.interval = row.getInteger(2);
                logConf.expiration_time = row.getInteger(3);
                logConf.partition_unit = row.getInteger(4);
                String[] schemaArr = row.getStringArray(8);
                logConf.schemaArr = new ArrayList<HashMap<String, String>>();
                for (int i = 0; i < schemaArr.length; i += 2) {
                    System.out.println("Column: " + schemaArr[i] + "Column Type: " + schemaArr[i + 1]);
                    HashMap<String, String> tmpMap = new HashMap<String, String>();
                    tmpMap.put("key", schemaArr[i]);
                    tmpMap.put("type", schemaArr[i + 1]);
                    logConf.schemaArr.add(tmpMap);
                }
                LogReader logReader = new LogReader(logConf, logAgent.hostname, logAgent.griddbURL);
                logReader.start();
            }
            // for (int idx = 0; idx < k; idx++) {
            //     System.out.println("How many of these log reader joins we got>? " + idx);
            //     try {
            //         logReader.join();
            //     } catch (InterruptedException e) {
            //         e.printStackTrace();
            //     }
            // }

        } catch (Exception e) {
            e.printStackTrace();
        }


    }
}