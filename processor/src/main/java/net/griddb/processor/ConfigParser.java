
package net.griddb.gridlog.processor;
import java.util.HashMap;
import java.util.ArrayList;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import java.io.FileReader;

class ConfigParser {

    public HashMap<String, ProcessorRule> rules;

    public void parseConfig (String filename) {
        JSONObject root;
        rules = new HashMap();
        try {
            root  = (JSONObject) JSONValue.parse(new FileReader(filename));
        } catch (Exception e) {
            System.err.println("couldnt parse "+filename);
            return;
        }

        JSONArray jsonRules = (JSONArray) root.get("rules");

        for (Object jsonRule_ : jsonRules) {
            JSONObject jsonRule = (JSONObject) jsonRule_;
            ProcessorRule rule = new ProcessorRule();
            rule.logtype = (String)jsonRule.get("logtype");
            rule.format = (String)jsonRule.get("format");
            rule.timestamp_pos = (Long)jsonRule.get("timestamp_pos");
            rule.timestamp_format = (String)jsonRule.get("timestamp_format");
            rule.schema = new ArrayList();
            for (Object jsonColumn_ : (JSONArray)jsonRule.get("schema")) {
                JSONObject jsonColumn = (JSONObject)jsonColumn_;
                HashMap<String, String> column = new HashMap();
                column.put("name", (String)jsonColumn.get("name"));
                column.put("type", (String)jsonColumn.get("type"));
                rule.schema.add(column);
            }

            rules.put(rule.logtype, rule);
        }
         
        System.out.println(rules);
    }
    public static void main(String args[]) {
    }
}
