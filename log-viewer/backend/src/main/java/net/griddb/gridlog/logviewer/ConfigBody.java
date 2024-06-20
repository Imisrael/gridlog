package net.griddb.gridlog.logviewer;

import com.toshiba.mwcloud.gs.*;

public class ConfigBody {
    public String logtype;
    public String regex_format;
    public int timestamp_position;
    public String entry_sample;
    public String timestamp_format;
    public String file_path;
    public int interval;
    public int expiration_time;
    public String partition_unit;
    public String[] schemaArr;
}