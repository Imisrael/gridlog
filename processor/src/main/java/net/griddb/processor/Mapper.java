package net.griddb.gridlog.processor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import com.toshiba.mwcloud.gs.*;

class Mapper {

    public GSType columnType(String type) {

        switch(type) {
            case "integer":
                return GSType.INTEGER;
            case "timestamp":
                return GSType.TIMESTAMP;
            case "string":
                return GSType.STRING;
            case "bool":
                return GSType.BOOL;
        }
        return null;

    }
    public void setColumn(Row row, int index, Object value, String type) throws GSException {

    //    System.out.println("set Column("+index+") :"+type+" "+value);

        // Value can end up null if the regex group doesn't exist (for example, www in a URL)
        if (value == null){
            row.setNull(index);
            return;
        }
        String valString = value.toString();
        switch(type) {
            case "integer":
                row.setInteger(index, Integer.parseInt(valString));
                return;
            case "timestamp":
                row.setTimestamp(index, (Date)value);
                return;
            case "string":
                String strVal = (String) value;
                if (strVal.isEmpty()) 
                    row.setString(index, "emptyStr");
                else 
                    row.setString(index, strVal);
                return;
            case "bool":
                row.setBool(index, Boolean.parseBoolean(valString));
                return;
        }

    }
    public List<ColumnInfo> columnList(ArrayList<HashMap<String, String>> schema) {

        List<ColumnInfo> columns = new ArrayList<ColumnInfo>();

        for (HashMap<String, String> column : schema) {
            columns.add(new ColumnInfo(column.get("name"), columnType(column.get("type")))); 
        }  
        return columns;
    }

}
