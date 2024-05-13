package net.griddb.gridlog.agent;

import java.util.*;

import java.net.URLEncoder;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class GridDB {

    public Connection con;

    public GridDB() {
        try {
            String notificationMember = "griddb-server:20001";
            String clusterName = "myCluster";
            String databaseName = "public";
            String username = "admin";
            String password = "admin";
            String encodeClusterName = URLEncoder.encode(clusterName, "UTF-8");
            String encodeDatabaseName = URLEncoder.encode(databaseName, "UTF-8");
            String jdbcUrl = "jdbc:gs://" + notificationMember + "/" + encodeClusterName + "/" + encodeDatabaseName;

            Properties prop = new Properties();
            prop.setProperty("user", username);
            prop.setProperty("password", password);

            System.out.println(jdbcUrl);

            con = DriverManager.getConnection(jdbcUrl, prop);

        } catch (Exception e) {
            System.out.println("Could not connect to GridDB via JDBC, exiting.");
            e.printStackTrace();
            System.exit(-1);
        }
    }

    public void createRAWLOGContainer(String container_name, String expiration_time, String part_unit ) {
        try {
            Statement stmt = con.createStatement(); 
            StringBuilder queryString = new StringBuilder();
            queryString.append("CREATE TABLE IF NOT EXISTS ");
            queryString.append(container_name);
          //  queryString.append("(ts TIMESTAMP PRIMARY KEY NOT NULL, hostname STRING, logtype STRING, value STRING, path STRING )");
            queryString.append("(ts TIMESTAMP NOT NULL, hostname STRING, logtype STRING, value STRING, path STRING );");
            // queryString.append("WITH");
            // queryString.append("(expiration_type='PARTITION',expiration_time="+expiration_time+",expiration_time_unit='DAY')");
            // queryString.append("PARTITION BY RANGE (ts) EVERY ("+part_unit+", DAY);");
            System.out.println(queryString.toString());
            stmt.executeUpdate(queryString.toString());

        } catch (Exception e) {
            System.out.println("Error with creating time partitioned table: createRAWLOGContainer()");
            e.printStackTrace();
        }
    }

    public void createLOGContainer(String containerName, String expirationTime, String timeUnit, String logType) {
        ConfigParser configParser = new ConfigParser();
        configParser.parseConfig("./conf/logs.json");
        ArrayList<HashMap<String, String>> containerSchema = configParser.rules.get(logType).columns;
        String contLogName = containerName.replaceAll("RAWLOG", "LOG");
        try {
            Statement stmt = con.createStatement(); 
            StringBuilder queryString = new StringBuilder();
            queryString.append("CREATE TABLE IF NOT EXISTS ");
            queryString.append(contLogName);
            queryString.append("( ");
            int i = 0;
            for (HashMap<String, String> col : containerSchema) {
                
                queryString.append(col.get("name"));
                queryString.append(" ");
                queryString.append(col.get("type"));
                if (i == 0 ) { queryString.append(" NOT NULL");} // first timestamp NEEDs to be not null
                queryString.append(", ");
                i++;
            }
            queryString.setLength(queryString.length() - 2); //remove last comma and space for last column
            queryString.append(") WITH ");
            queryString.append("(expiration_type='PARTITION',expiration_time=30,expiration_time_unit='DAY')");
            queryString.append("PARTITION BY RANGE (timestamp) EVERY (30, DAY);");
            System.out.println("LOG CONTAINER: " + queryString.toString());
            stmt.executeUpdate(queryString.toString());

        } catch (Exception e) {
            
        }


    }

    public void writeLog (String value, String container_name) {
        try {
            Statement stmt = con.createStatement();
            stmt.executeUpdate(container_name);

        } catch (Exception e) {
            System.out.println("Error writing log with JDBC");
            e.printStackTrace();
        }
    }

}

