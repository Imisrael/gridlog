package net.griddb.gridlog.processor;

import java.util.Locale;
import java.util.Properties;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.toshiba.mwcloud.gs.*;
import java.util.regex.Pattern;

import java.util.regex.Matcher;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.Types;
import java.text.DateFormat;
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

public class LogProcessor {
    GridStore store;
    HashMap<String, ConfigInfo> configs;
    Mapper mapper;

    public LogProcessor(HashMap<String, ConfigInfo> configs) {
        this.configs = configs;
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

    public Row patternMatcher(String containerName, RawLog log, ConfigInfo config) throws GSException {

        String format = config.regex_format;
        String dateFormat = config.timestamp_format;
        // System.out.println("format=" + format);
        // System.out.println("logrule=" + config.logtype);
        // System.out.println("rules="+config.schema);
        Pattern p = Pattern.compile(format);
        Matcher matcher = p.matcher(log.value);
        String[] schemaArr = config.schema;

        ArrayList<HashMap<String, String>> schema = new ArrayList<HashMap<String, String>>();
        for (int i = 0; i < schemaArr.length; i += 2) {
            // System.out.println("Column: " + schemaArr[i] + " Column Type: " + schemaArr[i
            // + 1]);
            HashMap<String, String> tmpMap = new HashMap<String, String>();
            tmpMap.put("name", schemaArr[i]);
            tmpMap.put("type", schemaArr[i + 1]);
            schema.add(tmpMap);
        }

        Row row = store.createRow(new ContainerInfo(
                containerName, ContainerType.COLLECTION, mapper.columnList(schema), false));

        if (!matcher.matches()) {
            // System.err.println("Cannot parse: " + log.value);
            return null;
        }

        for (int i = 1; i <= schema.size(); i++) {

            if (i == config.timestamp_position) {
                try {
                    DateTimeFormatter parseFormatter = new DateTimeFormatterBuilder()
                            .appendPattern(dateFormat)
                            .parseDefaulting(ChronoField.YEAR_OF_ERA, new Date().getYear() + 1900)
                            .toFormatter(Locale.ENGLISH);
                    ZonedDateTime zdt = LocalDateTime.parse(matcher.group(i), parseFormatter)
                            .atZone(ZoneId.systemDefault());

                    Date logDate = Date.from(zdt.toInstant());
                    mapper.setColumn(row, i - 1, logDate, schema.get(i - 1).get("type"));
                } catch (Exception e) {
                    e.printStackTrace();
                    System.err.println("Unable to parse date: " + matcher.group(i));
                }
            } else {
                mapper.setColumn(row, i - 1, matcher.group(i), schema.get(i - 1).get("type"));
            }
        }
        return row;
    }

    private String convertToJson(Row logRow, ConfigInfo config) throws JsonProcessingException, GSException {
        if (logRow == null) {
            return "";
        }
        ObjectMapper objectMapper = new ObjectMapper();
        HashMap<Object, Object> values = new HashMap<>();

        String[] schemaArr = config.schema;
        ContainerInfo info = logRow.getSchema();
        int n = info.getColumnCount();

        int j = 0;
        for (int i = 0; i < n; i++) {
            Object val = logRow.getValue(i);
            String name = schemaArr[j];
            j += 2;
            values.put(name, val);
        }
        String jsonData = objectMapper.writeValueAsString(values);

        return jsonData;
    }

    public static void main(String args[]) throws GSException, InterruptedException {

        DB db = new DB();
        HashMap<String, ConfigInfo> configs = db.readConfigs();
        LogProcessor lp = new LogProcessor(configs);
        while (true) {
            Map<String, List<Row>> containerRowsMap = new HashMap<>();
            ArrayList<String> containers = db.getRawLogContainers();

            int i = 0;
            for (String container : containers) {
                System.out.println(container + "======");

                ArrayList<RawLog> logs = db.getNewLogs(container, new Date());
                String proc_container = container.replaceAll("RAWLOG", "LOG");
                ArrayList<Row> proc_logs = new ArrayList<>();
                ArrayList<String> list_of_json = new ArrayList<>();
                for (RawLog log : logs) {
                    try {
                        // System.out.println(log.logtype + "~~~~~~");
                        // System.out.println("configs.get(log.logtype)" + configs.get(log.logtype));
                        Row row = lp.patternMatcher(proc_container, log, configs.get(log.logtype));

                        if (row != null) {
                            proc_logs.add(row);
                            // System.out.println("parsing this row: " + row);
                            if (proc_container.equals( "LOG_agent_http")) {
                                String jsonStr = lp.convertToJson(row, configs.get(log.logtype));
                                if (!(jsonStr.isEmpty())) {
                                    // System.out.println("adding to JsonStr");
                                    // System.out.println(jsonStr);
                                    list_of_json.add(jsonStr);
                                }
                            }

                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        System.out.println("Could not parse " + log);
                    }
                }
                if (proc_container.equals( "LOG_agent_http")) {
                    try {
                        if (list_of_json.size() > 0) {
                            String arg = String.join("|", list_of_json);
                            System.out.println("arg: " + arg);
                            Process process = new ProcessBuilder("/app/python/venv/bin/python3.12",
                                    "/app/python/inference.py", arg)
                                    .start();
                            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                            StringBuilder builder = new StringBuilder();
                            String line = null;
                            while ((line = reader.readLine()) != null) {
                                builder.append(line);
                                // builder.append(System.getProperty("line.separator"));
                            }
    
                            String result = builder.toString();
                            if (!(result.contains("Failure")) && result.length() > 0) {
                                String filtered = result.replaceAll("[^0-9,]",",");
                                String[] numbers = filtered.split(",");
                                int itr = 0;
                                for (String st : numbers) {
                                    if (!(st.isEmpty() )) {
                                        System.out.println("St: "+ st);
                                    }
                                }

                                int k = 0;
                                for (Row log : proc_logs) {
                                    if (!(numbers[k].isEmpty())) {
                                        System.out.println(Integer.parseInt(numbers[k]));
                                        log.setBool(26, Integer.parseInt(numbers[k]) == 1);
                                        log.setString(27, "Inferred");
                                        System.out.println("Setting row to Inferred");
                                        
                                    }
                                    k++;
                                }
                            } else {
                                System.out.println("failing result: " + result);
                            }

                        }

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                containerRowsMap.put(proc_container, proc_logs);

            }
            try {
                db.store.multiPut(containerRowsMap);
            } catch (Exception e) {
                // System.out.println("Error with inserting data");
                e.printStackTrace();
            }

            Thread.sleep(5000);
        }
    }
}