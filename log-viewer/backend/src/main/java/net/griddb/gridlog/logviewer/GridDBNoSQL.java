package net.griddb.gridlog.logviewer;

import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import com.toshiba.mwcloud.gs.*;

import net.griddb.gridlog.logviewer.GridDBController.ConfigBody;

class GridDBNoSQL {

    public GridStore store = null;

    public GridDBNoSQL() throws GSException {

        try {
            Properties props = new Properties();
            props.setProperty("notificationMember", "griddb-server:10001");
            props.setProperty("clusterName", "myCluster");
            props.setProperty("user", "admin");
            props.setProperty("password", "admin");
            store = GridStoreFactory.getInstance().getGridStore(props);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    // type
    // path
    // interval
    // expiration_time
    // partition_unit
    // regex_format
    // timestamp_position
    // timestamp_format
    // schema string[]

    public void createConfigContainer(ConfigBody data) {

        String cn = "configs";

        // Make container if not exists
        try {
            ContainerInfo containerInfo = new ContainerInfo();
            List<ColumnInfo> columnList = new ArrayList<ColumnInfo>();
            columnList.add(new ColumnInfo("logtype", GSType.STRING));
            columnList.add(new ColumnInfo("file_path", GSType.STRING));
            columnList.add(new ColumnInfo("interval", GSType.INTEGER));
            columnList.add(new ColumnInfo("expiration_time", GSType.INTEGER));
            columnList.add(new ColumnInfo("partition_unit", GSType.INTEGER));
            columnList.add(new ColumnInfo("timestamp_position", GSType.INTEGER));
            columnList.add(new ColumnInfo("regex_format", GSType.STRING));
            columnList.add(new ColumnInfo("timestamp_format", GSType.STRING));
            columnList.add(new ColumnInfo("schema", GSType.STRING_ARRAY));
            containerInfo.setColumnInfoList(columnList);
            containerInfo.setRowKeyAssigned(true);

            store.putCollection(cn, containerInfo, false);
            System.out.println("Create Collection name=" + cn);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Add data
        try {
            Collection<String, Row> container = store.getCollection(cn);
            Row row = container.createRow();
            row.setString(0, data.logtype);
            row.setString(1, data.file_path);
            row.setInteger(2, data.interval);
            row.setInteger(3, data.expiration_time);
            row.setInteger(4, data.partition_unit);
            row.setInteger(5, data.timestamp_position);
            row.setString(6, data.regex_format);
            row.setString(7, data.timestamp_format);
            row.setStringArray(8, data.schemaArr);
            container.put(row);

            // Row row2 = container.get("zzervers");
            // String[] stringArray = row2.getStringArray(8);
            // System.out.print("Get Row (Array) stringArray=");
            // for ( String str : stringArray ){
            // System.out.print(str + ", ");
            // }

            container.close();
        } catch (Exception e) {
            System.out.println("Exception for getting collection container");
            e.printStackTrace();
        }

    }

    public List<String> getConfigKeyNames() {
        String cn = "configs";
        List<String> keyNames = new ArrayList<String>();
        try {
            Collection<String, ConfigInfo> container = store.getCollection(cn, ConfigInfo.class);
            Query<ConfigInfo> query = container.query("select *");
            RowSet<ConfigInfo> rs = query.fetch(false);
            while (rs.hasNext()) {
                keyNames.add(rs.next().logtype);
            }
        } catch (Exception e) {
            System.out.println("Error reading configs container");
            e.printStackTrace();
        }
        return keyNames;
    }

}
