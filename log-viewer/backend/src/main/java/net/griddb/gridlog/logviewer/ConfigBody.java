package net.griddb.gridlog.logviewer;

import com.toshiba.mwcloud.gs.*;

public class ConfigBody {

    // 0  logtype               STRING          NN    [RowKey]
    // 1  file_path             STRING                
    // 2  interval              INTEGER               
    // 3  expiration_time       INTEGER               
    // 4  partition_unit        STRING                
    // 5  timestamp_position    INTEGER               
    // 6  regex_format          STRING                
    // 7  entry_sample          STRING                
    // 8  timestamp_format      STRING                
    // 9  schema                STRING_ARRAY    

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