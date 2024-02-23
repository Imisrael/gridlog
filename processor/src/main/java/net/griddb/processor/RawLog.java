package net.griddb.gridlog.processor;
import java.util.Date;
import com.toshiba.mwcloud.gs.NotNull;

    class RawLog {
        @NotNull Date ts;
        String hostname;
        String logtype;
        String value;
        String path;
    }

