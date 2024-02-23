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
            case "INTEGER":
                return GSType.INTEGER;
            case "TIMESTAMP":
                return GSType.TIMESTAMP;
            case "STRING":
                return GSType.STRING;
        }
        return null;

    }
    public void setColumn(Row row, int index, Object value, String type) throws GSException {

        System.out.println("set Column("+index+") :"+type+" "+value);
        switch(type) {
            case "INTEGER":
                String valString = value.toString();
                System.out.println(Integer.parseInt(valString));
                row.setInteger(index, Integer.parseInt(valString));
                return;
            case "TIMESTAMP":
                row.setTimestamp(index, (Date)value);
                return;
            case "STRING":
                row.setString(index, (String)value);
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
