package net.griddb.gridlog.processor;

import com.toshiba.mwcloud.gs.*;

class ConfigInfo {
    @RowKey String logtype;
    String file_path;
    Integer interval;
    Integer expiration_time;
    String partition_unit;
    Integer timestamp_position;
    String regex_format;
    String timestamp_format;
    String[] schema;
}
