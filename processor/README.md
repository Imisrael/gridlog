

The log processor reads RAWLOG_writes where it gets a list of RAWLOG_$hostname_$logtype  containers to read individual log entries.

For each log entry it applies the rules in conf/config.json, where it uses Java regex and DataTimeFormatter strings to parse individual log entries and then dates within the log entry. Each regex string should have N-groups that match the N-columns definied in the schema. 

After mapping the log entries to a GridDB row, the are written to LOG_$hostname_$logtype and RAWLOG_reads is updated with the last time a specific rawlog was read.


