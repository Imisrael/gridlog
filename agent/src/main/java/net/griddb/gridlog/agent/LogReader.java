package net.griddb.gridlog.agent;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.time.*;
import java.nio.file.*;

import net.griddb.gridlog.agent.LogsConfig; 

// String type;
// String path;
// long interval;
// String expiration_time;
// String part_unit;
// String[] schemaArr ;

class LogReader extends Thread {

    static LogsConfig logConf;
    String hostname;
    String griddbURL;
    static GridDB gridDB;

    public LogReader (LogsConfig logConf, String hostname, String griddbURL) {
        this.logConf = logConf;
        this.hostname = hostname;
        this.griddbURL = griddbURL;
        gridDB = new GridDB();
    }

    public LogReader() {
        this.logConf = null;
        this.hostname = null;
        this.griddbURL = null;
        gridDB = new GridDB();
    }

    public static String getContainerName (String hostname, String logtype) {
        return "RAWLOG_" + hostname + "_" +logtype;
    }

    
    private static void monitorFile(
        File file, String hostname, 
        String logtype, 
        Integer interval, 
        String path, 
        String griddbURL,
        Integer expiration_time,
        String part_unit,
        ArrayList<HashMap<String, String>> containerSchema
        ) throws IOException {
        System.out.println("Monitoring new file: " + logtype + " " + "path " + path);
        BufferedReader buffered = new BufferedReader(new FileReader(file));
        GridDBWriter gWriter = new GridDBWriter(hostname, logtype, path, griddbURL);
        String cn = getContainerName(hostname, logtype);
        gridDB.createRAWLOGContainer(cn, expiration_time.toString(), part_unit); // creates container for specific logs
        gridDB.createLOGContainer(cn, expiration_time.toString(), part_unit, containerSchema);
        gWriter.createRAWLOGWrites();

        // string for raw log container
        StringBuilder str = new StringBuilder();

        // string for coninfo container SCHEMA=name,last_write
        StringBuilder strConInfo = new StringBuilder(); 

        str.append("[");
        Instant utcTime = Instant.now();
        Date date = Date.from(utcTime); 
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        String containerInfoString = "";
        int i = 1;
        try {
            while(true) {
                String line = buffered.readLine();      
                if( (line == null) || (i % 10 == 0))  {
                    // end of file, start polling
                    Thread.sleep(interval);
                    str.setLength(str.length() - 1); //remove last comma
                    str.append("]");
                    if (str.length() > 1) { // will continue to try to write ']' without this check
                        gWriter.writeLog(str.toString(), "rawlog");
                        
                        strConInfo.append("[");
                        containerInfoString = gWriter.writeToContainerInfo(sdf.format(date), hostname, logtype);
                        strConInfo.append(containerInfoString);
                        strConInfo.append("]");
                        
                        //
                        gWriter.writeLog(strConInfo.toString(), "RAWLOG_writes");
                    }
                    str.setLength(0);
                    strConInfo.setLength(0);
                    str.append("[");
                    i = 1;

                } else {
                    utcTime = Instant.now();
                    date = Date.from(utcTime); 
                    line = line.replace("\"", "");
                    String rawLogString = gWriter.putRowString(sdf.format(date), hostname, logtype,line, path);

                    str.append(rawLogString);
                    str.append(",");
                    i++;
                }
            }
        } catch(InterruptedException ex) {
            ex.printStackTrace();
        }
    }

    public void run() {
        String filePath = logConf.file_path;
        String logtype = logConf.logtype;
        Integer interval = logConf.interval;
        Integer expiration_time = logConf.expiration_time;
        String partition_unit = logConf.partition_unit;
        ArrayList<HashMap<String, String>> containerSchema = logConf.schemaArr;
        File f = new File(filePath);
        try {
            monitorFile(f, hostname, logtype, interval, filePath, griddbURL, expiration_time, partition_unit, containerSchema);
        } catch(IOException e) {
            e.printStackTrace();
        }
    }
}