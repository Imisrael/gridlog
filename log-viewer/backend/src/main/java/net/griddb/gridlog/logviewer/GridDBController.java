package net.griddb.gridlog.logviewer;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.toshiba.mwcloud.gs.GSException;

import java.util.Date;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

@CrossOrigin(origins = { "*" }, maxAge = 4800, allowCredentials = "false")
@RestController
public class GridDBController {

    GridDB gridDB;
    GridDBNoSQL GridDBNoSQL;

    public GridDBController() throws GSException{
        super();
        gridDB = new GridDB();
        try {
            GridDBNoSQL = new GridDBNoSQL();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
    }

    static public class QueryList {
        // [[LOG_agent_nginx, statusCode, <, 666]]
    
        public String containerName;
        public String logType;
        public String operator;
        public String value;
        public String valuetype;
        public String limit;
        public String start;
        public String end;
        public boolean agg;
        public String interval;
        public String aggColumn;
        public String interpolation;
    }

    static public class AggQueryResult {
        //timestamp,count(statusCode), avg(contentLength), min(contentLength), max(contentLength)
        public Date timestamp;
        public Integer count;
        public Double avg;
        public Double min;
        public Double max;
    }     


      

    private String generateQuery(List<QueryList> queries) {
        StringBuilder str = new StringBuilder();
        QueryList first = queries.get(0);
        int i = 0;
        str.append("SELECT * FROM " + first.containerName + " WHERE ");

        for (QueryList val : queries) {
            System.out.println(val.valuetype);
            str.append(val.logType);
    
            str.append(" " + val.operator + " ");
    
            if (val.operator.equals("LIKE")) {
                str.append("'%" + val.value + "%'");
            } else if (val.value.contains("TIMESTAMP")) {
                str.append(val.value);
            } else if (val.valuetype.contains("number")) { //number type doesn't need single quotes around value for query
                str.append( val.value);
            } else {
                System.out.println("last else statement is true");
                str.append("'" + val.value + "'");
            }
        
            if (++i == queries.size()) {
                break;
            }
            str.append(" AND "); 
        }
        // default limit is 100. highest is 10000
        str.append(" LIMIT " + first.limit);
        str.append(";");
        return str.toString();
    }
    
    
private String generateAggQuery(List<QueryList> queries) {
    StringBuilder str = new StringBuilder();
    QueryList first = queries.get(0);
    int i = 0;


    //SELECT count(humidity),avg(humidity),min(humidity),max(humidity) FROM
    str.append("SELECT timestamp,count(" + first.logType + "),");
    str.append(" avg(" + first.aggColumn + "),");
    str.append(" min(" + first.aggColumn + "),");
    str.append(" max(" + first.aggColumn + ")");
    str.append(" FROM " + first.containerName + " WHERE ");
    str.append("timestamp > TO_TIMESTAMP_MS(" + first.start + ") AND ");
    str.append("timestamp < TO_TIMESTAMP_MS(" + first.end + ") AND ");
    for (QueryList val : queries) {
        str.append(val.logType);

        str.append(" " + val.operator + " ");

        if (val.operator.equals("LIKE")) {
            str.append("'%" + val.value + "%'");
        } else if (val.value.contains("TIMESTAMP")) {
            str.append(val.value);
        } else if (val.valuetype.contains("number")) { //number type doesn't need single quotes around value for query
            str.append( val.value);
        } else {
            System.out.println("last else statement is true");
            str.append("'" + val.value + "'");
        }
    
        if (++i == queries.size()) {
            break;
        }
        str.append(" AND ");
    }
    // SELECT timestamp,count(httpMethod), avg(contentLength), min(contentLength), max(contentLength) 
    // FROM LOG_agent_server 
    // WHERE timestamp > TO_TIMESTAMP_MS(1709884800000) 
    // AND timestamp < TO_TIMESTAMP_MS(1709971199000) 
    // AND httpMethod LIKE '%POST%' 
    // GROUP BY RANGE (timestamp) EVERY (1, hour) FILL (linear);

    str.append(" GROUP BY RANGE (timestamp) EVERY (1, " + first.interval + ")" );
    str.append(" FILL (" + first.interpolation + ")");
    str.append(";");
    return str.toString();
}


    @RequestMapping(value = "/getContainers", method = RequestMethod.GET)
    public ResponseEntity<?> getContainerNames() {
        List<String> listOfNames = gridDB.getContainerNames();
        System.out.println("list of names: " + listOfNames);
        return ResponseEntity.ok(listOfNames);
    }

    @RequestMapping(value = "/timestamp", method = RequestMethod.GET)
    public ResponseEntity<?> getTimestamp(@RequestParam String containerName) {
        HashMap<String, String> ts = gridDB.getTimestamp(containerName);
        return ResponseEntity.ok(ts);
    }

    @RequestMapping(value = "/containersWithParameters", method = RequestMethod.GET)
    public ResponseEntity<?> containersWithParameters(
            @RequestParam String hostname,
            @RequestParam("logType") String logType,
            @RequestParam("start") String start,
            @RequestParam("end") String end) {

        HashMap<String, List<?>> retval = new HashMap<>();

        if (!hostname.equals("none") && !logType.equals("none")) {
            List<String> listofContainers = new ArrayList<String>();
            listofContainers.add("RAWLOG_" + hostname + "_" + logType);
            retval = gridDB.queryAllContainersFromUserInput(listofContainers, start, end, logType);
        } else {
            List<String> listofContainers = gridDB.getContainerNamesWithParameters(hostname, logType);
            System.out.println("list of containers else ");
            retval = gridDB.queryAllContainersFromUserInput(listofContainers, start, end, logType);
        }

        return ResponseEntity.ok(retval);
    }


    @PostMapping("/advancedQuery")
    public ResponseEntity<?> advancedQuery(@RequestParam boolean aggregation , @RequestBody List<QueryList> data) {
        String queryStr = "";
        HashMap<String, List<?>> result = new HashMap<>();
        if (aggregation) {
            queryStr = generateAggQuery(data);
            result = gridDB.queryFromAggBuilder(queryStr);
        } else {
            queryStr = generateQuery(data);
            result = gridDB.queryFromBuilder(queryStr);
        }
        
        System.out.println(queryStr);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/createConfig")
    public ResponseEntity<?> createConfig (@RequestBody ConfigBody data) {

        GridDBNoSQL.createConfigContainer(data);
        return ResponseEntity.ok(200);
    }

    @RequestMapping(value = "/getConfigKeyNames", method = RequestMethod.GET)
    public ResponseEntity<List<String>> getConfigKeyNames () {
        List<String> keyNames = GridDBNoSQL.getConfigKeyNames();
        for (String s : keyNames) {
            System.out.println(s);
        }
        return ResponseEntity.ok(keyNames);
    }

}
