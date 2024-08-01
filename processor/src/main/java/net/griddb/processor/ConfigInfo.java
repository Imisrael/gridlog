package net.griddb.gridlog.processor;

import com.toshiba.mwcloud.gs.*;

class ConfigInfo {
    public @RowKey @NotNull String logtype ;
    public String file_path;
    public Integer interval;
    public Integer expiration_time;
    public String partition_unit;
    public Integer timestamp_position;
    public String regex_format;
    public String entry_sample;
    public String timestamp_format;
    public String[] schema;
}
