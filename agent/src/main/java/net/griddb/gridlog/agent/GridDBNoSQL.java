package net.griddb.gridlog.agent;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.ietf.jgss.GSSException;

import com.toshiba.mwcloud.gs.*;

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


    public RowSet<Row> readConfigs() throws GSSException {
        RowSet<Row> rs = null;
        try {
            Container<?, Row> container = store.getContainer("configs");
            Query<Row> query = container.query("SELECT *");
            rs = query.fetch();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return rs;
    }
}
