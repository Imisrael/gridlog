package net.griddb.gridlog.agent;

import java.util.ArrayList;
import java.util.HashMap;

class LogsConfig {
    String logtype;
    String file_path;
    Integer interval;
    Integer expiration_time;
    String partition_unit;
    ArrayList<HashMap<String, String>> schemaArr;
};