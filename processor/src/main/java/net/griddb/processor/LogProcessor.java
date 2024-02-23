package net.griddb.gridlog.processor;

import java.util.Locale;
import java.util.Properties;
import com.toshiba.mwcloud.gs.*;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.text.SimpleDateFormat;  
import java.util.Date;  
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

import java.time.temporal.ChronoField;
import java.time.ZoneId;
public class LogProcessor
{
    GridStore store;
    HashMap<String, ProcessorRule> rules;
    Mapper mapper;
    public LogProcessor (HashMap<String, ProcessorRule> rules ) {
        this.rules = rules;
        mapper = new Mapper();
        try {
            Properties props = new Properties();
            props.setProperty("notificationMember", "griddb-server:10001");
            props.setProperty("clusterName", "myCluster");
            props.setProperty("user", "admin"); 
            props.setProperty("password", "admin");
            store = GridStoreFactory.getInstance().getGridStore(props);
        } catch (Exception e) {
            e.printStackTrace();
        }        
    }

    public Row patternMatcher(String containerName, RawLog log) throws GSException {

        //String log = "Jul 19 13:50:02 hpelnxdev systemd[1888]: Started Tracker metadata database store and lookup manager.";
        //String pattern = "([\\w]+\\s[\\d]+\\s[\\d:]+)\\s([\\w]+)\\s([\\w]+)\\[.+\\]:\\s(.+)";
        //String pattern = "([\\d]+\\s[\\w]+\\s[\\d]+\\s[\\d:]+)\\s([\\w]+)\\s([\\w]+)\\[.+\\]:\\s(.+)";
        //String datePattern = "MMM dd HH:mm:ss";
        String format = rules.get(log.logtype).format;
        String dateFormat = rules.get(log.logtype).timestamp_format;
        System.out.println("format="+format);
        System.out.println("logrule="+rules.get(log.logtype));
        System.out.println("rules="+rules);
        Pattern p = Pattern.compile(format);
        Matcher matcher = p.matcher(log.value);

        store.putContainer(containerName, new ContainerInfo(containerName, ContainerType.COLLECTION, mapper.columnList(rules.get(log.logtype).schema), false), false);
        Row row = store.createRow(new ContainerInfo(containerName, ContainerType.COLLECTION, mapper.columnList(rules.get(log.logtype).schema), false));

        if (!matcher.matches()) {
            System.err.println("Cannot parse: "+log.value);
            return null;
        }

        for (int i=1; i <= rules.get(log.logtype).schema.size(); i++) {

            if (i == rules.get(log.logtype).timestamp_pos) {
                try {
                    DateTimeFormatter parseFormatter = new DateTimeFormatterBuilder()
                        .appendPattern(dateFormat)
                        .parseDefaulting(ChronoField.YEAR_OF_ERA, new Date().getYear()+1900)
                        .toFormatter(Locale.ENGLISH);
                    ZonedDateTime zdt = LocalDateTime.parse(matcher.group(i), parseFormatter).atZone(ZoneId.systemDefault());

                    Date logDate = Date.from(zdt.toInstant());
                    mapper.setColumn(row, i-1, logDate, rules.get(log.logtype).schema.get(i-1).get("type"));
                } catch (Exception e) {
                    e.printStackTrace();
                    System.err.println("Unable to parse date: "+matcher.group(i));
                }
            } else {

                mapper.setColumn(row, i-1, matcher.group(i), rules.get(log.logtype).schema.get(i-1).get("type"));

            }
        }
        return row;
    }
    public static void main(String args[]) throws GSException, InterruptedException {

        ConfigParser cp = new ConfigParser();
        cp.parseConfig("conf/config.json");
        DB db = new DB();
        LogProcessor lp = new LogProcessor(cp.rules);
        while(true) {
            Map<String, List<Row>> containerRowsMap  = new HashMap();
            ArrayList<String> containers = db.getRawLogContainers();

            for (String container : containers ) {
                System.out.println(container+"======");
                ArrayList<RawLog> logs = db.getNewLogs(container, new Date());
                String proc_container = container.replaceAll("RAWLOG", "LOG");
                ArrayList<Row> proc_logs = new ArrayList<>();
                for (RawLog log : logs) {
                    try {
                        Row row = lp.patternMatcher(proc_container, log);
                        if (row != null) {
                            proc_logs.add(row);
                            System.out.println("parsing this row: " + row);
                        } else
                            System.out.println("Could not parse "+log);
                    } catch (Exception e) {
                        e.printStackTrace();
                        System.out.println("Could not parse "+log);
                    }
                }
                containerRowsMap.put(proc_container, proc_logs);
            }
            System.out.println("Putting COntianers: " + containerRowsMap);
            db.store.multiPut(containerRowsMap);
            Thread.sleep(5000);
        }
    }
}
