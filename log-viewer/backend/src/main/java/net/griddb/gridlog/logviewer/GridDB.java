package net.griddb.gridlog.logviewer;

import java.util.ArrayList;
import java.util.Date;
import java.util.Properties;

import net.griddb.gridlog.logviewer.GridDBController.AggQueryResult;

import java.util.List;
import java.util.HashMap;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

import java.net.URLEncoder;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;

public class GridDB {

    public Connection con;

    public GridDB() {
        try {
            // String serverName = "griddb-server";
            // String encodeServerName = URLEncoder.encode(serverName, "UTF-8");
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

    public List<String> getContainerNames() {
        List<String> listOfContainerNames = new ArrayList<String>();
        try {
            Statement stmt = con.createStatement();

            ResultSet rs = stmt.executeQuery("SELECT DISTINCT name from RAWLOG_writes;");

            while (rs.next()) {
                String name = rs.getString(1);
                listOfContainerNames.add(name);

                // System.out.println("SQL Row temp: " + ts + " " + hostname + log);
            }

        } catch (Exception e) {
            System.out.println("Error with getting RAWLOG_writes: getContainerNames()");
            e.printStackTrace();
        }

        return listOfContainerNames;
    }

    public List<String> getContainerNamesWithParameters(String hostname, String logtype) {
        List<String> listOfContainers = new ArrayList<String>();
        String queryStr = "SELECT name FROM RAWLOG_writes where name LIKE ?";

        try {
            PreparedStatement stmt = con.prepareStatement(queryStr);
            if (hostname != "none" && logtype.equals("none")) { // User selects Hostname, but keeps logtype as none
                // EXAMPLE: SELECT name FROM RAWLOG_writes where name LIKE 'RAWLOG_plex%';
                queryStr = "SELECT name FROM RAWLOG_writes where name LIKE ?;";
                stmt = con.prepareStatement(queryStr);
                String str = "RAWLOG_" + hostname + "%";
                stmt.setString(1, str);

            } else if (hostname.equals("none") && logtype != "none") { // User selects Logtype, but keeps hostname as
                                                                       // none
                // SELECT name FROM RAWLOG_writes where name LIKE '%tests';
                queryStr = "SELECT name FROM RAWLOG_writes where name LIKE ?";
                stmt = con.prepareStatement(queryStr);
                String str = "%" + logtype;
                stmt.setString(1, str);
            }
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                String name = rs.getString(1);
                listOfContainers.add(name);
            }

        } catch (Exception e) {
            System.out.println("Error with getting RAWLOG_writes: getContainerNamesWithParameters()");
            e.printStackTrace();
        }
        return listOfContainers;
    }

    public HashMap<String, List<?>> queryAllContainersFromUserInput(
            List<String> listOfContainers,
            String start,
            String end,
            String logtype) {

        HashMap<String, List<?>> retval = new HashMap<>();
        ConfigParser configParser = new ConfigParser();
        configParser.parseConfig("conf/config.json");

        for (String cont : listOfContainers) {
            String contName = cont.replaceAll("RAWLOG", "LOG");
            String[] arr = cont.split("_", 3);
            String logType = arr[2];

            ArrayList<HashMap<String, String>> temp = configParser.rules.get(logType).schema;
            retval.put("schema_" + contName, temp);
        }

        try {

            for (String container : listOfContainers) {
                String cont = container.replaceAll("RAWLOG", "LOG");
                String queryStr = ("SELECT * FROM " + cont
                        + "  WHERE timestamp > TO_TIMESTAMP_MS(?) AND timestamp < TO_TIMESTAMP_MS(?) LIMIT 1000");

                PreparedStatement stmt = con.prepareStatement(queryStr);
                long startMili = Long.parseLong(start);
                long endMili = Long.parseLong(end);
                stmt.setLong(1, startMili);
                stmt.setLong(2, endMili);
                ResultSet rs = stmt.executeQuery();

                ResultSetMetaData rsmd = rs.getMetaData();
                int n = rsmd.getColumnCount();
                List<HashMap<String, ?>> results = new ArrayList<>();

                List<List<Object>> listOfLists = new ArrayList<List<Object>>();

                // String temp_log_type = "";
                // String[] arr = cont.split("_", 3);
                // temp_log_type = arr[2];

                while (rs.next()) {
                    HashMap<String, Object> values = new HashMap<>();
                    List<Object> valuesArr = new ArrayList<>();
                    for (int i = 1; i <= n; i++) {
                        if (rsmd.getColumnType(i) == Types.VARCHAR) {
                            String val = rs.getString(i);
                            String name = rsmd.getColumnName(i);
                            values.put(name, val);
                            valuesArr.add(val);
                        } else if (rsmd.getColumnType(i) == Types.TIMESTAMP) {
                            String name = rsmd.getColumnName(i);
                            Date val = rs.getTimestamp(i);
                            DateFormat dateFormat = new SimpleDateFormat("YYYY-MM-dd'T'HH:mm:ss.SSS'Z'");
                            String strDate = dateFormat.format(val);
                            values.put(name, strDate);
                            valuesArr.add(strDate);
                        } else if (rsmd.getColumnType(i) == Types.INTEGER) {
                            String name = rsmd.getColumnName(i);
                            Integer val = rs.getInt(i);
                            values.put(name, val);
                            valuesArr.add(val);
                        }
                    }
                    // values.put("logtype", temp_log_type);
                    // valuesArr.add(temp_log_type);

                    results.add(values);
                    listOfLists.add(valuesArr);
                    retval.put(cont, results);
                    retval.put(cont + "_" + "arr", listOfLists);
                }
            }

        } catch (Exception e) {
            System.out.println("Error with getting RAWLOG_writes: queryAllContainersFromUserInput()");
            e.printStackTrace();
        }
        return retval;
    }

    public HashMap<String, List<?>> queryFromBuilder(String queryStr) {
        HashMap<String, List<?>> retval = new HashMap<>();
        PreparedStatement stmt;
        try {
            stmt = con.prepareStatement(queryStr);
            ResultSet rs = stmt.executeQuery();
            List<HashMap<String, ?>> results = new ArrayList<>();

            ResultSetMetaData rsmd = rs.getMetaData();
            int n = rsmd.getColumnCount();
            while (rs.next()) {
                HashMap<String, Object> values = new HashMap<>();

                for (int i = 1; i <= n; i++) {
                    if (rsmd.getColumnType(i) == Types.VARCHAR) {
                        String val = rs.getString(i);
                        String name = rsmd.getColumnName(i);
                        values.put(name, val);
                    } else if (rsmd.getColumnType(i) == Types.TIMESTAMP) {
                        String name = rsmd.getColumnName(i);
                        Date val = rs.getTimestamp(i);
                        DateFormat dateFormat = new SimpleDateFormat("YYYY-MM-dd'T'HH:mm:ss.SSS'Z'");
                        String strDate = dateFormat.format(val);
                        values.put(name, strDate);
                    } else if (rsmd.getColumnType(i) == Types.INTEGER) {
                        String name = rsmd.getColumnName(i);
                        Integer val = rs.getInt(i);
                        values.put(name, val);
                    }
                }
                // values.put("logtype", temp_log_type);
                // valuesArr.add(temp_log_type);

                results.add(values);
                retval.put("results", results);

            }
        } catch (SQLException e) {
            System.out.println("sql error: " + e);
        }
        return retval;
    }

    public HashMap<String, List<?>> queryFromAggBuilder(String queryStr) {
        HashMap<String, List<?>> retval = new HashMap<>();
        PreparedStatement stmt;
        try {
            stmt = con.prepareStatement(queryStr);
            ResultSet rs = stmt.executeQuery();

            //// SELECT count(humidity),avg(humidity),min(humidity),max(humidity) FROM
            List<AggQueryResult> listOfLogs = new ArrayList<>();
            while (rs.next()) {
                
                Date ts = rs.getTimestamp(1);
                Integer count = rs.getInt(2);
                Double avg = rs.getDouble(3);
                Double min = rs.getDouble(4);
                Double max = rs.getDouble(5);
                AggQueryResult temp = new AggQueryResult();
                temp.timestamp = ts;
                temp.count = count;
                temp.avg = avg;
                temp.min = min;
                temp.max = max;
                listOfLogs.add(temp);                
            }
            retval.put("results", listOfLogs);
        } catch (

        SQLException e) {
            System.out.println("sql error: " + e);
        }
        return retval;
    }

}
