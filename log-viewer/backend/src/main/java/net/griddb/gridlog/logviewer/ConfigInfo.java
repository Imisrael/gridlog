package net.griddb.gridlog.logviewer;

import com.toshiba.mwcloud.gs.*;

class ConfigInfo {
    @RowKey String logtype;
    String file_path;
    Integer interval;
    Integer expiration_time;
    Integer partition_unit;
    Integer timestamp_position;
    String regex_format;
    String timestamp_format;
    String[] schema;
   // HashMap<String,String> schema;
}