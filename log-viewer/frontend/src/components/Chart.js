import React from 'react';
import { msToTime } from '../utils/General.tsx';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, } from 'recharts';


// clientIP: "185.134.22.149"
// contentLength: 568
// gzip: "1.86"
// hostname: "104.175.192.244"
// httpMethod: "GET"
// httpProtocol: "http"
// requestedURL: "/"
// statusCode: 200
// timestamp:"2024-01-28T18:01:24.000Z"
// userAgent:"Mozilla/5.0"


// const CustomizedLabelB = ({ kapi, metric, viewBox }) => {
//   return (
//       <Text
//           x={0}
//           y={0}
//           dx={-300}
//           dy={40}
//           textAnchor="start"
//           width={180}
//           transform="rotate(-90)"
//           // If I uncomment the next line, then the rotation stops working.
//           // scaleToFit={true}
//       >            
//           This_is_a_very_very_very_long_long_long_label_what_can_we_do_about_it?
//       </Text>
//   );
// };

export default function Chart({ data }) {
  if (data !== null) {
    if (Object.keys(data).length !== 0) {
      data.results.forEach(row => {
        let dateStr = new Date(row['timestamp']);
        let formattedTime = dateStr.toDateString() + " " + msToTime(dateStr.getTime());
        row['timestamp'] = formattedTime;
      })


      return (
        <LineChart
          width={1000}
          height={500}
          data={data.results}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" angle={-90} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      );
    } else {
      return (<></>);
    }
  }


}
