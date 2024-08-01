package net.griddb.gridlog.processor;

import com.toshiba.mwcloud.gs.*;
import java.util.List;
import java.util.ArrayList;
import java.util.Date;
import java.util.Properties;

import java.util.HashMap;

import java.time.Instant;

class DB {

    public GridStore store;
    Instant lastPoll;

    public DB() throws GSException {

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

    public void setOffset(String containerName, Date offset) throws GSException {

        try {
            System.out.println("Setting " + containerName + " offset to " + offset);
            Collection<String, RawLogInfo> col = store.putCollection("RAWLOG_reads", RawLogInfo.class);
            RawLogInfo info = new RawLogInfo();
            info.name = containerName;
            info.timestamp = offset;
            col.setAutoCommit(false);
            col.put(info);
            col.commit();
        } catch (Exception e) {
            System.out.println("GridDB not writing offset");
            e.printStackTrace();
        }

    }

    public ArrayList<String> getRawLogContainers() throws GSException {
        ArrayList<String> retval = new ArrayList();
        Collection<String, RawLogInfo> col = store.getCollection("RAWLOG_writes", RawLogInfo.class);

        Query<RawLogInfo> query;

        if (col != null) {
            if (lastPoll == null)
                query = col.query("select *");
            else {
                // System.out.println("select * where timestamp >= TO_TIMESTAMP_MS(" + lastPoll
                // + ")");
                query = col.query("select * where timestamp >= TO_TIMESTAMP_MS(" + lastPoll.toEpochMilli() + ")");
            }
            RowSet<RawLogInfo> rs = query.fetch(false);
            while (rs.hasNext()) {
                retval.add(rs.next().name);
            }
            if (retval.size() > 0) {
                System.out.println("retval in getRawLogContainers() greater than zero");
                lastPoll = Instant.now();
            }

            return retval;
        } else {
            System.out.println("RAWLOG_Writes not created yet");
            return retval;
        }

    }

    public ArrayList<RawLog> getNewLogs(String containerName, Date after) throws GSException {

        Collection<String, RawLogInfo> rawLogInfo = store.putCollection("RAWLOG_reads", RawLogInfo.class);
        RawLogInfo logInfo = null;
        if (rawLogInfo != null) {
            Query<RawLogInfo> infoQuery = rawLogInfo.query("select * where name=\'" + containerName + "\'");
            RowSet<RawLogInfo> infoRs = infoQuery.fetch(false);
    
            
            if (infoRs.hasNext())
                logInfo = infoRs.next();
        } else {
            return new ArrayList<RawLog>();
        }


        ArrayList<RawLog> retval = new ArrayList<>();
        Collection<String, RawLog> rawLogCol = store.getCollection(containerName, RawLog.class);

        Query<RawLog> query;
        if (rawLogCol != null) {
            if (logInfo == null) {
                query = rawLogCol.query("select *");
            } else {
                System.out.println("select * where ts > TO_TIMESTAMP_MS(" + logInfo.timestamp.getTime() + ")");
                query = rawLogCol.query("select * where ts > TO_TIMESTAMP_MS(" + logInfo.timestamp.getTime() + ")");
            }
        } else {
            return new ArrayList<RawLog>();
        }


        RowSet<RawLog> rs = query.fetch(false);

        while (rs.hasNext()) {
            retval.add(rs.next());
        }
        if (retval.size() > 0)
            setOffset(containerName, retval.get(retval.size() - 1).ts);
        return retval;

    }

    public HashMap<String, ConfigInfo> readConfigs() throws GSException {
        HashMap<String, ConfigInfo> retval = new HashMap<String, ConfigInfo>();

        try {
            Collection<String, ConfigInfo> col = store.getCollection("configs", ConfigInfo.class);
            if (col != null) {
                Query<ConfigInfo> query;
                query = col.query("select *");

                RowSet<ConfigInfo> rs = query.fetch(false);
                while (rs.hasNext()) {
                    ConfigInfo row = rs.next();
                    String keyName = row.logtype;
                    retval.put(keyName, row);
                }
            } else {
                System.out.println("Configs not made yet");
                return retval;
            }

        } catch (GSException gse) {
            System.out.println("issue querying Configs container");
            gse.getMessage();
            return retval;
        }

        return retval;
    }
}
