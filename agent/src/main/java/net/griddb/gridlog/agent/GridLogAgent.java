package net.griddb.gridlog.agent;

import java.util.Properties;

import net.griddb.gridlog.agent.ConfigParser.LogsConfig;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.net.InetAddress;

class GridLogAgent {

    static String hostname;
    String griddbURL;

    public GridLogAgent (String hostname, String griddbURL) {
        this.griddbURL = griddbURL;

		try {
            String SystemName = InetAddress.getLocalHost().getHostName();
            GridLogAgent.hostname = SystemName;
        }
        catch (Exception E) {
            System.err.println(E.getMessage());
        }      
    }
    
    public static HashMap<String, String> getGridDBConf (String path) {
        InputStream input;
        Properties props  = new Properties();
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

    public static void main(String[] args) {

        // reading GridDB Properties file
        HashMap<String, String> griddbConf = getGridDBConf("./conf/griddb.properties");
        String url = griddbConf.get("url");
        GridLogAgent logAgent = new GridLogAgent(hostname, url);


        // Reading and parsing logs.json conf file
        ConfigParser configParser = new ConfigParser();
        HashMap<String, ConfigParser.LogsConfig> logging = configParser.parseConfig("./conf/logs.json");

        for (LogsConfig mapElement : logging.values()) {
            System.out.println("Logging Valuyes: " + GridLogAgent.hostname);
            LogReader logReader = new LogReader(mapElement, GridLogAgent.hostname, logAgent.griddbURL);
            logReader.start();
        }

        for (LogsConfig mapElement : logging.values()) {
            LogReader logReader = new LogReader(mapElement, GridLogAgent.hostname, logAgent.griddbURL);
            try {
                logReader.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}