package net.griddb.gridlog.agent;

import java.util.ArrayList;
import java.util.HashMap;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import java.io.FileReader;

class ConfigParser {

    HashMap<String, LogsConfig> rules;

    public HashMap<String, LogsConfig> parseConfig(String filename) {
        JSONObject root = new JSONObject();
        rules = new HashMap<>();
        try {
            root = (JSONObject) JSONValue.parse(new FileReader(filename));
        } catch (Exception e) {
            System.err.println("couldnt parse " + filename);
            e.printStackTrace();
        }

        JSONArray jsonRules = (JSONArray) root.get("logs");

        for (Object jsonRule_ : jsonRules) {
            JSONObject jsonRule = (JSONObject) jsonRule_;
            LogsConfig rule = new LogsConfig();
            rule.logtype = (String) jsonRule.get("type");
            rule.file_path = (String) jsonRule.get("path");
            rule.interval = (Integer) jsonRule.get("interval");
            rule.expiration_time = (Integer) jsonRule.get("expiration_time");
            rule.partition_unit = (Integer) jsonRule.get("partition_unit");
            rule.schemaArr = new ArrayList<>();
            for (Object jsonColumn_ : (JSONArray) jsonRule.get("columns")) {
                JSONObject jsonColumn = (JSONObject) jsonColumn_;
                HashMap<String, String> column = new HashMap<>();
                column.put("name", (String) jsonColumn.get("name"));
                column.put("type", (String) jsonColumn.get("type"));
                rule.schemaArr.add(column);
            }
            rules.put(rule.logtype, rule);
        }

        System.out.println(rules);
        return rules;
    }

    public static void main(String args[]) {
    }
}
