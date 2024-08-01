package net.griddb.gridlog.logviewer;

import java.util.Properties;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import com.toshiba.mwcloud.gs.*;
import java.util.Collections;

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


}
