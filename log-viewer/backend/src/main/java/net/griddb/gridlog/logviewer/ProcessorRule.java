package net.griddb.gridlog.logviewer;
import java.util.ArrayList;
import java.util.HashMap;
class ProcessorRule {
        String logtype;
        String format;
        long timestamp_pos;
        String timestamp_format;
        ArrayList<HashMap <String, String>> schema;
    };


