package net.griddb.gridlog.agent;

import java.io.IOException;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

class GridDBWriter {

    String logtype;
    String hostname;
    String griddbURL;
    String path;

    public static final MediaType JSON = MediaType.get("application/json");

    public GridDBWriter(String hostname, String logtype, String path, String griddbURL) {
        this.logtype = logtype;
        this.griddbURL = griddbURL;
        this.path = path;
        this.hostname = hostname;

    }

    public static String getContainerName(String hostname, String logtype) {
        return "RAWLOG_" + hostname + "_" + logtype;
    }

    public String putRowString(String date, String hostname, String logtype, String value, String path) {
        return "["
                + "\"" + date + "\"" + ","
                + "\"" + hostname + "\"" + ","
                + "\"" + logtype + "\"" + ","
                + "\"" + value + "\"" + ","
                + "\"" + path + "\""
                + "]";
    }

    public String writeToContainerInfo(String timestamp, String hostname, String logtype) {
        String cn = getContainerName(hostname, logtype);
        return "["
                + "\"" + cn + "\"" + ","
                + "\"" + timestamp + "\""
                + "]";
    }

    static String createContainerJSON(String hostname, String logtype) {
        String cn = getContainerName(hostname, logtype);
        System.out.println("Creating container: " + cn);
        return "{\"container_name\": \"" + cn + "\","
                + "\"container_type\":\"COLLECTION\","
                + "\"rowkey\":false,"
                + "\"columns\":["
                + "{\"name\":\"ts\",\"type\":\"TIMESTAMP\"},{\"name\":\"hostname\",\"type\":\"STRING\"},{\"name\":\"logtype\",\"type\":\"STRING\"},{\"name\":\"value\",\"type\":\"STRING\"},{\"name\":\"path\",\"type\":\"STRING\"}"
                + "]}";
    }

    static String createCollectionContainerJSON() {
        return "{\"container_name\": \"" + "RAWLOG_writes" + "\","
                + "\"container_type\":\"COLLECTION\","
                + "\"rowkey\":true,"
                + "\"columns\":["
                + "{\"name\":\"name\",\"type\":\"STRING\"},{\"name\":\"timestamp\",\"type\":\"TIMESTAMP\"}"
                + "]}";
    }

    public void createRAWLOGWrites() {

        OkHttpClient client = new OkHttpClient();

        String row = createCollectionContainerJSON();

        RequestBody body = RequestBody.create(row, JSON);
        Request request = new Request.Builder()
                .url(griddbURL + "/griddb/v2/myCluster/dbs/public/containers/")
                .method("POST", body)
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Basic YWRtaW46YWRtaW4=")
                .build();
        try (Response response = client.newCall(request).execute()) {
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    public void createRAWLOG() {

        OkHttpClient client = new OkHttpClient();

        String row = createContainerJSON(hostname, logtype);

        RequestBody body = RequestBody.create(row, JSON);
        Request request = new Request.Builder()
                .url(griddbURL + "/griddb/v2/myCluster/dbs/public/containers/")
                .method("POST", body)
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Basic YWRtaW46YWRtaW4=")
                .build();
        try (Response response = client.newCall(request).execute()) {
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    public void writeLog(String value, String container_name) {
        OkHttpClient client = new OkHttpClient();

        String cn = "";

        if (container_name.equals("RAWLOG_writes")) {
            cn = "RAWLOG_writes";
        } else {
            cn = getContainerName(hostname, logtype);
        }

       // System.out.println("Writing to GridDB: " + "Container Name: " + cn + " value: " + value.length());

        RequestBody body = RequestBody.create(value, JSON);

        if (value.length() > 10000) {

        } else {
            Request request = new Request.Builder()
                    .url(griddbURL + "/griddb/v2/myCluster/dbs/public/containers/" + cn + "/rows")
                    .method("PUT", body)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Authorization", "Basic YWRtaW46YWRtaW4=")
                    .build();
            try (Response response = client.newCall(request).execute()) {
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

    }
}